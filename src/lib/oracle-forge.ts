/**
 * Oracle Forge — "vibe coding" modu.
 *
 * Kullanıcı doğal dille bir niyet yazıyor:
 *   "Her gün Twitter'dan AI haberlerini çekip bana özet atsın"
 *
 * Oracle bunu canonical bir entity'ye çeviriyor:
 *   → kind: skill
 *   → name: "daily-ai-news-summarizer"
 *   → displayName: "Daily AI News Summarizer"
 *   → summary: ...
 *   → scopes: ["read", "external-send"]
 *   → modelPreference: "sonnet"
 *
 * Matrix'in LAM (Large Action Model) doğasını somutlaştırır —
 * intent → action structure.
 *
 * Modlar:
 *   - rule-based (default, offline)
 *   - claude-enhanced (ANTHROPIC_API_KEY varsa, future sprint)
 */

export type ForgeKind = "skill" | "agent" | "workflow";

export interface ForgeRequest {
  kind: ForgeKind;
  /** Kullanıcının doğal-dil açıklaması */
  intent: string;
  /** Opsiyonel context — workspace, niş, mevcut skill'ler */
  context?: {
    workspaceName?: string;
    niche?: string;
    existingSkills?: string[]; // name listesi, agent skill picking için
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Output types — her kind için
// ───────────────────────────────────────────────────────────────────────────

export interface ForgedSkill {
  kind: "skill";
  name: string;
  displayName: string;
  summary: string;
  inputs: { name: string; type: string; description: string }[];
  outputs: { name: string; type: string; description: string }[];
  scopes: Array<"read" | "write" | "external-send">;
  modelPreference: "opus" | "sonnet" | "haiku";
  requiredConnectors: string[]; // örn. ["c-twitter", "c-slack"]
  confidence: number;
  reasoning: string;
}

export interface ForgedAgent {
  kind: "agent";
  name: string;
  displayName: string;
  role: string;
  summary: string;
  personaPrompt: string; // system prompt for Claude
  recommendedSkills: string[]; // canonical skill isim önerileri
  model: "opus" | "sonnet" | "haiku";
  confidence: number;
  reasoning: string;
}

export interface ForgedWorkflow {
  kind: "workflow";
  name: string;
  displayName: string;
  summary: string;
  cadence: string;
  steps: Array<{
    kind: "trigger" | "skill" | "integration" | "approval" | "notify" | "condition";
    label: string;
    note?: string;
  }>;
  requiresApproval: boolean;
  confidence: number;
  reasoning: string;
}

export type ForgedEntity = ForgedSkill | ForgedAgent | ForgedWorkflow;

// ───────────────────────────────────────────────────────────────────────────
// Heuristics — intent'ten sinyal çıkart
// ───────────────────────────────────────────────────────────────────────────

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function detectScopes(intent: string): Array<"read" | "write" | "external-send"> {
  const i = intent.toLowerCase();
  const scopes: Array<"read" | "write" | "external-send"> = ["read"];
  if (/(yaz|üret|oluştur|create|write|draft)/.test(i)) scopes.push("write");
  if (/(gönder|send|yolla|publish|post|email|slack|tweet|mesaj)/.test(i))
    scopes.push("external-send");
  return scopes;
}

function detectConnectors(intent: string): string[] {
  const i = intent.toLowerCase();
  const map: Record<string, string> = {
    slack: "c-slack",
    notion: "c-notion",
    gmail: "c-gmail",
    "e-?mail": "c-gmail",
    stripe: "c-stripe",
    hubspot: "c-hubspot",
    linear: "c-linear",
    github: "c-github",
    youtube: "c-youtube",
    twitter: "c-twitter",
    "x\\.com": "c-twitter",
    shopify: "c-shopify",
    printful: "c-printful",
    beehiiv: "c-beehiiv",
    intercom: "c-intercom",
    anthropic: "c-claude",
    claude: "c-claude",
    openai: "c-openai",
    google: "c-google-ads",
    meta: "c-meta-ads",
  };
  const hits = new Set<string>();
  for (const [pattern, id] of Object.entries(map)) {
    if (new RegExp(pattern).test(i)) hits.add(id);
  }
  return [...hits];
}

function detectCadence(intent: string): string {
  const i = intent.toLowerCase();
  if (/(her gün|daily|günlük)/.test(i)) return "cron:0 9 * * *";
  if (/(her hafta|haftalık|weekly|pazartesi|monday)/.test(i))
    return "cron:0 9 * * 1";
  if (/(her ay|aylık|monthly)/.test(i)) return "cron:0 9 1 * *";
  if (/(webhook|gelince|event)/.test(i)) return "webhook:auto";
  if (/(manual|tetiklediğimde|ben başlatınca)/.test(i)) return "manual";
  return "cron:0 9 * * 1"; // default weekly
}

function detectModel(intent: string, scopes: string[]): "opus" | "sonnet" | "haiku" {
  const i = intent.toLowerCase();
  // Karar / muhakeme / uzun bağlam → Opus
  if (/(muhakeme|karar|analiz|strateji|reason|decide|analyze|research)/.test(i))
    return "opus";
  // Kısa triage / sınıflandırma → Haiku
  if (/(triage|kategori|sınıf|etiket|flag|classify|label|parse|extract)/.test(i))
    return "haiku";
  // Default → Sonnet (dengeli)
  return "sonnet";
}

// ───────────────────────────────────────────────────────────────────────────
// Forge engine
// ───────────────────────────────────────────────────────────────────────────

export function forge(request: ForgeRequest): ForgedEntity {
  const { kind, intent } = request;
  const trimmed = intent.trim();

  if (trimmed.length < 10) {
    return errorForgery(kind, "Intent çok kısa — en az 10 karakter olmalı");
  }

  switch (kind) {
    case "skill":
      return forgeSkill(request);
    case "agent":
      return forgeAgent(request);
    case "workflow":
      return forgeWorkflow(request);
  }
}

function forgeSkill(request: ForgeRequest): ForgedSkill {
  const { intent } = request;
  const scopes = detectScopes(intent);
  const model = detectModel(intent, scopes);
  const connectors = detectConnectors(intent);

  // İlk 3-5 kelimeyi display name yap
  const words = intent
    .replace(/[.,;:!?]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const shortLabel = words.slice(0, 5).join(" ");
  const name = kebab(shortLabel) || "custom-skill";
  const displayName = capitalizeWords(shortLabel);

  // Inputs/outputs — heuristic-based
  const inputs = [
    { name: "input", type: "string", description: "Skill'e verilen ana girdi" },
  ];
  const outputs = [
    { name: "result", type: "string", description: "Skill'in ürettiği canonical çıktı" },
  ];
  if (/özet|summary/.test(intent.toLowerCase())) {
    outputs[0].name = "summary";
    outputs[0].description = "Özet metin";
  }
  if (/liste|list/.test(intent.toLowerCase())) {
    outputs[0].name = "items";
    outputs[0].type = "array";
    outputs[0].description = "Liste";
  }

  // Confidence
  let confidence = 70;
  const reasoningParts: string[] = [];
  if (connectors.length > 0) {
    confidence += 10;
    reasoningParts.push(`${connectors.length} connector tespit edildi`);
  }
  if (scopes.includes("external-send")) {
    confidence -= 5;
    reasoningParts.push("external-send → approval gate gerekli");
  }
  confidence = Math.min(95, Math.max(40, confidence));

  return {
    kind: "skill",
    name,
    displayName: displayName || "Custom Skill",
    summary: intent,
    inputs,
    outputs,
    scopes,
    modelPreference: model,
    requiredConnectors: connectors,
    confidence,
    reasoning:
      reasoningParts.length > 0
        ? reasoningParts.join("; ") + "."
        : "Rule-based pattern match ile üretildi.",
  };
}

function forgeAgent(request: ForgeRequest): ForgedAgent {
  const { intent, context } = request;
  const model = detectModel(intent, []);

  const words = intent
    .replace(/[.,;:!?]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const shortLabel = words.slice(0, 4).join(" ");
  const name = kebab(shortLabel) || "custom-agent";
  const displayName = capitalizeWords(shortLabel);

  // Role guess from intent
  let role = "Specialist";
  const i = intent.toLowerCase();
  if (/(pazarlama|marketing|seo|content)/.test(i)) role = "Growth";
  else if (/(satış|sales|müşteri|customer)/.test(i)) role = "Sales / CS";
  else if (/(geliştirici|developer|code|bug)/.test(i)) role = "Product / Eng";
  else if (/(ops|operasyon|monitor)/.test(i)) role = "Ops";
  else if (/(araştır|research|analiz)/.test(i)) role = "Research";

  // Recommended skills — heuristic
  const recommendedSkills: string[] = [];
  if (/(yaz|taslak|draft|content|makale|post)/.test(i))
    recommendedSkills.push("content-writer", "editor-review");
  if (/(araştır|research|keyword|veri|data)/.test(i))
    recommendedSkills.push("research-curator");
  if (/(email|mesaj|outreach)/.test(i))
    recommendedSkills.push("outreach-writer");
  if (/(triage|ticket|support|destek)/.test(i))
    recommendedSkills.push("support-triager");
  if (/(metrik|analiz|report|rapor)/.test(i))
    recommendedSkills.push("metrics-analyst");

  // Context-aware recommendations
  if (context?.existingSkills) {
    for (const s of context.existingSkills) {
      if (i.includes(s.split("-")[0]) && !recommendedSkills.includes(s)) {
        recommendedSkills.push(s);
      }
    }
  }

  const personaPrompt = `Sen ${displayName} olarak ${context?.workspaceName ?? "bir Matrix workspace"}'inde çalışıyorsun. Görev tanımın: ${intent.trim()}. Her çıktının workspace DNA'sı ile uyumlu, external-send ise Seraph approval gate'den geçmesi zorunlu.`;

  let confidence = 65;
  if (recommendedSkills.length >= 2) confidence += 10;
  if (role !== "Specialist") confidence += 5;
  confidence = Math.min(90, confidence);

  return {
    kind: "agent",
    name,
    displayName: displayName || "Custom Agent",
    role,
    summary: intent,
    personaPrompt,
    recommendedSkills: recommendedSkills.slice(0, 4),
    model,
    confidence,
    reasoning: `Role tespit: ${role}. ${recommendedSkills.length} skill önerildi. Model: ${model}.`,
  };
}

function forgeWorkflow(request: ForgeRequest): ForgedWorkflow {
  const { intent } = request;
  const cadence = detectCadence(intent);
  const scopes = detectScopes(intent);
  const connectors = detectConnectors(intent);
  const requiresApproval = scopes.includes("external-send");

  const words = intent
    .replace(/[.,;:!?]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const shortLabel = words.slice(0, 5).join(" ");
  const name = kebab(shortLabel) || "custom-workflow";
  const displayName = capitalizeWords(shortLabel);

  // Step planning
  const steps: ForgedWorkflow["steps"] = [];

  // 1. Trigger
  if (cadence.startsWith("cron")) {
    steps.push({ kind: "trigger", label: `Schedule: ${cadence}`, note: "Cron tetikleyici" });
  } else if (cadence.startsWith("webhook")) {
    steps.push({ kind: "trigger", label: "Webhook event", note: "Dış event geldi" });
  } else {
    steps.push({ kind: "trigger", label: "Manual başlangıç", note: "Ferhan başlatır" });
  }

  // 2. Skills (detection)
  const i = intent.toLowerCase();
  if (/(araştır|research|çek|fetch|pull)/.test(i)) {
    steps.push({ kind: "skill", label: "Research + veri toplama", note: "research-curator veya benzeri" });
  }
  if (/(yaz|taslak|üret|draft|generate)/.test(i)) {
    steps.push({ kind: "skill", label: "Taslak oluşturma", note: "content-writer veya benzeri" });
  }
  if (/(edit|polish|review|kontrol)/.test(i)) {
    steps.push({ kind: "skill", label: "Editor review + polish", note: "editor-review" });
  }

  // 3. Integration (based on connectors)
  if (connectors.length > 0) {
    steps.push({
      kind: "integration",
      label: `${connectors.length} connector çağrısı`,
      note: connectors.join(", "),
    });
  }

  // 4. Approval gate (if external-send)
  if (requiresApproval) {
    steps.push({
      kind: "approval",
      label: "Seraph approval · external-send",
      note: "Ferhan onayı olmadan dış dünyaya gönderilmez",
    });
  }

  // 5. Notify
  if (/(slack|notion|email|bilgilendir|notify)/.test(i)) {
    steps.push({
      kind: "notify",
      label: "Sonuç bildirimi",
      note: "Ferhan'a özet + link",
    });
  }

  // Confidence
  let confidence = 60;
  if (steps.length >= 4) confidence += 15;
  if (connectors.length > 0) confidence += 10;
  if (requiresApproval) confidence -= 5;
  confidence = Math.min(92, Math.max(40, confidence));

  return {
    kind: "workflow",
    name,
    displayName: displayName || "Custom Workflow",
    summary: intent,
    cadence,
    steps,
    requiresApproval,
    confidence,
    reasoning: `${steps.length} adım planlandı; ${cadence}; ${connectors.length} connector; ${requiresApproval ? "approval gate gerekli" : "internal only"}.`,
  };
}

function errorForgery(kind: ForgeKind, reason: string): ForgedEntity {
  const base = {
    name: "invalid",
    displayName: "Geçersiz istek",
    summary: reason,
    confidence: 0,
    reasoning: reason,
  };
  if (kind === "skill")
    return {
      ...base,
      kind: "skill",
      inputs: [],
      outputs: [],
      scopes: [],
      modelPreference: "sonnet",
      requiredConnectors: [],
    };
  if (kind === "agent")
    return {
      ...base,
      kind: "agent",
      role: "-",
      personaPrompt: "",
      recommendedSkills: [],
      model: "sonnet",
    };
  return {
    ...base,
    kind: "workflow",
    cadence: "manual",
    steps: [],
    requiresApproval: false,
  };
}

function capitalizeWords(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ───────────────────────────────────────────────────────────────────────────
// Example intents — placeholder inspiration for the Forge UI
// ───────────────────────────────────────────────────────────────────────────

export const FORGE_EXAMPLES: Record<ForgeKind, string[]> = {
  skill: [
    "HubSpot'tan son 7 günde inbound lead listesini çekip ICP skoru üretsin",
    "Her blog post için SEO meta title + description üretsin",
    "Stripe'dan aylık MRR raporunu parse edip Slack'e push etsin",
    "Müşteri support ticket'ını kategoriye ayırıp urgency skoru versin",
  ],
  agent: [
    "Haftalık AI sektör haberlerini araştırıp önemli 10 hikayeyi seçen bir content curator",
    "Yeni sign-up olan kullanıcıları karşılayan + onboarding email dizisini kişiselleştiren agent",
    "Gelen support ticket'larını triajeden ve draft cevabı hazırlayan agent",
    "Günlük trading sinyalleri üreten ve risk skoru hesaplayan agent",
  ],
  workflow: [
    "Her Pazartesi 09:00'da haftalık newsletter taslağını üretip, editor review'dan geçirip Beehiiv'e draft yaz",
    "Stripe'tan her yeni sign-up geldiğinde lead-qualifier çalıştır, Slack'e #new-customers kanalına bildir",
    "Her ayın 1'inde tüm blog sayfalarını SEO audit yap, broken link raporunu Notion'a yaz",
    "Gmail inbox'tan sponsor teklif email'lerini tespit edip sponsor CRM'e kaydet",
  ],
};
