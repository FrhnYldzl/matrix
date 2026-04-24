/**
 * Matrix Gamification — rank + XP + achievement sistemi.
 *
 * Holdco operator'un portfolio büyüdükçe kazandığı Matrix evreninde
 * canon rank'lar. Dil "productivity gamification" değil, Matrix lore.
 *
 *   Red Pilled (0 XP)  → henüz başlıyorsun, ilk asset kurmadın
 *   Operator (100 XP)  → ilk workspace aktif, ritüel başladı
 *   Freeborn (500 XP)  → 3+ workspace, çoklu asset portföyü
 *   Captain (2K XP)    → 5+ workspace, $10K+/ay portföy MRR
 *   Neo (10K XP)       → 10+ workspace, $50K+/ay, ilk exit
 *
 * Her achievement bir XP verir + Matrix quote ile toast basar.
 */

export type MatrixRank = "red-pilled" | "operator" | "freeborn" | "captain" | "neo";

export interface RankDef {
  rank: MatrixRank;
  label: string;
  tagline: string;
  matrixQuote: string;
  speaker: string;
  minXp: number;
  nextRank?: MatrixRank;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
}

export const RANK_LADDER: RankDef[] = [
  {
    rank: "red-pilled",
    label: "Red Pilled",
    tagline: "Kırmızı hapı yuttun. Matrix'i yeni fark ettin.",
    matrixQuote: "Follow the white rabbit.",
    speaker: "Trinity",
    minXp: 0,
    nextRank: "operator",
    tone: "crimson",
  },
  {
    rank: "operator",
    label: "Operator",
    tagline: "İlk workspace'in ayağa kalktı. Matrix'i operasyonel kullanıyorsun.",
    matrixQuote: "I hope you're ready, because if you're not, we're all gonna die.",
    speaker: "Tank",
    minXp: 100,
    nextRank: "freeborn",
    tone: "ion",
  },
  {
    rank: "freeborn",
    label: "Freeborn",
    tagline: "Zion'da doğmuş gibisin. 3+ asset paralel yönetebilirsin.",
    matrixQuote: "Some believe we will never have peace — until our human race is exterminated. I believe we can coexist.",
    speaker: "Commander Lock",
    minXp: 500,
    nextRank: "captain",
    tone: "quantum",
  },
  {
    rank: "captain",
    label: "Captain",
    tagline: "Artık bir gemin var — Morpheus gibi crew koordine ediyorsun.",
    matrixQuote: "What is the Matrix? Control.",
    speaker: "Morpheus",
    minXp: 2000,
    nextRank: "neo",
    tone: "nebula",
  },
  {
    rank: "neo",
    label: "Neo",
    tagline: "The One. Portföy seviyene ulaşan çok az holdco operator var.",
    matrixQuote: "I know what I have to do.",
    speaker: "Neo",
    minXp: 10000,
    tone: "nebula",
  },
];

export function rankFromXp(xp: number): RankDef {
  let current = RANK_LADDER[0];
  for (const r of RANK_LADDER) {
    if (xp >= r.minXp) current = r;
  }
  return current;
}

export function progressToNextRank(xp: number): {
  current: RankDef;
  next: RankDef | null;
  xpInCurrent: number;
  xpNeededForNext: number;
  pct: number;
} {
  const current = rankFromXp(xp);
  if (!current.nextRank) {
    return { current, next: null, xpInCurrent: xp - current.minXp, xpNeededForNext: 0, pct: 100 };
  }
  const next = RANK_LADDER.find((r) => r.rank === current.nextRank)!;
  const xpInCurrent = xp - current.minXp;
  const xpNeededForNext = next.minXp - current.minXp;
  const pct = Math.min(100, (xpInCurrent / xpNeededForNext) * 100);
  return { current, next, xpInCurrent, xpNeededForNext, pct };
}

// ───────────────────────────────────────────────────────────────────────────
// Achievements — kazanılabilir milestone'lar
// ───────────────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  label: string;
  description: string;
  xp: number;
  icon: "🔑" | "🎯" | "⚡" | "🌊" | "🪐" | "🕶️" | "💊" | "🛠️" | "📡" | "🎬";
  category: "setup" | "ritual" | "growth" | "mastery";
  /** Matrix quote eşliği — achievement toast'ında gösterilir */
  matrixLine?: { quote: string; speaker: string };
}

export const ACHIEVEMENTS: Achievement[] = [
  // Setup
  {
    id: "first-workspace",
    label: "İlk Workspace",
    description: "İlk asset Matrix'e eklendi.",
    xp: 100,
    icon: "🔑",
    category: "setup",
    matrixLine: { quote: "Every key is a door.", speaker: "The Keymaker" },
  },
  {
    id: "first-blueprint",
    label: "İlk Blueprint Kuruldu",
    description: "The Keymaker'dan ilk departman 12 dakikada kuruldu.",
    xp: 150,
    icon: "🛠️",
    category: "setup",
  },
  {
    id: "first-agent-live",
    label: "İlk Canlı Ajan",
    description: "Bir ajan gerçek Claude çağrısı yaptı — Matrix nefes aldı.",
    xp: 200,
    icon: "⚡",
    category: "setup",
    matrixLine: { quote: "Welcome to the real world.", speaker: "Morpheus" },
  },
  {
    id: "dna-written",
    label: "DNA Yazıldı",
    description: "The Prime Program'da mission + vision + temalar tanımlandı.",
    xp: 80,
    icon: "💊",
    category: "setup",
  },
  {
    id: "first-connector",
    label: "İlk Köprü",
    description: "TrainStation'da ilk gerçek connector (Stripe / Notion / Gmail) bağlandı.",
    xp: 120,
    icon: "📡",
    category: "setup",
  },

  // Ritual
  {
    id: "first-l10",
    label: "İlk L10 Meeting",
    description: "İlk Level 10 meeting tamamlandı — kaptan ritüeli başladı.",
    xp: 150,
    icon: "🎯",
    category: "ritual",
  },
  {
    id: "l10-streak-5",
    label: "L10 Streak · 5 Hafta",
    description: "5 hafta üst üste Pazartesi 09:30 L10 meeting.",
    xp: 300,
    icon: "🎯",
    category: "ritual",
  },
  {
    id: "oracle-10-accepted",
    label: "Oracle Öğrencisi",
    description: "10 Oracle önerisi kabul edildi — AI yönlendirmesini öğreniyorsun.",
    xp: 200,
    icon: "🕶️",
    category: "ritual",
  },
  {
    id: "weekly-review-4",
    label: "4 Haftalık Review",
    description: "4 hafta üst üste The Truth'ta haftalık retro + kaldıraç ölçümü.",
    xp: 180,
    icon: "🌊",
    category: "ritual",
  },

  // Growth
  {
    id: "second-workspace",
    label: "Portföy Başladı",
    description: "2. workspace eklendi — artık tek asset değilsin.",
    xp: 250,
    icon: "🪐",
    category: "growth",
  },
  {
    id: "third-workspace",
    label: "Freeborn",
    description: "3. workspace — çoklu asset portföyüne geçtin.",
    xp: 400,
    icon: "🪐",
    category: "growth",
  },
  {
    id: "first-revenue",
    label: "İlk Dolar",
    description: "Matrix'e bağlı bir asset'ten The Tribute'a ilk gerçek gelir düştü.",
    xp: 500,
    icon: "🎬",
    category: "growth",
    matrixLine: {
      quote: "There's a difference between knowing the path and walking the path.",
      speaker: "Morpheus",
    },
  },

  // Mastery
  {
    id: "first-exit",
    label: "İlk Exit",
    description: "Bir asset marketplace'de satıldı — Matrix'in bir ürününü clean cycle ile teslim ettin.",
    xp: 2000,
    icon: "🎬",
    category: "mastery",
    matrixLine: {
      quote: "I know what I have to do.",
      speaker: "Neo",
    },
  },
  {
    id: "fifty-k-mrr",
    label: "$50K MRR",
    description: "Portföy toplam $50K/ay recurring revenue'ya ulaştı.",
    xp: 3000,
    icon: "🪐",
    category: "mastery",
  },
];

/**
 * Mevcut workspace sayısı + kabul edilmiş suggestion sayısı + başka sinyallerle
 * toplam XP tahmin et. Gerçek persistence DB'ye geçince bu server-side olur,
 * şimdilik client-side hesaplar.
 */
export function estimateXp(params: {
  workspaceCount: number;
  acceptedSuggestions: number;
  createdSkills: number;
  createdWorkflows: number;
}): number {
  const { workspaceCount, acceptedSuggestions, createdSkills, createdWorkflows } = params;
  let xp = 0;
  // Every workspace past the first is a big lever
  if (workspaceCount >= 1) xp += 100; // first-workspace
  if (workspaceCount >= 2) xp += 250; // second-workspace
  if (workspaceCount >= 3) xp += 400; // freeborn
  if (workspaceCount >= 5) xp += 500;
  // Oracle acceptance
  xp += Math.min(acceptedSuggestions, 20) * 20;
  // Forged skills/workflows
  xp += createdSkills * 15;
  xp += createdWorkflows * 25;
  return xp;
}
