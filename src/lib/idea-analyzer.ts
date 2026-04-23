/**
 * Oracle Idea Analyzer — local rule engine.
 *
 * Takes a raw user idea (title + short description) and produces a full
 * "project dossier": matched business model, execution type, resource
 * profile, 4-phase roadmap, go/no-go, 6-axis health score, related
 * blueprints + vision template suggestion.
 *
 * Template-first today; later swappable with Claude API for richer analysis.
 */

import {
  businessModels,
  type BusinessModel,
  type ExecutionType,
  type ResourceProfile,
  type RoadmapStep,
} from "./business-library";
import { blueprints, type Blueprint } from "./blueprints";

export interface IdeaInput {
  title: string;
  description: string;
}

export interface HealthAxis {
  key:
    | "tam"
    | "defensibility"
    | "monetization"
    | "founder-fit"
    | "unit-economics"
    | "speed";
  label: string;
  score: number; // 0-100
  rationale: string;
}

export interface IdeaAnalysis {
  input: IdeaInput;
  matchedModel: BusinessModel;
  matchConfidence: number; // 0-100
  alternativeModels: { model: BusinessModel; score: number }[];
  executionType: ExecutionType;
  digitalRevenueShare: number; // 0-100
  resourceProfile: ResourceProfile;
  roadmap: RoadmapStep[];
  goNoGo: string[];
  healthScore: number; // 0-100 weighted average
  healthAxes: HealthAxis[];
  verdict: "go" | "promising" | "needs-work" | "skip";
  relatedBlueprints: Blueprint[];
  visionSuggestion: {
    mission: string;
    vision: string;
    themes: { label: string; description: string; weight: number }[];
  };
  summary: string;
}

/* --------------------------------------------------------------- */
/*  Keyword dictionaries (TR + EN friendly)                        */
/* --------------------------------------------------------------- */

// Each modelId → signal words (lowercased). When any word is found in
// the idea text, we add its weight to the model's score.
const modelSignals: Record<string, { word: string; weight: number }[]> = {
  "bm-vertical-saas": [
    { word: "saas", weight: 3 },
    { word: "yazılım", weight: 2 },
    { word: "software", weight: 2 },
    { word: "platform", weight: 2 },
    { word: "klinik", weight: 3 },
    { word: "apartman", weight: 3 },
    { word: "emlak", weight: 3 },
    { word: "hukuk", weight: 3 },
    { word: "restoran", weight: 3 },
    { word: "dental", weight: 3 },
    { word: "b2b", weight: 2 },
    { word: "workflow", weight: 1 },
    { word: "yönetici", weight: 2 },
  ],
  "bm-marketplace": [
    { word: "marketplace", weight: 4 },
    { word: "pazaryeri", weight: 4 },
    { word: "freelance", weight: 2 },
    { word: "hizmet", weight: 1 },
    { word: "eşleş", weight: 2 },
    { word: "alıcı", weight: 1 },
    { word: "satıcı", weight: 1 },
  ],
  "bm-creator-economy": [
    { word: "creator", weight: 3 },
    { word: "yaratıcı", weight: 2 },
    { word: "youtube", weight: 2 },
    { word: "podcast", weight: 2 },
    { word: "newsletter", weight: 3 },
    { word: "influencer", weight: 2 },
    { word: "blog", weight: 1 },
    { word: "içerik", weight: 1 },
  ],
  "bm-dtc": [
    { word: "marka", weight: 1 },
    { word: "ürün", weight: 1 },
    { word: "dtc", weight: 3 },
    { word: "d2c", weight: 3 },
    { word: "ecommerce", weight: 1 },
  ],
  "bm-boutique-consulting": [
    { word: "danışmanlık", weight: 4 },
    { word: "consulting", weight: 4 },
    { word: "ajans", weight: 2 },
    { word: "agency", weight: 2 },
    { word: "servis", weight: 1 },
    { word: "hizmet", weight: 1 },
  ],
  "bm-ai-native-tool": [
    { word: "ai", weight: 2 },
    { word: "yapay zeka", weight: 3 },
    { word: "llm", weight: 3 },
    { word: "gpt", weight: 2 },
    { word: "claude", weight: 2 },
    { word: "otomatik", weight: 1 },
    { word: "asistan", weight: 1 },
  ],
  "bm-subscription-commerce": [
    { word: "abonelik", weight: 3 },
    { word: "subscription", weight: 3 },
    { word: "kutu", weight: 2 },
    { word: "box", weight: 1 },
    { word: "aylık", weight: 1 },
  ],
  "bm-platform-plugin": [
    { word: "plugin", weight: 3 },
    { word: "eklenti", weight: 3 },
    { word: "shopify app", weight: 3 },
    { word: "chrome extension", weight: 3 },
    { word: "notion template", weight: 2 },
    { word: "add-on", weight: 2 },
  ],
  "bm-affiliate": [
    { word: "affiliate", weight: 4 },
    { word: "komisyon", weight: 3 },
    { word: "seo", weight: 2 },
    { word: "niche site", weight: 3 },
    { word: "inceleme", weight: 2 },
  ],
  "bm-print-on-demand": [
    { word: "pod", weight: 4 },
    { word: "print-on-demand", weight: 4 },
    { word: "tişört", weight: 3 },
    { word: "mug", weight: 2 },
    { word: "tasarım", weight: 1 },
    { word: "etsy", weight: 2 },
  ],
  "bm-shopify-brand": [
    { word: "shopify", weight: 4 },
    { word: "dropship", weight: 3 },
    { word: "mağaza", weight: 1 },
  ],
  "bm-amazon-fba": [
    { word: "amazon", weight: 3 },
    { word: "fba", weight: 4 },
    { word: "private label", weight: 3 },
  ],
};

// Physical-hint words — push execution type toward hybrid/physical
const physicalWords = [
  "fabrika", "depo", "kargo", "stok", "üretim", "restoran",
  "mağaza", "fiziksel", "ofis", "saha", "teslim", "kurye",
  "envanter", "lojistik", "paketleme", "atölye", "dükkan",
];

/* --------------------------------------------------------------- */
/*  Main analyzer                                                  */
/* --------------------------------------------------------------- */

export function analyzeIdea(input: IdeaInput): IdeaAnalysis {
  const text = `${input.title} ${input.description}`.toLowerCase();

  // 1) Score all models
  const modelScores: { model: BusinessModel; score: number }[] = businessModels.map(
    (m) => {
      const signals = modelSignals[m.id] || [];
      let score = 0;
      signals.forEach((s) => {
        if (text.includes(s.word)) score += s.weight;
      });
      return { model: m, score };
    }
  );
  modelScores.sort((a, b) => b.score - a.score);

  // If nothing matched strongly, default to vertical-saas (most generic useful)
  let best = modelScores[0];
  if (!best || best.score === 0) {
    best = { model: businessModels.find((m) => m.id === "bm-vertical-saas")!, score: 1 };
  }
  const topScore = best.score;
  const runnerUp = modelScores[1]?.score || 0;
  const matchConfidence = Math.min(
    100,
    Math.round((topScore / Math.max(topScore + runnerUp, 1)) * 100)
  );

  // 2) Execution type — prefer model's own if present; otherwise infer
  let executionType: ExecutionType = best.model.executionType ?? "hybrid";
  const physicalHitCount = physicalWords.reduce(
    (n, w) => (text.includes(w) ? n + 1 : n),
    0
  );
  if (physicalHitCount >= 3) executionType = "physical-heavy";
  else if (physicalHitCount >= 1 && executionType === "digital-only")
    executionType = "hybrid";

  const digitalRevenueShare = best.model.digitalRevenueShare
    ?? (executionType === "digital-only"
      ? 98
      : executionType === "hybrid"
      ? 82
      : 45);

  // 3) Resource profile — take model's default if any, otherwise construct
  const resourceProfile: ResourceProfile = best.model.resourceProfile
    ? { ...best.model.resourceProfile }
    : defaultResourceProfile(executionType);

  // 4) Roadmap — use model's recommended blueprint names to hint at delivery
  const roadmap = generateRoadmap(input, best.model, executionType);

  // 5) Go/no-go questions
  const goNoGo = generateGoNoGo(best.model, executionType, physicalHitCount);

  // 6) Health score (6 axes)
  const healthAxes = scoreHealth(input, best.model, matchConfidence, physicalHitCount);
  const healthScore = Math.round(
    healthAxes.reduce((s, a) => s + a.score, 0) / healthAxes.length
  );

  // 7) Verdict
  const verdict: IdeaAnalysis["verdict"] =
    healthScore >= 75
      ? "go"
      : healthScore >= 60
      ? "promising"
      : healthScore >= 45
      ? "needs-work"
      : "skip";

  // 8) Related blueprints
  const relatedBlueprints = best.model.recommendedBlueprints
    .map((id) => blueprints.find((b) => b.id === id))
    .filter(Boolean) as Blueprint[];

  // 9) Vision suggestion — seed from model, inject user title
  const visionSuggestion = customizeVisionTemplate(best.model, input);

  // 10) Summary line
  const summary = buildSummary(best.model, executionType, healthScore, matchConfidence);

  return {
    input,
    matchedModel: best.model,
    matchConfidence,
    alternativeModels: modelScores.slice(1, 3).filter((m) => m.score > 0),
    executionType,
    digitalRevenueShare,
    resourceProfile,
    roadmap,
    goNoGo,
    healthScore,
    healthAxes,
    verdict,
    relatedBlueprints,
    visionSuggestion,
    summary,
  };
}

/* --------------------------------------------------------------- */
/*  Helpers                                                        */
/* --------------------------------------------------------------- */

function defaultResourceProfile(exec: ExecutionType): ResourceProfile {
  if (exec === "digital-only") {
    return {
      capital: { level: "low", minUsd: 500, maxUsd: 5000, note: "Hosting + domain + ilk aylarda ads" },
      time: { hoursPerWeek: { min: 15, max: 30 }, weeksToMvp: { min: 4, max: 10 } },
      physicalPresence: "none",
      humanSkills: ["Ürün vizyonu", "Temel pazarlama", "Hızlı iterasyon"],
      tools: ["Next.js", "Supabase", "Stripe", "Analytics"],
      digitalTasks: ["MVP geliştirme", "Landing + onboarding", "İlk 10 kullanıcı"],
    };
  }
  if (exec === "hybrid") {
    return {
      capital: { level: "medium", minUsd: 3000, maxUsd: 25000, note: "İlk stok/tedarikçi + yazılım + ads" },
      time: { hoursPerWeek: { min: 20, max: 40 }, weeksToMvp: { min: 6, max: 14 } },
      physicalPresence: "occasional",
      humanSkills: ["Tedarikçi müzakere", "Operasyon disiplini", "Pazarlama"],
      tools: ["Shopify veya custom store", "Stripe", "Ads platformu"],
      digitalTasks: ["Store + ads + email", "Müşteri hizmetleri", "Analitik"],
      physicalTasks: ["Tedarikçi seçimi", "Kalite kontrol", "Kargo/iade"],
    };
  }
  return {
    capital: { level: "high", minUsd: 15000, maxUsd: 100000, note: "Fiziksel altyapı + envanter + lokasyon" },
    time: { hoursPerWeek: { min: 30, max: 60 }, weeksToMvp: { min: 10, max: 24 } },
    physicalPresence: "regular",
    humanSkills: ["Saha yönetimi", "Operasyon", "Müşteri hizmetleri"],
    tools: ["POS", "Inventory software", "Accounting"],
    digitalTasks: ["Dijital pazarlama", "Online sipariş", "CRM"],
    physicalTasks: ["Lokasyon kurulum", "Ekip yönetimi", "Günlük operasyon"],
  };
}

function generateRoadmap(
  input: IdeaInput,
  model: BusinessModel,
  exec: ExecutionType
): RoadmapStep[] {
  return [
    {
      phase: "validate",
      month: "0-1 ay",
      action: `10 potansiyel kullanıcıyla görüş; "${input.title.slice(0, 40)}" fikrinin gerçek bir acısı var mı?`,
      deliverable: "Problem-solution fit raporu · 3 design partner taahhüdü",
    },
    {
      phase: "build",
      month: "1-3 ay",
      action:
        exec === "digital-only"
          ? `MVP: tek workflow + kayıt akışı + ilk 3 entegrasyon`
          : exec === "hybrid"
          ? `MVP: store/app + tedarikçi zinciri + ilk 100 unit`
          : `Prototip: fiziksel deneme + temel dijital operasyon katmanı`,
      deliverable: "3 design partner canlı kullanıyor · 1 döngü tamamlanmış",
    },
    {
      phase: "launch",
      month: "3-6 ay",
      action: `Ücretli pilotlar + ilk organik büyüme · ${model.northStar} izle`,
      deliverable: "$5-15K MRR/net · NPS ≥ 50 · referans pipe kuruldu",
    },
    {
      phase: "scale",
      month: "6-12 ay",
      action: `${model.name} için standart paketleme + 2. workflow + ekip kurulumu`,
      deliverable: "$30K+ MRR/net · Seri A hazır veya bootstrap profitable",
    },
  ];
}

function generateGoNoGo(
  model: BusinessModel,
  exec: ExecutionType,
  physicalHits: number
): string[] {
  const base: string[] = [
    `${model.name} modelinin temel varsayımlarını kabul ediyor musun (${model.northStar} önde)?`,
    "İlk 5 design partner'ı 30 günde bulabilir misin?",
    "Unit ekonomisinin kapanabileceğine dair somut bir hipotezin var mı?",
  ];
  if (exec !== "digital-only" || physicalHits > 0) {
    base.push(
      "Fiziksel tarafı (tedarikçi, kargo, depo, saha) yöneten bir insanın var mı veya bu rolü kendi üzerinde alacak mısın?"
    );
  }
  if (model.capitalIntensity === "high") {
    base.push("İlk 9 ay için yeterli sermayen / erişimin var mı?");
  }
  base.push("Bu fikirden vazgeçmen için kaç hafta denemek doğru — ön kesinti tarihin var mı?");
  return base;
}

function scoreHealth(
  input: IdeaInput,
  model: BusinessModel,
  matchConfidence: number,
  physicalHits: number
): HealthAxis[] {
  const textLen = input.description.length;
  const hasSpecifics = /\d|%|\$|TL|müşteri|kullanıcı/.test(input.description);

  const axes: HealthAxis[] = [
    {
      key: "tam",
      label: "Pazar Büyüklüğü",
      score:
        model.id.includes("consulting")
          ? 55
          : model.id.includes("vertical-saas") || model.id.includes("marketplace")
          ? 80
          : 65,
      rationale:
        model.id.includes("vertical-saas")
          ? "Dikey SaaS'ların TAM'ı $5-50B arasında; yeterince büyük."
          : model.id.includes("consulting")
          ? "Danışmanlık doğası gereği scale sınırlı; insan-saat bağımlı."
          : "Pazar orta-büyük ölçekte.",
    },
    {
      key: "defensibility",
      label: "Savunulabilirlik",
      score:
        model.defensibility.toLowerCase().includes("ağ etkisi")
          ? 85
          : model.defensibility.toLowerCase().includes("marka")
          ? 70
          : 55,
      rationale: model.defensibility,
    },
    {
      key: "monetization",
      label: "Monetizasyon Netliği",
      score: model.revenuePattern === "subscription" ? 85 : model.revenuePattern === "take-rate" ? 75 : 65,
      rationale: `Revenue pattern: ${model.revenuePattern}. North Star: ${model.northStar}.`,
    },
    {
      key: "founder-fit",
      label: "Founder-Market Fit",
      score: hasSpecifics ? 70 : 50,
      rationale: hasSpecifics
        ? "Açıklama spesifik detaylar içeriyor — domain bilgisi sinyali."
        : "Açıklamada pazara özel detay az — domain bilgisini kanıtlamak gerekiyor.",
    },
    {
      key: "unit-economics",
      label: "Unit Ekonomisi Makullük",
      score:
        model.capitalIntensity === "low"
          ? 80
          : model.capitalIntensity === "medium"
          ? 65
          : 50,
      rationale:
        model.capitalIntensity === "high"
          ? "Yüksek sermaye yoğunluğu — unit ekonomisi ilk aylarda gergin olabilir."
          : "Sermaye yoğunluğu makul, unit ekonomisi erken kapanabilir.",
    },
    {
      key: "speed",
      label: "Hız ve Test Edilebilirlik",
      score:
        physicalHits === 0 ? 85 : physicalHits <= 2 ? 70 : 50,
      rationale:
        physicalHits === 0
          ? "Tamamen dijital — hafta cinsinden test ve iterasyon mümkün."
          : `Fiziksel bileşenler (${physicalHits} sinyal) hızı yavaşlatabilir.`,
    },
  ];

  // Soft penalty if match confidence very low
  if (matchConfidence < 40) {
    axes.forEach((a) => (a.score = Math.max(30, a.score - 10)));
  }
  // Soft boost if text is very detailed
  if (textLen > 250) {
    axes.forEach((a) => (a.score = Math.min(100, a.score + 3)));
  }
  return axes;
}

function customizeVisionTemplate(model: BusinessModel, input: IdeaInput) {
  const t = model.visionTemplate;
  // Replace [niş] / [kategori] / [sektör] etc. tokens with the idea title
  const insert = input.title.trim();
  const fill = (s: string) =>
    s
      .replace(/\[[^\]]+\]/g, insert)
      .replace(/\.$/, "")
      .concat(".");
  return {
    mission: fill(t.mission),
    vision: fill(t.vision),
    themes: t.themes.map((th) => ({
      label: th.label,
      description: th.description || "",
      weight: th.weight,
    })),
  };
}

function buildSummary(
  model: BusinessModel,
  exec: ExecutionType,
  health: number,
  confidence: number
): string {
  const execLabel =
    exec === "digital-only" ? "100% dijital" : exec === "hybrid" ? "hibrit" : "fiziksel ağırlıklı";
  const verdict =
    health >= 75 ? "güçlü potansiyel" : health >= 60 ? "umut verici" : health >= 45 ? "iyileştirme gerek" : "şu an riskli";
  return `Bu fikir ${model.name} arketipinde, ${execLabel} (%${confidence} eşleşme güveni) ve Matrix'in kaba taraması ${verdict} diyor (skor %${health}).`;
}
