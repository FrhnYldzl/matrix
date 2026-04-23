/**
 * Traction / EOS — Gino Wickman's operating system, adapted for Matrix.
 *
 * 5 cornerstones, each a tab in the "Captain's Log" (/traction):
 *   1. Rocks          — quarterly goals (90-Day) per owner
 *   2. Scorecard      — weekly numeric health, 13-week rolling
 *   3. Issues         — open operational/strategic issues, IDS framework
 *   4. Accountability — role → responsibilities (Accountability Chart)
 *   5. L10 Meeting    — weekly 90-min meeting agenda template
 *
 * Matrix adaptation:
 *   - Owners are workspace Agents (both human + AI)
 *   - Rocks drop into Goals/Orbits when completed; skip if quarter passes
 *   - Issues flow into Oracle's risk category as suggestions
 *   - L10 Meeting agenda is a Matrix workflow template
 */

export type Quarter = `${number} Q${1 | 2 | 3 | 4}`;

export interface Rock {
  id: string;
  workspaceId: string;
  quarter: Quarter;
  title: string;
  description: string;
  ownerName: string;
  ownerRole: string;
  ownerKind: "human" | "agent";
  status: "on-track" | "off-track" | "done" | "dropped";
  progressPct: number; // 0-100
  linkedGoalId?: string; // optional — cross-link to Prophecy goal
  milestones: { label: string; done: boolean; dueIso: string }[];
}

export interface ScorecardRow {
  id: string;
  workspaceId: string;
  metric: string;
  ownerName: string;
  unit: string; // "%", "USD", "count", "hours"
  target: number;
  weekly: number[]; // 13-week rolling, oldest → newest
  trend: "up" | "down" | "flat";
}

export interface Issue {
  id: string;
  workspaceId: string;
  title: string;
  raisedBy: string;
  raisedAtIso: string;
  category: "people" | "process" | "tech" | "customer" | "strategy";
  ids: "identify" | "discuss" | "solve" | "closed";
  priority: "high" | "medium" | "low";
  assigneeName?: string;
  note?: string;
}

export interface AccountabilityRole {
  id: string;
  workspaceId: string;
  role: string; // "Visionary", "Integrator", "Sales Lead"
  ownerName: string;
  ownerKind: "human" | "agent";
  topAccountabilities: string[]; // 3-5 bullet responsibilities
  reportsToRoleId?: string;
  sits: "executive" | "department" | "individual";
}

export interface L10AgendaItem {
  id: string;
  label: string;
  minutes: number;
  description: string;
}

// ---------------------------------------------------------------------------
// L10 agenda template — canonical 90-min EOS meeting
// ---------------------------------------------------------------------------

export const l10Agenda: L10AgendaItem[] = [
  {
    id: "l10-01",
    label: "Segue",
    minutes: 5,
    description: "Good news · personal + business (1 dakika/kişi)",
  },
  {
    id: "l10-02",
    label: "Scorecard",
    minutes: 5,
    description: "13-week rolling scoreboard — off-track olanı Issues'a düşür",
  },
  {
    id: "l10-03",
    label: "Rock Review",
    minutes: 5,
    description: "Her rock'ı 'on-track' / 'off-track' diye işaretle — off-track olanı Issues'a düşür",
  },
  {
    id: "l10-04",
    label: "Customer / Employee Headlines",
    minutes: 5,
    description: "Şirketin müşteri/çalışan radarında duyulan dikkate değer hikâyeler",
  },
  {
    id: "l10-05",
    label: "To-Do List",
    minutes: 5,
    description: "Geçen haftanın to-do'ları — tamamlanan / devretlen",
  },
  {
    id: "l10-06",
    label: "IDS · Identify · Discuss · Solve",
    minutes: 60,
    description:
      "Asıl etüt saati. Issues list'i önceliğe göre sırala, en kritik olanı IDS'le — kök sebebi bul, tartış, aksiyona dönüştür.",
  },
  {
    id: "l10-07",
    label: "Conclude",
    minutes: 5,
    description: "To-Do recap · cascading mesajlar · rating (1-10)",
  },
];

// ---------------------------------------------------------------------------
// Seed data — Ferhan · Core workspace
// ---------------------------------------------------------------------------

const WS = "ws-ferhan-core";
const CURRENT_QUARTER: Quarter = "2026 Q2";

export const rocks: Rock[] = [
  {
    id: "rock-q2-01",
    workspaceId: WS,
    quarter: CURRENT_QUARTER,
    title: "Müşteri Success paketini canlıya al",
    description:
      "The Keymaker'daki CS blueprint'i Ferhan · Core'a kur, 5 ajan + 7 skill + 3 workflow operasyonel olsun.",
    ownerName: "Ferhan Y.",
    ownerRole: "Visionary",
    ownerKind: "human",
    status: "on-track",
    progressPct: 68,
    linkedGoalId: "goal-cs-launch",
    milestones: [
      { label: "Blueprint review + onay", done: true, dueIso: "2026-04-08" },
      { label: "3 agent live", done: true, dueIso: "2026-04-15" },
      { label: "5 agent + tüm skill'ler", done: false, dueIso: "2026-05-02" },
      { label: "İlk 10 customer conversation", done: false, dueIso: "2026-05-20" },
      { label: "Retro + kalıcı otomasyon", done: false, dueIso: "2026-06-28" },
    ],
  },
  {
    id: "rock-q2-02",
    workspaceId: WS,
    quarter: CURRENT_QUARTER,
    title: "SaaS pilot — 3 ödeyen müşteri",
    description:
      "Matrix-OS'ın enterprise pilot versiyonu, 3 ödeyen müşteriyle MVP trafiği başlat.",
    ownerName: "Business Exec",
    ownerRole: "Integrator",
    ownerKind: "agent",
    status: "on-track",
    progressPct: 42,
    linkedGoalId: "goal-saas-mvp",
    milestones: [
      { label: "Fiyatlandırma + kontrat şablonu", done: true, dueIso: "2026-04-12" },
      { label: "2 warm intro → pilot demo", done: true, dueIso: "2026-04-22" },
      { label: "1. müşteri signed", done: false, dueIso: "2026-05-10" },
      { label: "2. + 3. müşteri signed", done: false, dueIso: "2026-06-15" },
    ],
  },
  {
    id: "rock-q2-03",
    workspaceId: WS,
    quarter: CURRENT_QUARTER,
    title: "Haftalık 10+ saat kaldıraç",
    description:
      "Sistem Ferhan'a haftalık 10+ saat delegasyon kapasitesi kazandırsın. Oracle önerilerinin %60'ı kabul edilsin.",
    ownerName: "Orchestrator",
    ownerRole: "Integrator",
    ownerKind: "agent",
    status: "on-track",
    progressPct: 74,
    linkedGoalId: "goal-leverage",
    milestones: [
      { label: "Leverage 5 sa/hafta'ya ulaş", done: true, dueIso: "2026-04-05" },
      { label: "7.4 sa/hafta (mevcut)", done: true, dueIso: "2026-04-23" },
      { label: "10+ sa/hafta (hedef)", done: false, dueIso: "2026-06-20" },
    ],
  },
  {
    id: "rock-q2-04",
    workspaceId: WS,
    quarter: CURRENT_QUARTER,
    title: "Agent error oranını %5'in altına çek",
    description:
      "Nebuchadnezzar'daki son 30 gün hata oranı %11. Patterns'a göre golden test suite genişlet + retry patterns ekle.",
    ownerName: "Ops Coordinator",
    ownerRole: "Ops",
    ownerKind: "agent",
    status: "off-track",
    progressPct: 30,
    linkedGoalId: "goal-error-rate",
    milestones: [
      { label: "En çok hata veren 3 pattern tespit", done: true, dueIso: "2026-04-10" },
      { label: "Golden test coverage +%40", done: false, dueIso: "2026-05-05" },
      { label: "Retry + fallback impl.", done: false, dueIso: "2026-05-25" },
      { label: "30g hata oranı <%5", done: false, dueIso: "2026-06-28" },
    ],
  },
  {
    id: "rock-q2-05",
    workspaceId: WS,
    quarter: CURRENT_QUARTER,
    title: "Ayda 3+ yeni skill merge et",
    description:
      "Oracle Forge'un üretkenlik kapasitesi ayda 3+ skill. Şu an 2/3 kvota — Q2 sonunda 9+ skill'e ulaş.",
    ownerName: "The Archive",
    ownerRole: "Knowledge",
    ownerKind: "agent",
    status: "on-track",
    progressPct: 56,
    milestones: [
      { label: "Nisan: 3 skill", done: true, dueIso: "2026-04-30" },
      { label: "Mayıs: 3 skill", done: false, dueIso: "2026-05-31" },
      { label: "Haziran: 3 skill", done: false, dueIso: "2026-06-30" },
    ],
  },
];

export const scorecardRows: ScorecardRow[] = [
  {
    id: "sc-leverage",
    workspaceId: WS,
    metric: "Kaldıraç (sa/hafta)",
    ownerName: "Orchestrator",
    unit: "sa",
    target: 10,
    weekly: [3.2, 3.6, 4.1, 4.8, 5.4, 5.9, 6.2, 6.5, 6.8, 7.0, 7.1, 7.3, 7.4],
    trend: "up",
  },
  {
    id: "sc-agent-errors",
    workspaceId: WS,
    metric: "Agent hata oranı",
    ownerName: "Ops Coordinator",
    unit: "%",
    target: 5,
    weekly: [8, 9, 10, 11, 13, 12, 11, 12, 11, 12, 11, 11, 11],
    trend: "flat",
  },
  {
    id: "sc-oracle-acc",
    workspaceId: WS,
    metric: "Oracle kabul oranı",
    ownerName: "The Oracle",
    unit: "%",
    target: 60,
    weekly: [41, 44, 47, 50, 52, 54, 55, 57, 58, 60, 62, 63, 65],
    trend: "up",
  },
  {
    id: "sc-budget-spend",
    workspaceId: WS,
    metric: "Haftalık harcama",
    ownerName: "The Tribute",
    unit: "USD",
    target: 800,
    weekly: [960, 910, 880, 850, 830, 810, 790, 770, 760, 755, 740, 735, 720],
    trend: "down",
  },
  {
    id: "sc-cs-cases",
    workspaceId: WS,
    metric: "CS otomatik çözülen ticket",
    ownerName: "Customer Success",
    unit: "count",
    target: 40,
    weekly: [0, 0, 3, 6, 9, 12, 15, 18, 22, 25, 28, 32, 36],
    trend: "up",
  },
  {
    id: "sc-pipeline-revenue",
    workspaceId: WS,
    metric: "Pipeline gelir (USD)",
    ownerName: "Business Exec",
    unit: "USD",
    target: 45000,
    weekly: [
      12000, 13500, 15800, 17200, 19000, 21500, 24000, 27000, 30500, 33000,
      35500, 38000, 41200,
    ],
    trend: "up",
  },
  {
    id: "sc-new-skills",
    workspaceId: WS,
    metric: "Yeni skill merge",
    ownerName: "The Archive",
    unit: "count",
    target: 3,
    weekly: [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    trend: "flat",
  },
];

export const issues: Issue[] = [
  {
    id: "iss-01",
    workspaceId: WS,
    title: "CS ajanının %70+ güvenle yanıtladığı ticket'ta bile escalation tetikleniyor",
    raisedBy: "Ferhan Y.",
    raisedAtIso: "2026-04-22T10:30:00Z",
    category: "process",
    ids: "discuss",
    priority: "high",
    assigneeName: "Ops Coordinator",
    note: "Escalation threshold'u %85'e çekmek istiyorum, golden test'ler bunu doğruluyor.",
  },
  {
    id: "iss-02",
    workspaceId: WS,
    title: "HubSpot rate-limit arttı — 5 dakikada bir restart yeterli değil",
    raisedBy: "Ops Coordinator",
    raisedAtIso: "2026-04-21T16:45:00Z",
    category: "tech",
    ids: "solve",
    priority: "high",
    assigneeName: "TrainStation",
    note: "Paid tier + local cache katmanı gerekli. 48 saat içinde üst kata alınacak.",
  },
  {
    id: "iss-03",
    workspaceId: WS,
    title: "Sales-qualifier ajanının outbound tone'u bazen agresif geliyor",
    raisedBy: "Business Exec",
    raisedAtIso: "2026-04-20T09:15:00Z",
    category: "customer",
    ids: "identify",
    priority: "medium",
    note: "2 prospect'ten 'too salesy' feedback. Prompt'u ince ayar gerek.",
  },
  {
    id: "iss-04",
    workspaceId: WS,
    title: "Q2 Rock #04 (hata oranı) planlanandan 3 hafta geride",
    raisedBy: "Ferhan Y.",
    raisedAtIso: "2026-04-23T08:00:00Z",
    category: "strategy",
    ids: "discuss",
    priority: "high",
    assigneeName: "Ferhan Y.",
    note: "Ya kapsam daraltılmalı ya da ek engineering kapasitesi lazım.",
  },
  {
    id: "iss-05",
    workspaceId: WS,
    title: "The Tribute'ta % ROI hesaplaması — tek workspace revenue baz alıyor, yanıltıcı",
    raisedBy: "Ferhan Y.",
    raisedAtIso: "2026-04-19T14:30:00Z",
    category: "tech",
    ids: "identify",
    priority: "medium",
    note: "Multi-workspace attribution gerekli.",
  },
  {
    id: "iss-06",
    workspaceId: WS,
    title: "MLX LM connector authorize adımı sık başarısız",
    raisedBy: "Ops Coordinator",
    raisedAtIso: "2026-04-18T11:00:00Z",
    category: "tech",
    ids: "identify",
    priority: "low",
    note: "Apple Silicon-only kısıt — dokümantasyon yetersiz.",
  },
  {
    id: "iss-07",
    workspaceId: WS,
    title: "Haftalık L10 meeting cron ayarı henüz yok",
    raisedBy: "Ferhan Y.",
    raisedAtIso: "2026-04-22T07:30:00Z",
    category: "process",
    ids: "identify",
    priority: "low",
    note: "Pazartesi 09:30'da tekrar eden workflow kurulacak.",
  },
  {
    id: "iss-08",
    workspaceId: WS,
    title: "The Source filter panel mobile'da scroll yapmıyor",
    raisedBy: "Ferhan Y.",
    raisedAtIso: "2026-04-23T09:00:00Z",
    category: "tech",
    ids: "closed",
    priority: "low",
    note: "Responsive fix yapıldı — verify gerek.",
  },
];

export const accountabilityRoles: AccountabilityRole[] = [
  {
    id: "acc-visionary",
    workspaceId: WS,
    role: "Visionary",
    ownerName: "Ferhan Y.",
    ownerKind: "human",
    topAccountabilities: [
      "Stratejik DNA (Prime Program) + 3-yıl hedefi",
      "Kurumsal kültür + değerlerin sahipliği",
      "Büyük müşteri/investor ilişkileri",
      "Yeni pazar/ürün fırsatı taraması (Hunter/Scout)",
    ],
    sits: "executive",
  },
  {
    id: "acc-integrator",
    workspaceId: WS,
    role: "Integrator",
    ownerName: "Orchestrator",
    ownerKind: "agent",
    topAccountabilities: [
      "Günlük/haftalık operasyon akışı (P&L, plan-to-actual)",
      "Rock'lar + Scorecard'ın sahipliği",
      "Departman liderlerinin koordinasyonu",
      "L10 meeting'i yürütme",
    ],
    reportsToRoleId: "acc-visionary",
    sits: "executive",
  },
  {
    id: "acc-sales",
    workspaceId: WS,
    role: "Sales Lead",
    ownerName: "Business Exec",
    ownerKind: "agent",
    topAccountabilities: [
      "Pipeline generation + qualification",
      "Kontrat + fiyatlama + closing",
      "Account expansion + churn önleme",
    ],
    reportsToRoleId: "acc-integrator",
    sits: "department",
  },
  {
    id: "acc-ops",
    workspaceId: WS,
    role: "Ops Lead",
    ownerName: "Ops Coordinator",
    ownerKind: "agent",
    topAccountabilities: [
      "Sistem uptime + hata oranı takibi",
      "Audit log + incident response",
      "Connector sağlığı + rate-limit yönetimi",
    ],
    reportsToRoleId: "acc-integrator",
    sits: "department",
  },
  {
    id: "acc-cs",
    workspaceId: WS,
    role: "Customer Success Lead",
    ownerName: "Customer Success",
    ownerKind: "agent",
    topAccountabilities: [
      "Onboarding + ticket triage otomasyonu",
      "NPS + retention takibi",
      "Escalation patterns + golden test coverage",
    ],
    reportsToRoleId: "acc-integrator",
    sits: "department",
  },
  {
    id: "acc-knowledge",
    workspaceId: WS,
    role: "Knowledge & Archive Lead",
    ownerName: "The Archive",
    ownerKind: "agent",
    topAccountabilities: [
      "Skill/Agent/Workflow kataloğu sağlığı",
      "Blueprint'lerin canonical şablon güncelliği",
      "Oracle Forge üretim kalitesi",
    ],
    reportsToRoleId: "acc-integrator",
    sits: "department",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function rocksForWorkspace(wsId: string, quarter: Quarter = CURRENT_QUARTER): Rock[] {
  return rocks.filter((r) => r.workspaceId === wsId && r.quarter === quarter);
}

export function scorecardForWorkspace(wsId: string): ScorecardRow[] {
  return scorecardRows.filter((r) => r.workspaceId === wsId);
}

export function issuesForWorkspace(wsId: string): Issue[] {
  return issues.filter((i) => i.workspaceId === wsId);
}

export function accountabilityForWorkspace(wsId: string): AccountabilityRole[] {
  return accountabilityRoles.filter((r) => r.workspaceId === wsId);
}

export function scorecardHealth(row: ScorecardRow): "on-track" | "at-risk" | "off-track" {
  const latest = row.weekly[row.weekly.length - 1];
  const target = row.target;
  const ratio = latest / target;
  // Some metrics target-down (lower = better): agent-errors, weekly-spend
  const targetDown = row.metric.includes("hata") || row.metric.includes("harcama");
  if (targetDown) {
    if (latest <= target) return "on-track";
    if (latest <= target * 1.3) return "at-risk";
    return "off-track";
  }
  if (ratio >= 0.9) return "on-track";
  if (ratio >= 0.65) return "at-risk";
  return "off-track";
}
