/**
 * Connector Hub — Matrix's integration catalog.
 *
 * Every skill / workflow that wants to *actually* do work needs a real
 * platform behind it. This module is the catalog: 40+ third-party systems
 * grouped by category, each with auth info, pricing model, health status
 * and the list of skills/workflows that depend on it.
 *
 * Physical-world connectors (shipping, payments, POS, IoT) live in their
 * own category and are surfaced with a distinct accent in the UI.
 */

export type ConnectorCategory =
  | "crm"
  | "messaging"
  | "marketing"
  | "commerce"
  | "devops"
  | "ai"
  | "engines" // inference providers — "The Engines" of the Matrix
  | "free-programs" // local runtimes — exiled "Free Programs" of the Matrix (Ollama, vLLM, etc.)
  | "orchestration"
  | "data"
  | "analytics"
  | "physical-world";

export type ConnectorStatus =
  | "connected"
  | "needs-auth"
  | "error"
  | "rate-limited"
  | "disconnected";

export type AuthType = "oauth2" | "api-key" | "webhook-secret" | "manual";

export interface ConnectorPricing {
  unit: "per-call" | "per-month" | "rev-share" | "per-unit" | "free";
  amountUsd?: number; // numeric value (for per-call / per-month)
  revSharePct?: number; // for rev-share
  label?: string; // e.g. "%2.9 + $0.30 / transaction"
}

export interface Connector {
  id: string;
  name: string;
  vendor: string; // "hubspot.com", "openai.com"
  category: ConnectorCategory;
  // Short-form pitch, shown on the card
  tagline: string;
  // Auth & runtime
  authType: AuthType;
  status: ConnectorStatus;
  lastHeartbeatAt?: string; // ISO
  callsToday: number;
  errorRate: number; // 0-1
  rateLimitUsed?: number; // 0-100 %
  // Economics
  pricing: ConnectorPricing;
  // Dependency graph — which skills/workflows use this connector
  usedBySkillNames?: string[];
  usedByWorkflowNames?: string[];
  // Stock letter used as "logo" in the card avatar
  shortCode: string;
  // True if this talks to the physical world (money / shipping / IoT)
  physical?: boolean;
  // Hint for how this maps to an Agent scope (external-send etc.)
  scopes?: Array<"read" | "write" | "external-send">;
  // Matrix's internal tag colour accent (used instead of the category default for special cards)
  accent?: "ion" | "nebula" | "quantum" | "solar" | "crimson";
}

// ---------------------------------------------------------------------------
// Seed catalog — realistic pricing approximations for demo only
// ---------------------------------------------------------------------------

const now = "2026-04-23T09:15:00Z";

export const connectors: Connector[] = [
  // ---- CRM / Sales ----
  {
    id: "c-hubspot",
    name: "HubSpot",
    vendor: "hubspot.com",
    category: "crm",
    tagline: "CRM + pazarlama otomasyonu + support tek çatı altında.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 342,
    errorRate: 0.02,
    rateLimitUsed: 18,
    pricing: { unit: "per-month", amountUsd: 890, label: "HubSpot Pro $890/ay" },
    usedBySkillNames: ["lead-enrichment", "lead-scorer", "outreach-personalize"],
    usedByWorkflowNames: ["inbound-lead-triage"],
    shortCode: "HS",
    scopes: ["read", "write"],
  },
  {
    id: "c-salesforce",
    name: "Salesforce",
    vendor: "salesforce.com",
    category: "crm",
    tagline: "Enterprise CRM — satış, servis, pazarlama cloudları.",
    authType: "oauth2",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-month", amountUsd: 1500 },
    shortCode: "SF",
    scopes: ["read", "write"],
  },
  {
    id: "c-pipedrive",
    name: "Pipedrive",
    vendor: "pipedrive.com",
    category: "crm",
    tagline: "KOBİ-dostu deal pipeline CRM'i.",
    authType: "api-key",
    status: "needs-auth",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-month", amountUsd: 49 },
    shortCode: "PD",
    scopes: ["read", "write"],
  },
  {
    id: "c-attio",
    name: "Attio",
    vendor: "attio.com",
    category: "crm",
    tagline: "Modern, data-first CRM.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 84,
    errorRate: 0.01,
    pricing: { unit: "per-month", amountUsd: 120 },
    shortCode: "AT",
    scopes: ["read", "write"],
  },

  // ---- Messaging ----
  {
    id: "c-slack",
    name: "Slack",
    vendor: "slack.com",
    category: "messaging",
    tagline: "Ekip içi iletişim + bot notifikasyonlar için workspace.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 1204,
    errorRate: 0.005,
    rateLimitUsed: 32,
    pricing: { unit: "per-month", amountUsd: 15 },
    usedBySkillNames: ["market-pulse-report", "meeting-notes-synthesizer"],
    usedByWorkflowNames: [
      "daily-market-briefing",
      "sprint-status-roundup",
      "weekly-exec-dashboard",
    ],
    shortCode: "SL",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-gmail",
    name: "Gmail",
    vendor: "google.com",
    category: "messaging",
    tagline: "Email gönderim + taslak + thread parse.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 212,
    errorRate: 0.01,
    pricing: { unit: "free", label: "Workspace dahili" },
    usedBySkillNames: ["outreach-personalize"],
    shortCode: "GM",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-discord",
    name: "Discord",
    vendor: "discord.com",
    category: "messaging",
    tagline: "Topluluk sunucularına bot + webhook.",
    authType: "webhook-secret",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "free" },
    shortCode: "DC",
    scopes: ["write"],
  },
  {
    id: "c-teams",
    name: "MS Teams",
    vendor: "microsoft.com",
    category: "messaging",
    tagline: "Enterprise mesajlaşma + toplantı entegrasyonu.",
    authType: "oauth2",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-month", amountUsd: 22 },
    shortCode: "MT",
    scopes: ["read", "write"],
  },

  // ---- Marketing ----
  {
    id: "c-klaviyo",
    name: "Klaviyo",
    vendor: "klaviyo.com",
    category: "marketing",
    tagline: "E-commerce için email + SMS retention motoru.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 189,
    errorRate: 0.02,
    pricing: { unit: "per-month", amountUsd: 150 },
    shortCode: "KL",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-meta-ads",
    name: "Meta Ads",
    vendor: "facebook.com",
    category: "marketing",
    tagline: "Facebook + Instagram ad kampanyaları API'si.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 58,
    errorRate: 0.04,
    pricing: { unit: "rev-share", revSharePct: 100, label: "Harcanan kadar" },
    shortCode: "MA",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-google-ads",
    name: "Google Ads",
    vendor: "google.com",
    category: "marketing",
    tagline: "Search + YouTube + Display kampanyaları.",
    authType: "oauth2",
    status: "rate-limited",
    lastHeartbeatAt: now,
    callsToday: 112,
    errorRate: 0.08,
    rateLimitUsed: 92,
    pricing: { unit: "rev-share", revSharePct: 100, label: "Harcanan kadar" },
    shortCode: "GA",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-mailchimp",
    name: "Mailchimp",
    vendor: "mailchimp.com",
    category: "marketing",
    tagline: "Newsletter + kampanya aracı.",
    authType: "api-key",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-month", amountUsd: 69 },
    shortCode: "MC",
    scopes: ["read", "write", "external-send"],
  },

  // ---- Commerce ----
  {
    id: "c-shopify",
    name: "Shopify",
    vendor: "shopify.com",
    category: "commerce",
    tagline: "E-commerce store API: ürün, sipariş, müşteri.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 420,
    errorRate: 0.01,
    pricing: { unit: "per-month", amountUsd: 299 },
    shortCode: "SH",
    scopes: ["read", "write"],
  },
  {
    id: "c-stripe",
    name: "Stripe",
    vendor: "stripe.com",
    category: "commerce",
    tagline: "Ödeme alma + abonelik + invoice.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 87,
    errorRate: 0.01,
    pricing: { unit: "rev-share", revSharePct: 2.9, label: "%2.9 + $0.30 / txn" },
    usedBySkillNames: [],
    shortCode: "ST",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-amazon-sp",
    name: "Amazon SP-API",
    vendor: "amazon.com",
    category: "commerce",
    tagline: "Seller Central veri + listing + FBA inbound.",
    authType: "oauth2",
    status: "needs-auth",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "free", label: "Amazon hesabıyla dahili" },
    shortCode: "AM",
    scopes: ["read", "write"],
  },
  {
    id: "c-etsy",
    name: "Etsy",
    vendor: "etsy.com",
    category: "commerce",
    tagline: "Shop + listing + order API.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 48,
    errorRate: 0.02,
    pricing: { unit: "rev-share", revSharePct: 6.5, label: "Transaction %6.5" },
    shortCode: "ET",
    scopes: ["read", "write"],
  },

  // ---- Dev / Ops ----
  {
    id: "c-github",
    name: "GitHub",
    vendor: "github.com",
    category: "devops",
    tagline: "Repo, PR, Actions, Issues API.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 612,
    errorRate: 0.003,
    pricing: { unit: "per-month", amountUsd: 21 },
    shortCode: "GH",
    scopes: ["read", "write"],
  },
  {
    id: "c-linear",
    name: "Linear",
    vendor: "linear.app",
    category: "devops",
    tagline: "Issue tracking + sprint + roadmap.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 145,
    errorRate: 0.01,
    pricing: { unit: "per-month", amountUsd: 16 },
    usedByWorkflowNames: ["sprint-status-roundup"],
    shortCode: "LN",
    scopes: ["read", "write"],
  },
  {
    id: "c-notion",
    name: "Notion",
    vendor: "notion.so",
    category: "devops",
    tagline: "Doküman + DB + team wiki.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 89,
    errorRate: 0.01,
    pricing: { unit: "per-month", amountUsd: 18 },
    usedByWorkflowNames: ["weekly-exec-dashboard"],
    shortCode: "NT",
    scopes: ["read", "write"],
  },
  {
    id: "c-airtable",
    name: "Airtable",
    vendor: "airtable.com",
    category: "devops",
    tagline: "Flexible relational DB spreadsheet.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 34,
    errorRate: 0.01,
    pricing: { unit: "per-month", amountUsd: 24 },
    shortCode: "AT",
    scopes: ["read", "write"],
  },
  {
    id: "c-jira",
    name: "Jira",
    vendor: "atlassian.com",
    category: "devops",
    tagline: "Enterprise issue + sprint yönetimi.",
    authType: "oauth2",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-month", amountUsd: 7 },
    shortCode: "JR",
    scopes: ["read", "write"],
  },

  // ---- AI ----
  {
    id: "c-claude",
    name: "Claude API",
    vendor: "anthropic.com",
    category: "ai",
    tagline: "Anthropic Claude — ana LLM çekirdeği.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 1890,
    errorRate: 0.002,
    pricing: { unit: "per-call", amountUsd: 0.015, label: "Opus: $0.015 / 1K output tok" },
    usedBySkillNames: [
      "lead-enrichment",
      "lead-scorer",
      "outreach-personalize",
      "market-pulse-report",
      "meeting-notes-synthesizer",
    ],
    shortCode: "CL",
    accent: "nebula",
    scopes: ["read", "write"],
  },
  {
    id: "c-openai",
    name: "OpenAI",
    vendor: "openai.com",
    category: "ai",
    tagline: "GPT-4, Whisper, DALL-E — yedek LLM katmanı.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 210,
    errorRate: 0.01,
    pricing: { unit: "per-call", amountUsd: 0.01 },
    shortCode: "OA",
    scopes: ["read", "write"],
  },
  {
    id: "c-replicate",
    name: "Replicate",
    vendor: "replicate.com",
    category: "ai",
    tagline: "Open-source modelleri hosted — görüntü / ses / video.",
    authType: "api-key",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-call", amountUsd: 0.005 },
    shortCode: "RP",
    scopes: ["read", "write"],
  },
  {
    id: "c-huggingface",
    name: "HuggingFace",
    vendor: "huggingface.co",
    category: "ai",
    tagline:
      "100K+ açık kaynak ML modele erişim — metin, görsel, ses, video tek platformda.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 340,
    errorRate: 0.008,
    pricing: { unit: "per-call", amountUsd: 0.0003, label: "Inference Endpoint · $0.0003 / call" },
    shortCode: "HF",
    accent: "nebula",
    scopes: ["read", "write"],
  },

  // ==========================================================================
  // The Engines — inference providers that run the actual models.
  // Matrix tarafında "modelleri koşturan motorlar" — Groq'un wafer-scale'ından
  // fal'ın gen-AI stream'ine, her biri hız / maliyet / coğrafya dengesinde
  // farklı bir profil sunar. Accent: ion (elektriksel, hızlı).
  // ==========================================================================
  {
    id: "c-groq",
    name: "Groq",
    vendor: "groq.com",
    category: "engines",
    tagline:
      "LPU wafer-scale inference · 500+ tok/s · Matrix'in en hızlı beyin motoru.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 890,
    errorRate: 0.003,
    pricing: { unit: "per-call", amountUsd: 0.00027, label: "$0.27/M · Llama 3.3 70B" },
    shortCode: "GRQ",
    accent: "ion",
    scopes: ["read", "write"],
  },
  {
    id: "c-cerebras",
    name: "Cerebras",
    vendor: "cerebras.ai",
    category: "engines",
    tagline: "DataScale Cloud · 1800 tok/s · en büyük chip üzerinde inference.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 240,
    errorRate: 0.005,
    pricing: { unit: "per-call", amountUsd: 0.0006 },
    shortCode: "CBR",
    accent: "ion",
    scopes: ["read", "write"],
  },
  {
    id: "c-together-ai",
    name: "Together AI",
    vendor: "together.ai",
    category: "engines",
    tagline: "200+ açık kaynak modele serverless erişim · fine-tune + inference.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 612,
    errorRate: 0.006,
    pricing: { unit: "per-call", amountUsd: 0.0002, label: "$0.20/M · 70B sınıfı" },
    shortCode: "TGT",
    accent: "ion",
    scopes: ["read", "write"],
  },
  {
    id: "c-fal",
    name: "fal",
    vendor: "fal.ai",
    category: "engines",
    tagline: "Görsel + video generative AI için saniyeye-duyarlı inference.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 128,
    errorRate: 0.01,
    pricing: { unit: "per-call", amountUsd: 0.003, label: "$0.003/sn · Flux/SDXL çıktı" },
    shortCode: "FAL",
    accent: "ion",
    scopes: ["read", "write"],
  },
  {
    id: "c-fireworks",
    name: "Fireworks",
    vendor: "fireworks.ai",
    category: "engines",
    tagline: "Production-grade serverless inference · otomatik ölçekleme.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 334,
    errorRate: 0.004,
    pricing: { unit: "per-call", amountUsd: 0.0002 },
    shortCode: "FRW",
    accent: "ion",
    scopes: ["read", "write"],
  },
  {
    id: "c-sambanova",
    name: "SambaNova",
    vendor: "sambanova.ai",
    category: "engines",
    tagline: "DataScale dataflow mimari · kurumsal özel deployment seçeneği.",
    authType: "api-key",
    status: "needs-auth",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-call", amountUsd: 0.0006 },
    shortCode: "SMB",
    accent: "ion",
    scopes: ["read", "write"],
  },
  {
    id: "c-hyperbolic",
    name: "Hyperbolic",
    vendor: "hyperbolic.xyz",
    category: "engines",
    tagline: "GPU marketplace + inference · DeepSeek R1 için popüler host.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 78,
    errorRate: 0.012,
    pricing: { unit: "per-call", amountUsd: 0.00015 },
    shortCode: "HYB",
    accent: "ion",
    scopes: ["read", "write"],
  },
  {
    id: "c-novita",
    name: "Novita",
    vendor: "novita.ai",
    category: "engines",
    tagline: "200+ model · görsel + video + LLM multi-modal inference.",
    authType: "api-key",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-call", amountUsd: 0.0001 },
    shortCode: "NVT",
    accent: "ion",
    scopes: ["read", "write"],
  },
  {
    id: "c-hf-inference",
    name: "HF Inference API",
    vendor: "huggingface.co",
    category: "engines",
    tagline:
      "HuggingFace'in kendi serverless endpoint'leri · hub'a mount edilen her model.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 165,
    errorRate: 0.008,
    pricing: { unit: "per-call", amountUsd: 0.0003 },
    shortCode: "HFI",
    accent: "ion",
    scopes: ["read", "write"],
  },

  // ---- Free Programs (local runtimes — the "exiled" programs of the Matrix) ----
  {
    id: "c-ollama",
    name: "Ollama",
    vendor: "ollama.com",
    category: "free-programs",
    tagline:
      "Tek komutla local LLM · gguf · macOS/Linux/Windows · Matrix'in kaçak zihinleri.",
    authType: "manual",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 312,
    errorRate: 0.004,
    pricing: { unit: "free", label: "Tamamen ücretsiz · senin donanımın" },
    shortCode: "OLM",
    accent: "quantum",
    scopes: ["read", "write"],
  },
  {
    id: "c-vllm",
    name: "vLLM",
    vendor: "vllm.ai",
    category: "free-programs",
    tagline:
      "PagedAttention ile production-grade serving · 24x daha yüksek throughput.",
    authType: "manual",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 480,
    errorRate: 0.006,
    pricing: { unit: "free", label: "Apache-2.0 · self-hosted" },
    shortCode: "VLM",
    accent: "quantum",
    scopes: ["read", "write"],
  },
  {
    id: "c-lmstudio",
    name: "LM Studio",
    vendor: "lmstudio.ai",
    category: "free-programs",
    tagline:
      "Desktop GUI · model discovery + local chat · teknik olmayan kullanıcı için.",
    authType: "manual",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 58,
    errorRate: 0.002,
    pricing: { unit: "free", label: "Kişisel kullanımda ücretsiz" },
    shortCode: "LMS",
    accent: "quantum",
    scopes: ["read", "write"],
  },
  {
    id: "c-llamacpp",
    name: "llama.cpp",
    vendor: "github.com/ggerganov",
    category: "free-programs",
    tagline:
      "Pure C++ · 4-bit quantize · Raspberry Pi'den H100'e her yerde koşar.",
    authType: "manual",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 172,
    errorRate: 0.003,
    pricing: { unit: "free", label: "MIT · en portatif runtime" },
    shortCode: "LCP",
    accent: "quantum",
    scopes: ["read", "write"],
  },
  {
    id: "c-mlxlm",
    name: "MLX LM",
    vendor: "github.com/ml-explore",
    category: "free-programs",
    tagline:
      "Apple Silicon'a özel · unified memory · M3 Max'te 50+ tok/s.",
    authType: "manual",
    status: "needs-auth",
    callsToday: 24,
    errorRate: 0,
    pricing: { unit: "free", label: "MIT · Apple Silicon" },
    shortCode: "MLX",
    accent: "quantum",
    scopes: ["read", "write"],
  },
  {
    id: "c-jan",
    name: "Jan",
    vendor: "jan.ai",
    category: "free-programs",
    tagline:
      "Privacy-first desktop AI · %100 offline · tamamen açık kaynak.",
    authType: "manual",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "free", label: "AGPLv3 · offline-only" },
    shortCode: "JAN",
    accent: "quantum",
    scopes: ["read", "write"],
  },
  {
    id: "c-sglang",
    name: "SGLang",
    vendor: "github.com/sgl-project",
    category: "free-programs",
    tagline:
      "Structured generation + RadixAttention · vLLM'e rakip hız, agent workloads için.",
    authType: "manual",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 95,
    errorRate: 0.009,
    pricing: { unit: "free", label: "Apache-2.0 · research-grade" },
    shortCode: "SGL",
    accent: "quantum",
    scopes: ["read", "write"],
  },
  {
    id: "c-unsloth",
    name: "Unsloth",
    vendor: "unsloth.ai",
    category: "free-programs",
    tagline:
      "2× hızlı · %60 az RAM fine-tuning · QLoRA · Colab üzerinde bile Llama 70B.",
    authType: "manual",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 38,
    errorRate: 0.005,
    pricing: { unit: "free", label: "Apache-2.0 · pro tier $29/ay" },
    shortCode: "UNS",
    accent: "quantum",
    scopes: ["read", "write"],
  },

  // ---- Orchestration ----
  {
    id: "c-n8n",
    name: "n8n",
    vendor: "n8n.io",
    category: "orchestration",
    tagline: "Self-hosted workflow automation — 400+ node.",
    authType: "webhook-secret",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 76,
    errorRate: 0.02,
    pricing: { unit: "free", label: "Self-hosted" },
    shortCode: "N8",
    scopes: ["read", "write"],
  },
  {
    id: "c-zapier",
    name: "Zapier",
    vendor: "zapier.com",
    category: "orchestration",
    tagline: "Hızlı point-to-point otomasyon.",
    authType: "oauth2",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-month", amountUsd: 29 },
    shortCode: "ZP",
    scopes: ["read", "write"],
  },
  {
    id: "c-make",
    name: "Make.com",
    vendor: "make.com",
    category: "orchestration",
    tagline: "Visual scenario builder.",
    authType: "oauth2",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-month", amountUsd: 10.59 },
    shortCode: "MK",
    scopes: ["read", "write"],
  },

  // ---- Data ----
  {
    id: "c-supabase",
    name: "Supabase",
    vendor: "supabase.com",
    category: "data",
    tagline: "Postgres + Auth + Storage, open-source.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 2840,
    errorRate: 0.001,
    pricing: { unit: "per-month", amountUsd: 25 },
    shortCode: "SB",
    scopes: ["read", "write"],
  },
  {
    id: "c-postgres",
    name: "Postgres",
    vendor: "postgresql.org",
    category: "data",
    tagline: "Production-grade relational DB.",
    authType: "manual",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 4120,
    errorRate: 0.0,
    pricing: { unit: "free", label: "Self-hosted" },
    shortCode: "PG",
    scopes: ["read", "write"],
  },
  {
    id: "c-snowflake",
    name: "Snowflake",
    vendor: "snowflake.com",
    category: "data",
    tagline: "Enterprise data warehouse.",
    authType: "api-key",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-unit", amountUsd: 2, label: "$2 / credit" },
    shortCode: "SN",
    scopes: ["read", "write"],
  },
  {
    id: "c-bigquery",
    name: "BigQuery",
    vendor: "google.com",
    category: "data",
    tagline: "Serverless petabyte-scale analytics.",
    authType: "oauth2",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-unit", amountUsd: 5, label: "$5 / TB query" },
    shortCode: "BQ",
    scopes: ["read", "write"],
  },

  // ---- Analytics ----
  {
    id: "c-mixpanel",
    name: "Mixpanel",
    vendor: "mixpanel.com",
    category: "analytics",
    tagline: "Product analytics + funnel + cohort.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 88,
    errorRate: 0.01,
    pricing: { unit: "per-month", amountUsd: 24 },
    shortCode: "MX",
    scopes: ["read", "write"],
  },
  {
    id: "c-posthog",
    name: "PostHog",
    vendor: "posthog.com",
    category: "analytics",
    tagline: "Open-source product analytics + feature flags.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 45,
    errorRate: 0.0,
    pricing: { unit: "per-month", amountUsd: 0, label: "Free tier 1M events" },
    shortCode: "PH",
    scopes: ["read", "write"],
  },
  {
    id: "c-ga4",
    name: "Google Analytics 4",
    vendor: "google.com",
    category: "analytics",
    tagline: "Web + app trafik analitiği.",
    authType: "oauth2",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 52,
    errorRate: 0.02,
    pricing: { unit: "free" },
    shortCode: "G4",
    scopes: ["read"],
  },

  // ==========================================================================
  // Physical-World — distinct accent in the UI (solar / warm)
  // ==========================================================================
  {
    id: "c-shippo",
    name: "Shippo",
    vendor: "goshippo.com",
    category: "physical-world",
    tagline: "Multi-carrier kargo API: UPS, USPS, DHL, FedEx tek uçtan.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 23,
    errorRate: 0.03,
    pricing: { unit: "per-call", amountUsd: 0.05, label: "$0.05 / shipment" },
    shortCode: "SP",
    physical: true,
    accent: "solar",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-easypost",
    name: "EasyPost",
    vendor: "easypost.com",
    category: "physical-world",
    tagline: "Kargo etiketi + takip + sigorta API'si.",
    authType: "api-key",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-call", amountUsd: 0.04 },
    shortCode: "EP",
    physical: true,
    accent: "solar",
    scopes: ["read", "write"],
  },
  {
    id: "c-wise",
    name: "Wise",
    vendor: "wise.com",
    category: "physical-world",
    tagline: "Çok-para birimi transfer + tedarikçi ödeme.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 4,
    errorRate: 0.0,
    pricing: { unit: "rev-share", revSharePct: 0.5, label: "%0.4-0.7 / transfer" },
    shortCode: "WS",
    physical: true,
    accent: "solar",
    scopes: ["read", "external-send"],
  },
  {
    id: "c-stripe-connect",
    name: "Stripe Connect",
    vendor: "stripe.com",
    category: "physical-world",
    tagline: "Marketplace + multi-party ödemeler.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 11,
    errorRate: 0.0,
    pricing: { unit: "rev-share", revSharePct: 2.9, label: "%2.9 + $0.30 / transfer" },
    shortCode: "SC",
    physical: true,
    accent: "solar",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-square",
    name: "Square POS",
    vendor: "squareup.com",
    category: "physical-world",
    tagline: "In-person POS + online order + terminal.",
    authType: "oauth2",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "rev-share", revSharePct: 2.6, label: "%2.6 + $0.10 / in-person" },
    shortCode: "SQ",
    physical: true,
    accent: "solar",
    scopes: ["read", "write"],
  },
  {
    id: "c-printful",
    name: "Printful",
    vendor: "printful.com",
    category: "physical-world",
    tagline: "POD ürün basımı + kargo (tişört, mug, kitap).",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 16,
    errorRate: 0.02,
    pricing: { unit: "per-unit", amountUsd: 12, label: "Ürün başına maliyet" },
    shortCode: "PF",
    physical: true,
    accent: "solar",
    scopes: ["read", "write"],
  },
  {
    id: "c-lob",
    name: "Lob",
    vendor: "lob.com",
    category: "physical-world",
    tagline: "Fiziksel mektup + postcard API — kağıt dünyası.",
    authType: "api-key",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-unit", amountUsd: 1.65, label: "$1.65 / kart" },
    shortCode: "LB",
    physical: true,
    accent: "solar",
    scopes: ["read", "write", "external-send"],
  },
  {
    id: "c-alibaba",
    name: "Alibaba Sourcing",
    vendor: "alibaba.com",
    category: "physical-world",
    tagline: "B2B tedarikçi arama + RFQ.",
    authType: "api-key",
    status: "needs-auth",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "free", label: "Marketplace — ürün maliyeti ayrı" },
    shortCode: "AL",
    physical: true,
    accent: "solar",
    scopes: ["read", "write"],
  },
  {
    id: "c-shipbob",
    name: "ShipBob",
    vendor: "shipbob.com",
    category: "physical-world",
    tagline: "3PL fulfillment ağı — global depo + kargo.",
    authType: "api-key",
    status: "disconnected",
    callsToday: 0,
    errorRate: 0,
    pricing: { unit: "per-unit", amountUsd: 3.5, label: "Pick+pack + kargo" },
    shortCode: "SB",
    physical: true,
    accent: "solar",
    scopes: ["read", "write"],
  },
  {
    id: "c-twilio",
    name: "Twilio",
    vendor: "twilio.com",
    category: "physical-world",
    tagline: "SMS + telefon + WhatsApp mesajlaşma.",
    authType: "api-key",
    status: "connected",
    lastHeartbeatAt: now,
    callsToday: 48,
    errorRate: 0.01,
    pricing: { unit: "per-call", amountUsd: 0.0075, label: "$0.0075 / SMS" },
    shortCode: "TW",
    physical: true,
    accent: "solar",
    scopes: ["read", "write", "external-send"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const categoryLabels: Record<ConnectorCategory, string> = {
  crm: "CRM / Sales",
  messaging: "Messaging",
  marketing: "Marketing / Ads",
  commerce: "Commerce",
  devops: "Dev · Ops · Docs",
  ai: "AI / LLM",
  engines: "The Engines",
  "free-programs": "Free Programs",
  orchestration: "Orchestration",
  data: "Data",
  analytics: "Analytics",
  "physical-world": "Physical-World",
};

export const categoryOrder: ConnectorCategory[] = [
  "ai",
  "engines",
  "free-programs",
  "crm",
  "messaging",
  "marketing",
  "commerce",
  "devops",
  "orchestration",
  "data",
  "analytics",
  "physical-world",
];

export const statusLabels: Record<ConnectorStatus, string> = {
  connected: "Bağlı",
  "needs-auth": "Yetkilendirme gerekli",
  error: "Hata",
  "rate-limited": "Rate-limit",
  disconnected: "Bağlı değil",
};

export function statusTone(s: ConnectorStatus): "quantum" | "solar" | "crimson" | "neutral" | "ion" {
  switch (s) {
    case "connected":
      return "quantum";
    case "needs-auth":
      return "solar";
    case "rate-limited":
      return "solar";
    case "error":
      return "crimson";
    case "disconnected":
      return "neutral";
  }
}

// ---------------------------------------------------------------------------
// Connector Scout — fresh discoveries the Scout agent has surfaced in the
// last 7-30 days. Real SaaS that real operators are adopting in 2026.
// In live mode this would be produced by a real agent scanning the web,
// Product Hunt, LinkedIn, GitHub trending, etc.
// ---------------------------------------------------------------------------

/** Scout sinyal kaynakları — TrainStation operasyonel entegrasyon keşfi için. */
export type ScoutSignalSource =
  | "producthunt"
  | "github-trending"
  | "reddit"
  | "indie-hackers"
  | "linkedin"
  | "g2";

export interface ScoutDiscovery {
  id: string;
  name: string;
  vendor: string;
  category: ConnectorCategory;
  tagline: string;
  signalSource: ScoutSignalSource;
  signalStrength: "weak" | "emerging" | "strong";
  capturedAt: string;
  whyMatters: string;
  ballparkPrice: string;
  recommendedFor: string; // skill kind or workflow type
  shortCode: string;
  accent?: "ion" | "nebula" | "quantum" | "solar";
  // ── G2-specific social proof ──
  g2Rating?: number; // 0-5
  g2ReviewCount?: number; // e.g. 2340
  g2Segment?: string; // e.g. "Leader · Mid-Market"
}

export const scoutDiscoveries: ScoutDiscovery[] = [
  {
    id: "sd-loops",
    name: "Loops.so",
    vendor: "loops.so",
    category: "marketing",
    tagline: "Startup'lar için minimal, AI-çağı email platformu.",
    signalSource: "producthunt",
    signalStrength: "strong",
    capturedAt: "2026-04-22T10:00:00Z",
    whyMatters:
      "Klaviyo fazla geldi, Mailchimp modası geçti diyen indie founder'lar buraya geçiyor. API-first + developer-friendly.",
    ballparkPrice: "$39/ay (3K contact)",
    recommendedFor: "outreach · newsletter workflow'ları",
    shortCode: "LP",
    accent: "ion",
  },
  {
    id: "sd-cal-com",
    name: "Cal.com",
    vendor: "cal.com",
    category: "devops",
    tagline: "Open-source Calendly alternatifi — self-hostable, extensible.",
    signalSource: "github-trending",
    signalStrength: "strong",
    capturedAt: "2026-04-21T08:30:00Z",
    whyMatters:
      "Calendly'ye fiyat kaçarken Cal.com GitHub'da yükseliyor. Self-hosted seçeneği enterprise için büyük.",
    ballparkPrice: "Self-host free / $15/ay Cloud",
    recommendedFor: "sales-qualifier · interview-coordinator",
    shortCode: "CL",
    accent: "ion",
  },
  {
    id: "sd-plain",
    name: "Plain",
    vendor: "plain.com",
    category: "messaging",
    tagline: "Intercom alternatifi — Linear estetiğinde destek aracı.",
    signalSource: "linkedin",
    signalStrength: "emerging",
    capturedAt: "2026-04-20T12:00:00Z",
    whyMatters:
      "Linear'i seven ekipler destek için benzer estetik + hız arıyor. Gmail + Slack entegrasyonları güzel.",
    ballparkPrice: "$65/ay/seat",
    recommendedFor: "support-triager · reply-drafter",
    shortCode: "PL",
    accent: "nebula",
  },
  {
    id: "sd-whop",
    name: "Whop",
    vendor: "whop.com",
    category: "commerce",
    tagline: "Digital product marketplace + community altyapısı.",
    signalSource: "indie-hackers",
    signalStrength: "strong",
    capturedAt: "2026-04-19T14:00:00Z",
    whyMatters:
      "Creator'lar için Gumroad + Discord + Kajabi üçlüsünü tek yere getiriyor. 7 figür creator'lar geçiyor.",
    ballparkPrice: "%3 platform fee",
    recommendedFor: "creator-OS · digital products launch",
    shortCode: "WP",
    accent: "solar",
  },
  {
    id: "sd-beehiiv",
    name: "Beehiiv",
    vendor: "beehiiv.com",
    category: "marketing",
    tagline: "Substack'e alternatif — reklam + referral built-in.",
    signalSource: "reddit",
    signalStrength: "strong",
    capturedAt: "2026-04-18T09:00:00Z",
    whyMatters:
      "Newsletter creator'ları ChatGPT & Morning Brew'un kullandığı platforma akın ediyor. Partner program cazip.",
    ballparkPrice: "Free / $39/ay Pro",
    recommendedFor: "newsletter workflow · creator growth",
    shortCode: "BH",
    accent: "nebula",
  },
  {
    id: "sd-attio-dev",
    name: "Attio Dev Platform",
    vendor: "attio.com",
    category: "crm",
    tagline: "Modern CRM'in yeni yayınladığı developer SDK'sı.",
    signalSource: "producthunt",
    signalStrength: "emerging",
    capturedAt: "2026-04-17T11:00:00Z",
    whyMatters:
      "CRM içinde kendi iş akışlarını yazabilmek için Attio SDK açıldı. HubSpot'a göre daha native hissediyor.",
    ballparkPrice: "Pro'ya dahil",
    recommendedFor: "lead-triager · sales-qualifier",
    shortCode: "AD",
    accent: "ion",
  },

  // ── G2 signal source — review-backed social proof, enterprise tier ──────────
  {
    id: "sd-salesforce-starter",
    name: "Salesforce Starter Suite",
    vendor: "salesforce.com",
    category: "crm",
    tagline: "SMB'ye yeniden tasarlanmış Salesforce — Einstein AI dahili.",
    signalSource: "g2",
    signalStrength: "strong",
    capturedAt: "2026-04-22T14:00:00Z",
    whyMatters:
      "G2'da CRM kategorisinde 4.3 yıldız · 2,340 review. Einstein Copilot bu sürümde paketlendi, sektöründe en referanslı.",
    ballparkPrice: "$25/kullanıcı/ay",
    recommendedFor: "enterprise-crm · forecast-automation",
    shortCode: "SF",
    accent: "ion",
    g2Rating: 4.3,
    g2ReviewCount: 2340,
    g2Segment: "Leader · Mid-Market Q2 2026",
  },
  {
    id: "sd-clay",
    name: "Clay",
    vendor: "clay.com",
    category: "marketing",
    tagline: "GTM ekibi için veri zenginleştirme + AI outreach otomasyonu.",
    signalSource: "g2",
    signalStrength: "strong",
    capturedAt: "2026-04-21T17:30:00Z",
    whyMatters:
      "G2'da Sales Intelligence kategorisinde 4.9 yıldız · 1,120 review. Data Enrichment Leader badge'i 3 çeyrektir kimsenin alamadığı skorlarla.",
    ballparkPrice: "$149/ay (3K credit)",
    recommendedFor: "lead-enrichment · outbound-writer",
    shortCode: "CL",
    accent: "nebula",
    g2Rating: 4.9,
    g2ReviewCount: 1120,
    g2Segment: "Leader · Mid-Market & Enterprise",
  },
  {
    id: "sd-apollo",
    name: "Apollo.io",
    vendor: "apollo.io",
    category: "crm",
    tagline: "B2B database (275M kişi) + sales engagement + AI sequencer.",
    signalSource: "g2",
    signalStrength: "strong",
    capturedAt: "2026-04-20T09:15:00Z",
    whyMatters:
      "G2'da Sales Intelligence kategorisinde 4.7 yıldız · 8,450 review — kategoriyi dominate ediyor. LinkedIn Sales Nav + ZoomInfo'ya karşı ~1/10 fiyat.",
    ballparkPrice: "Free tier / $49+/kullanıcı",
    recommendedFor: "lead-triager · outbound-sequencer · data-enricher",
    shortCode: "AP",
    accent: "ion",
    g2Rating: 4.7,
    g2ReviewCount: 8450,
    g2Segment: "Leader · SMB + Mid-Market",
  },
  {
    id: "sd-lusha",
    name: "Lusha",
    vendor: "lusha.com",
    category: "crm",
    tagline: "GDPR/CCPA-compliant B2B contact database + chrome extension.",
    signalSource: "g2",
    signalStrength: "emerging",
    capturedAt: "2026-04-19T16:00:00Z",
    whyMatters:
      "G2'da Lead Capture kategorisinde 4.3 yıldız · 1,490 review. Compliance konusunda ZoomInfo'dan daha az risk, Avrupa pazarı için ideal.",
    ballparkPrice: "$39/kullanıcı/ay",
    recommendedFor: "lead-enricher · cold-outbound",
    shortCode: "LS",
    accent: "quantum",
    g2Rating: 4.3,
    g2ReviewCount: 1490,
    g2Segment: "High Performer · SMB",
  },
];

export function priceLabel(p: ConnectorPricing): string {
  if (p.label) return p.label;
  if (p.unit === "free") return "Ücretsiz";
  if (p.unit === "per-month") return `$${p.amountUsd}/ay`;
  if (p.unit === "per-call") return `$${p.amountUsd}/call`;
  if (p.unit === "per-unit") return `$${p.amountUsd}/unit`;
  if (p.unit === "rev-share")
    return p.revSharePct != null ? `${p.revSharePct}% rev-share` : "Rev-share";
  return "—";
}
