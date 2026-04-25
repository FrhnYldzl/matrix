/**
 * The Dopamine Engine — Matrix'in davranışsal çekirdeği.
 *
 * Ferhan'ın direktifi: "Matrix'i daha fazla kullanmak, başarmak, başarttırmak
 * için algoritma gelişmeli. DOPAMİN!"
 *
 * Bu motor event-driven çalışır — her anlamlı aksiyon bir `DopamineEvent`
 * olarak kaydedilir. Event stream'in üzerine 4 katman kurulu:
 *
 *   1. XP + Rank         → gamification.ts ile köprü, ama artık EVENT-BASED
 *                          (estimateXp static heuristic değil, gerçek action sum)
 *   2. Streak            → ardışık gün sayısı, kırılma tehditi
 *   3. Near-miss         → "next rank/achievement'e X XP kaldı"
 *   4. Celebration       → variable reward + matrix quote + confetti
 *
 * Psikoloji:
 *   - Variable reward: bazı aksiyonlar "surprise bonus" verir
 *   - Loss aversion: streak kırılacaksa TopBar'da soğuk mavi uyarı
 *   - Near-miss effect: rank threshold'a <%10 kalınca ekstra parlama
 *   - Micro-celebration: her aksiyon kendi toast'ını alır (kısa, sıcak)
 *   - Macro-celebration: rank-up + achievement için screen-wide overlay
 *
 * Not: Motor STATE-LESS. Store (`store.ts`) event array'i tutar, bu modül
 * sadece pure function'lar sağlar. Toast emission `recordAction` içinde
 * (store taraftarı) olur ki middleware gibi davransın.
 */

import { RANK_LADDER, rankFromXp, progressToNextRank, type RankDef } from "./gamification";

// ═══════════════════════════════════════════════════════════════════════════
// Event taxonomy — Matrix'te XP doğuran her aksiyon
// ═══════════════════════════════════════════════════════════════════════════

export type DopamineEventKind =
  // Setup
  | "workspace.created"
  | "workspace.onboarded" // Oracle interview tamamlandı
  | "department.created"
  | "agent.created"
  | "skill.created"
  | "workflow.created"
  | "goal.created"
  | "rock.created"
  | "task.created"
  | "connector.attached"
  // Operation
  | "agent.invoked"
  | "skill.executed"
  | "workflow.run"
  | "goal.progressed" // metric updated
  | "goal.completed"
  | "rock.milestone.done"
  | "rock.completed"
  | "task.started"
  | "task.completed"
  | "approval.given"
  | "oracle.suggestion.accepted"
  | "oracle.suggestion.dismissed"
  | "forge.used" // Oracle Forge natural language → entity
  // Ritual
  | "weekly.review.completed"
  | "l10.meeting.completed"
  | "prime.program.block.done"
  // Revenue
  | "revenue.recorded" // first $ / weekly rollup
  // Meta
  | "daily.login"
  | "streak.day";

export interface DopamineEvent {
  id: string;
  kind: DopamineEventKind;
  workspaceId?: string;
  /** Base XP awarded for this event */
  xp: number;
  /** Surprise bonus on top of base (variable reward) */
  bonus?: number;
  /** ISO timestamp */
  at: string;
  /** Free-form meta for replaying celebrations */
  meta?: Record<string, string | number | boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════
// XP Table — base yield per action
// Küçük aksiyonlar küçük ama SIK XP verir → sürekli micro-reward.
// Büyük milestone'lar büyük XP + macro-celebration tetikler.
// ═══════════════════════════════════════════════════════════════════════════

export const XP_TABLE: Record<DopamineEventKind, number> = {
  // Setup (bir kez / asset başına)
  "workspace.created": 100,
  "workspace.onboarded": 80,
  "department.created": 10,
  "agent.created": 15,
  "skill.created": 15,
  "workflow.created": 25,
  "goal.created": 20,
  "rock.created": 30,
  "task.created": 3,
  "connector.attached": 40,

  // Operation (tekrar eden — hafif)
  "agent.invoked": 2,
  "skill.executed": 3,
  "workflow.run": 5,
  "goal.progressed": 8,
  "goal.completed": 200,
  "rock.milestone.done": 50,
  "rock.completed": 400,
  "task.started": 1,
  "task.completed": 5,
  "approval.given": 3,
  "oracle.suggestion.accepted": 20,
  "oracle.suggestion.dismissed": 0,
  "forge.used": 30,

  // Ritual
  "weekly.review.completed": 150,
  "l10.meeting.completed": 100,
  "prime.program.block.done": 20,

  // Revenue (en önemli — Matrix'in varlık nedeni)
  "revenue.recorded": 250,

  // Meta
  "daily.login": 5,
  "streak.day": 10,
};

// ═══════════════════════════════════════════════════════════════════════════
// Variable reward — "surprise bonus" (Skinner box)
// Aksiyonların ~%15'i tetiklenir, base XP'yi 1.5-3x'ler. Öngörülemez ödül
// insan beynini en bağımlı yapan şey. Ama abartma: streak gelince söner.
// ═══════════════════════════════════════════════════════════════════════════

export function rollBonus(base: number, opts?: { force?: boolean }): number {
  if (opts?.force) return Math.round(base * 2);
  // %15 şans
  if (Math.random() < 0.15) {
    const multiplier = 1.5 + Math.random() * 1.5; // 1.5x to 3x
    return Math.round(base * multiplier) - base; // sadece "bonus" kısmı
  }
  return 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// XP computation — event stream'den toplam
// Static `estimateXp` yerine gerçek events toplamı. Geriye dönük uyumluluk
// için fallback (events boş ise) estimateXp ile harmanlanabilir.
// ═══════════════════════════════════════════════════════════════════════════

export function totalXp(events: DopamineEvent[]): number {
  return events.reduce((sum, e) => sum + e.xp + (e.bonus ?? 0), 0);
}

export function xpInLastDays(events: DopamineEvent[], days: number): number {
  const cutoff = Date.now() - days * 86400000;
  return events
    .filter((e) => new Date(e.at).getTime() >= cutoff)
    .reduce((sum, e) => sum + e.xp + (e.bonus ?? 0), 0);
}

export function xpToday(events: DopamineEvent[]): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const cutoff = start.getTime();
  return events
    .filter((e) => new Date(e.at).getTime() >= cutoff)
    .reduce((sum, e) => sum + e.xp + (e.bonus ?? 0), 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// Streak — consecutive days with at least 1 XP event
// Kırılma tehdidi insan beynini çalıştırır: "sakın bugün kaçırma"
// ═══════════════════════════════════════════════════════════════════════════

export interface StreakState {
  /** Current consecutive days (including today if active) */
  currentDays: number;
  /** Longest ever streak */
  longestDays: number;
  /** Does today have ≥1 event already? */
  activeToday: boolean;
  /** Hours left until streak dies (if no action today) */
  hoursUntilLoss: number;
  /** Is streak at risk (no action today AND <6h left)? */
  atRisk: boolean;
}

export function computeStreak(events: DopamineEvent[]): StreakState {
  if (events.length === 0) {
    return { currentDays: 0, longestDays: 0, activeToday: false, hoursUntilLoss: 24, atRisk: false };
  }

  // Day-bucket unique
  const dayKeys = new Set(
    events.map((e) => {
      const d = new Date(e.at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  // Walk backward from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const activeToday = dayKeys.has(todayKey);

  let current = 0;
  const cursor = new Date(today);
  // If not active today, start counting from yesterday (streak still alive until midnight)
  if (!activeToday) cursor.setDate(cursor.getDate() - 1);

  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (dayKeys.has(key)) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest — scan every day bucket, find longest run
  const sortedDays = Array.from(dayKeys)
    .map((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m, d).getTime();
    })
    .sort((a, b) => a - b);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] - sortedDays[i - 1] === 86400000) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  if (sortedDays.length === 0) longest = 0;

  // Hours until loss
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const hoursUntilLoss = activeToday
    ? 24 // safe
    : Math.max(0, (endOfDay.getTime() - now.getTime()) / 3600000);
  const atRisk = !activeToday && hoursUntilLoss < 6 && current > 0;

  return {
    currentDays: current,
    longestDays: Math.max(longest, current),
    activeToday,
    hoursUntilLoss,
    atRisk,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Near-miss — rank'e kaç XP kaldı, kritik eşiğe yakın mıyız?
// ═══════════════════════════════════════════════════════════════════════════

export interface NearMiss {
  xp: number;
  current: RankDef;
  next: RankDef | null;
  xpUntilNext: number;
  /** 0-100, next rank'e ne kadar yaklaştın */
  pct: number;
  /** <10% kalınca true — UI parlatma sebebi */
  critical: boolean;
  /** pill-ready string: "Captain'a 18 XP" */
  label: string;
}

export function nearMiss(events: DopamineEvent[]): NearMiss {
  const xp = totalXp(events);
  const prog = progressToNextRank(xp);
  const xpUntilNext = prog.next ? prog.xpNeededForNext - prog.xpInCurrent : 0;
  const critical = prog.next != null && xpUntilNext > 0 && xpUntilNext <= prog.xpNeededForNext * 0.1;
  const label = prog.next
    ? `${prog.next.label}'a ${xpUntilNext} XP`
    : "Neo · maxed";
  return { xp, current: prog.current, next: prog.next, xpUntilNext, pct: prog.pct, critical, label };
}

// ═══════════════════════════════════════════════════════════════════════════
// Celebration profiles — hangi event, nasıl coşsun?
// ═══════════════════════════════════════════════════════════════════════════

export type CelebrationIntensity = "micro" | "mid" | "macro";

export interface CelebrationProfile {
  intensity: CelebrationIntensity;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  /** Toast title formatter — receives the event meta */
  titleFor: (xp: number, bonus: number) => string;
  description?: string;
  quote?: { line: string; speaker: string };
  /** Trigger screen-wide effect */
  fullScreen?: boolean;
}

const QUOTES = {
  revenue: { line: "There's a difference between knowing the path and walking the path.", speaker: "Morpheus" },
  goalComplete: { line: "I know what I have to do.", speaker: "Neo" },
  rockComplete: { line: "Hope is the quintessential human delusion — and Matrix just made it real.", speaker: "The Architect" },
  ritual: { line: "Temet nosce — know thyself.", speaker: "The Oracle" },
  forge: { line: "Every key is a door.", speaker: "The Keymaker" },
  firstAgent: { line: "Welcome to the real world.", speaker: "Morpheus" },
} as const;

export const CELEBRATION_MAP: Partial<Record<DopamineEventKind, CelebrationProfile>> = {
  "workspace.created": {
    intensity: "mid",
    tone: "quantum",
    titleFor: (xp, bonus) => `+${xp + bonus} XP · yeni asset portföyde`,
    quote: QUOTES.firstAgent,
  },
  "workspace.onboarded": {
    intensity: "macro",
    tone: "quantum",
    titleFor: (xp, bonus) => `🚀 Oracle kurulumu bitti · +${xp + bonus} XP`,
    quote: { line: "I'm trying to free your mind, Neo.", speaker: "Morpheus" },
    fullScreen: true,
  },
  "skill.created": {
    intensity: "micro",
    tone: "nebula",
    titleFor: (xp, bonus) => `+${xp + bonus} XP · skill forged`,
  },
  "agent.created": {
    intensity: "micro",
    tone: "ion",
    titleFor: (xp, bonus) => `+${xp + bonus} XP · agent canlı`,
  },
  "workflow.created": {
    intensity: "micro",
    tone: "quantum",
    titleFor: (xp, bonus) => `+${xp + bonus} XP · workflow hazır`,
  },
  "goal.completed": {
    intensity: "macro",
    tone: "quantum",
    titleFor: (xp, bonus) => `🎯 Hedef düştü · +${xp + bonus} XP`,
    quote: QUOTES.goalComplete,
    fullScreen: true,
  },
  "rock.completed": {
    intensity: "macro",
    tone: "nebula",
    titleFor: (xp, bonus) => `⛰️ Rock tamamlandı · +${xp + bonus} XP`,
    quote: QUOTES.rockComplete,
    fullScreen: true,
  },
  "revenue.recorded": {
    intensity: "macro",
    tone: "solar",
    titleFor: (xp, bonus) => `💰 Gelir kaydedildi · +${xp + bonus} XP`,
    quote: QUOTES.revenue,
    fullScreen: true,
  },
  "forge.used": {
    intensity: "mid",
    tone: "nebula",
    titleFor: (xp, bonus) => `✨ Oracle Forge · +${xp + bonus} XP`,
    quote: QUOTES.forge,
  },
  "connector.attached": {
    intensity: "mid",
    tone: "ion",
    titleFor: (xp, bonus) => `🔌 Köprü kuruldu · +${xp + bonus} XP`,
    description: "TrainStation'da yeni connector aktif — agent'lar artık dış dünyaya uzanabilir.",
  },
  "oracle.suggestion.accepted": {
    intensity: "micro",
    tone: "nebula",
    titleFor: (xp, bonus) => `+${xp + bonus} XP · Oracle kabul`,
  },
  "weekly.review.completed": {
    intensity: "mid",
    tone: "ion",
    titleFor: (xp, bonus) => `📊 Haftalık review · +${xp + bonus} XP`,
    quote: QUOTES.ritual,
  },
  "l10.meeting.completed": {
    intensity: "mid",
    tone: "ion",
    titleFor: (xp, bonus) => `🎯 L10 tamamlandı · +${xp + bonus} XP`,
    quote: QUOTES.ritual,
  },
  "prime.program.block.done": {
    intensity: "micro",
    tone: "nebula",
    titleFor: (xp, bonus) => `+${xp + bonus} XP · ritual işlendi`,
  },
  "task.started": {
    intensity: "micro",
    tone: "ion",
    titleFor: () => "▶ task başladı",
  },
  "goal.progressed": {
    intensity: "micro",
    tone: "quantum",
    titleFor: (xp, bonus) => `+${xp + bonus} XP · OKR ilerledi`,
  },
  "task.completed": {
    intensity: "micro",
    tone: "quantum",
    titleFor: (xp, bonus) =>
      bonus > 0 ? `+${xp + bonus} XP ✨ bonus!` : `+${xp} XP · task done`,
  },
};

/**
 * Rank-up celebration — sıradan aksiyonun üstüne, rank sınırı aşıldıysa
 * ekstra full-screen overlay tetikler.
 */
export function detectRankUp(oldXp: number, newXp: number): RankDef | null {
  const oldRank = rankFromXp(oldXp);
  const newRank = rankFromXp(newXp);
  if (oldRank.rank !== newRank.rank) return newRank;
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Daily quests — günlük 3 micro-mission (reset ile)
// ═══════════════════════════════════════════════════════════════════════════

export interface DailyQuest {
  id: string;
  label: string;
  description: string;
  targetKind: DopamineEventKind;
  targetCount: number;
  xpReward: number;
  icon: string;
}

export const DAILY_QUEST_POOL: DailyQuest[] = [
  {
    id: "dq-touch-oracle",
    label: "Oracle ile konuş",
    description: "Bugün 1 Oracle önerisi kabul et veya reddet — sinyal ver.",
    targetKind: "oracle.suggestion.accepted",
    targetCount: 1,
    xpReward: 30,
    icon: "🕶️",
  },
  {
    id: "dq-forge-entity",
    label: "Bir şey üret",
    description: "1 skill, agent veya workflow yarat — Matrix büyüsün.",
    targetKind: "skill.created",
    targetCount: 1,
    xpReward: 40,
    icon: "🔑",
  },
  {
    id: "dq-close-3-tasks",
    label: "3 task kapat",
    description: "Operator'da 3 görev tamamla — momentum.",
    targetKind: "task.completed",
    targetCount: 3,
    xpReward: 50,
    icon: "✅",
  },
  {
    id: "dq-progress-goal",
    label: "Hedefini yaklaştır",
    description: "1 OKR metriğini güncelle — sapma görünmez kalmasın.",
    targetKind: "goal.progressed",
    targetCount: 1,
    xpReward: 35,
    icon: "🎯",
  },
  {
    id: "dq-run-workflow",
    label: "Workflow tetikle",
    description: "1 workflow çalıştır — ritim mekanikleşsin.",
    targetKind: "workflow.run",
    targetCount: 1,
    xpReward: 25,
    icon: "⚡",
  },
];

/**
 * Bugünün 3 quest'ini seç — deterministic (seed: bugünün tarihi) ki
 * sayfalar arası aynı quest'leri gösteren motor olsun.
 */
export function todaysQuests(): DailyQuest[] {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const shuffled = [...DAILY_QUEST_POOL];
  // Fisher-Yates with seeded pseudo-random
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

export interface QuestProgress {
  quest: DailyQuest;
  progress: number;
  done: boolean;
  pct: number;
}

export function questProgress(
  quests: DailyQuest[],
  events: DopamineEvent[]
): QuestProgress[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const cutoff = start.getTime();
  const todayEvents = events.filter((e) => new Date(e.at).getTime() >= cutoff);

  return quests.map((q) => {
    const hits = todayEvents.filter((e) => e.kind === q.targetKind).length;
    const progress = Math.min(hits, q.targetCount);
    const done = progress >= q.targetCount;
    const pct = Math.round((progress / q.targetCount) * 100);
    return { quest: q, progress, done, pct };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

export function newEventId(): string {
  return `dop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Ana factory — store tarafından çağrılır. Base XP'yi XP_TABLE'dan çeker,
 * variable bonus rulosu atar, event'i inşa eder. Toast'ı store yapar (bu
 * modül pure kalsın).
 */
export function makeEvent(
  kind: DopamineEventKind,
  opts?: {
    workspaceId?: string;
    forceBonus?: boolean;
    meta?: Record<string, string | number | boolean>;
  }
): DopamineEvent {
  const base = XP_TABLE[kind];
  const bonus = rollBonus(base, { force: opts?.forceBonus });
  return {
    id: newEventId(),
    kind,
    workspaceId: opts?.workspaceId,
    xp: base,
    bonus: bonus || undefined,
    at: new Date().toISOString(),
    meta: opts?.meta,
  };
}

/**
 * Weekly recap — haftanın özeti (streak anlatımı için).
 */
export interface WeeklyRecap {
  totalXp: number;
  eventCount: number;
  topKind: { kind: DopamineEventKind; count: number } | null;
  streakDays: number;
  rankDelta: { from: RankDef; to: RankDef } | null;
}

export function weeklyRecap(
  events: DopamineEvent[],
  priorWeekEvents: DopamineEvent[]
): WeeklyRecap {
  const cutoff = Date.now() - 7 * 86400000;
  const week = events.filter((e) => new Date(e.at).getTime() >= cutoff);
  const total = week.reduce((s, e) => s + e.xp + (e.bonus ?? 0), 0);

  const counts = new Map<DopamineEventKind, number>();
  week.forEach((e) => counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1));
  let topKind: WeeklyRecap["topKind"] = null;
  counts.forEach((count, kind) => {
    if (!topKind || count > topKind.count) topKind = { kind, count };
  });

  const streak = computeStreak(events);

  // Rank delta — prior week vs current
  const priorXp = priorWeekEvents.reduce((s, e) => s + e.xp + (e.bonus ?? 0), 0);
  const currentXp = totalXp(events);
  const priorRank = rankFromXp(priorXp);
  const currentRank = rankFromXp(currentXp);
  const rankDelta =
    priorRank.rank !== currentRank.rank ? { from: priorRank, to: currentRank } : null;

  return {
    totalXp: total,
    eventCount: week.length,
    topKind,
    streakDays: streak.currentDays,
    rankDelta,
  };
}

// Re-export for convenience
export { RANK_LADDER } from "./gamification";
