/**
 * Matrix Blueprint — curated domain bootstraps.
 *
 * A Blueprint is a ready-to-install department pack: departments, agents,
 * skills, workflows, and suggested OKRs. One click → Forge engine produces
 * every entity and drops it into the workspace.
 *
 * Each blueprint targets a specific business domain (Sales & Marketing,
 * Customer Success, Revenue Ops, etc.) and captures best-practice patterns.
 */

import type { AgentIntent, SkillIntent, WorkflowIntent } from "./forge";

export interface BlueprintDeptSeed {
  id: string; // blueprint-local id, used as parent reference
  name: string;
  description: string;
}

export interface BlueprintAgentSeed {
  deptId: string; // references BlueprintDeptSeed.id
  intent: AgentIntent;
}

export interface BlueprintSkillSeed {
  ownerAgentName: string; // matches AgentIntent.name in the same blueprint
  intent: Omit<SkillIntent, "ownerAgentId" | "ownerAgentName">;
}

export interface BlueprintWorkflowSeed {
  deptId: string;
  intent: Omit<WorkflowIntent, "departmentId">;
}

export interface BlueprintOkrSeed {
  title: string;
  metric: string;
  target: number;
  unit: string;
  invert?: boolean;
}

export interface Blueprint {
  id: string;
  domain: string; // "sales-marketing", "finance", "customer-success", ...
  displayName: string;
  summary: string;
  hero: string;
  author: "matrix-official" | "community";
  tags: string[];
  estimatedSetupMinutes: number;
  estimatedMonthlyHoursSaved: number;
  coverPalette: "ion" | "nebula" | "quantum" | "solar";
  digitalCoverage: number; // 0-100
  physicalBridges: string[]; // hybrid measurement touchpoints
  departments: BlueprintDeptSeed[];
  agents: BlueprintAgentSeed[];
  skills: BlueprintSkillSeed[];
  workflows: BlueprintWorkflowSeed[];
  okrs: BlueprintOkrSeed[];
}

// ============================================================================
// 1) Sales & Marketing — the showcase blueprint
// ============================================================================

const salesMarketing: Blueprint = {
  id: "bp-sales-marketing",
  domain: "sales-marketing",
  displayName: "Sales & Marketing",
  summary:
    "Dijital satış ve pazarlama departmanını uçtan uca çalıştıran hazır paket — demand gen, inbound, customer success, revenue ops.",
  hero:
    "Form → lead triage → outreach taslağı → onay → gönderim → CRM yazımı → pipeline forecast — tek zincir.",
  author: "matrix-official",
  tags: ["sales", "marketing", "crm", "hubspot", "salesforce", "demand-gen"],
  estimatedSetupMinutes: 12,
  estimatedMonthlyHoursSaved: 42,
  coverPalette: "ion",
  digitalCoverage: 92,
  physicalBridges: [
    "Fuar / etkinlik QR formları → Matrix webhook",
    "Saha satış temsilcisi mobil check-in",
    "Fiziksel bayi trafik sayacı (IoT) → lead korelasyonu",
    "POS sistem entegrasyonu → revenue attribution",
  ],
  departments: [
    {
      id: "d-demand",
      name: "Demand Generation",
      description: "Paid ads, SEO, content marketing — talep yaratma.",
    },
    {
      id: "d-inbound",
      name: "Inbound Sales",
      description: "Lead triage, qualification, outreach — kapıdan içeri.",
    },
    {
      id: "d-cs",
      name: "Customer Success",
      description: "Onboarding, health monitoring, renewals — müşteriyi tutma.",
    },
    {
      id: "d-revops",
      name: "Revenue Ops",
      description: "Pipeline forecast, attribution, raporlama — ritme disiplin.",
    },
  ],
  agents: [
    {
      deptId: "d-demand",
      intent: {
        name: "demand-gen-orchestrator",
        displayName: "Demand Gen Orchestrator",
        departmentId: "",
        purpose:
          "Ad, SEO ve content ekiplerinin haftalık ritmini yöneten orkestra ajanı.",
        model: "opus",
        scopes: ["read", "write"],
        mcpTools: ["mcp__slack__send_message", "mcp__notion__create_page"],
      },
    },
    {
      deptId: "d-demand",
      intent: {
        name: "paid-ads-analyst",
        displayName: "Paid Ads Analyst",
        departmentId: "",
        purpose:
          "Meta ve Google Ads performansını izler, bütçe önerileri üretir, anomali tespit eder.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-demand",
      intent: {
        name: "seo-content-writer",
        displayName: "SEO Content Writer",
        departmentId: "",
        purpose: "Anahtar kelime kümeleri ve blog taslakları üretir; editör onayına sunar.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-inbound",
      intent: {
        name: "lead-triager",
        displayName: "Lead Triager",
        departmentId: "",
        purpose:
          "Form ve webhook'tan gelen yeni lead'i zenginleştirir, skorlar ve doğru temsilciye atar.",
        model: "sonnet",
        scopes: ["read", "write"],
        mcpTools: ["mcp__hubspot__upsert_contact", "mcp__slack__send_message"],
      },
    },
    {
      deptId: "d-inbound",
      intent: {
        name: "sales-qualifier",
        displayName: "Sales Qualifier",
        departmentId: "",
        purpose:
          "Lead'i BANT/ICP çerçevesinde değerlendirir; uygun olmayanları filtreler.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-inbound",
      intent: {
        name: "outreach-drafter",
        displayName: "Outreach Drafter",
        departmentId: "",
        purpose:
          "Kişiselleştirilmiş outreach draftı üretir. external-send scope — insan onayı zorunlu.",
        model: "sonnet",
        scopes: ["read", "write", "external-send"],
        mcpTools: ["mcp__gmail__create_draft"],
      },
    },
    {
      deptId: "d-cs",
      intent: {
        name: "cs-health-monitor",
        displayName: "CS Health Monitor",
        departmentId: "",
        purpose:
          "Müşteri davranış sinyallerini (login, feature usage, ticket) izler, sağlık skoru üretir.",
        model: "sonnet",
        scopes: ["read", "write"],
        mcpTools: ["mcp__intercom__read_conversations"],
      },
    },
    {
      deptId: "d-cs",
      intent: {
        name: "renewal-scout",
        displayName: "Renewal Scout",
        departmentId: "",
        purpose:
          "60 gün kala yenilemesi gelen müşterileri işaretler, playbook önerisi verir.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-revops",
      intent: {
        name: "revops-forecaster",
        displayName: "RevOps Forecaster",
        departmentId: "",
        purpose:
          "Pipeline kapanış olasılıklarını hesaplar, haftalık forecast ve attribution üretir.",
        model: "opus",
        scopes: ["read", "write"],
      },
    },
  ],
  skills: [
    {
      ownerAgentName: "paid-ads-analyst",
      intent: {
        name: "ad-copy-generator",
        displayName: "Ad Copy Generator",
        purpose: "ICP'ye göre Meta/Google reklam metinleri üretir.",
        triggers: ["reklam metni üret", "ad copy"],
        category: "action",
      },
    },
    {
      ownerAgentName: "paid-ads-analyst",
      intent: {
        name: "audience-segmentation",
        displayName: "Audience Segmentation",
        purpose: "Geçmiş dönüşüm verisinden yüksek performanslı segment önerir.",
        triggers: ["audience çıkar", "lookalike"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "seo-content-writer",
      intent: {
        name: "seo-keyword-cluster",
        displayName: "SEO Keyword Cluster",
        purpose: "Bir niş için anahtar kelime kümeleri ve pillar content önerir.",
        triggers: ["keyword cluster", "içerik takvimi"],
        category: "research",
      },
    },
    {
      ownerAgentName: "seo-content-writer",
      intent: {
        name: "blog-draft",
        displayName: "Blog Draft",
        purpose: "Verilen brief için 1200 kelimelik editör-hazır blog taslağı üretir.",
        triggers: ["blog yaz", "taslak oluştur"],
        category: "synthesis",
      },
    },
    {
      ownerAgentName: "lead-triager",
      intent: {
        name: "lead-enrichment",
        displayName: "Lead Enrichment",
        purpose: "Yeni lead'in halka açık verilerini ve firma profilini çeker.",
        triggers: ["yeni lead", "formdan geldi"],
        category: "action",
      },
    },
    {
      ownerAgentName: "lead-triager",
      intent: {
        name: "lead-scorer",
        displayName: "Lead Scorer",
        purpose: "Zenginleştirilmiş lead'leri 1-100 aralığında skorlar.",
        triggers: ["lead skorla"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "sales-qualifier",
      intent: {
        name: "icp-match",
        displayName: "ICP Match",
        purpose: "Lead'in Ideal Customer Profile'a uygunluğunu ölçer.",
        triggers: ["icp eşleştir", "qualify"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "outreach-drafter",
      intent: {
        name: "outreach-personalize",
        displayName: "Outreach Personalize",
        purpose: "Lead profiline göre 3 paragraflık özel outreach taslağı üretir.",
        triggers: ["outreach yaz", "personalize email"],
        category: "action",
      },
    },
    {
      ownerAgentName: "outreach-drafter",
      intent: {
        name: "follow-up-scheduler",
        displayName: "Follow-up Scheduler",
        purpose: "Yanıtsız outreach'ler için 3/7/14 gün sonra follow-up planlar.",
        triggers: ["follow-up kur"],
        category: "action",
      },
    },
    {
      ownerAgentName: "cs-health-monitor",
      intent: {
        name: "health-score",
        displayName: "Health Score",
        purpose: "Her müşteri için 0-100 sağlık skoru ve kırılgan alan tespiti.",
        triggers: ["health çek", "müşteri sağlığı"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "cs-health-monitor",
      intent: {
        name: "churn-risk-signal",
        displayName: "Churn Risk Signal",
        purpose: "Churn olasılığı yüksek müşterileri erken tespit eder.",
        triggers: ["churn riski"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "renewal-scout",
      intent: {
        name: "renewal-playbook",
        displayName: "Renewal Playbook",
        purpose: "Yenileme 60 gün kala hesap yöneticisine playbook önerir.",
        triggers: ["renewal hazırla"],
        category: "action",
      },
    },
    {
      ownerAgentName: "revops-forecaster",
      intent: {
        name: "pipeline-forecast",
        displayName: "Pipeline Forecast",
        purpose: "Her stage'deki deal'lerin kapanış olasılığını hesaplayıp ay sonu forecast üretir.",
        triggers: ["pipeline tahmini"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "revops-forecaster",
      intent: {
        name: "attribution-report",
        displayName: "Attribution Report",
        purpose: "Çok-kanallı attribution (first-touch / last-touch / linear) raporu üretir.",
        triggers: ["attribution"],
        category: "analysis",
      },
    },
  ],
  workflows: [
    {
      deptId: "d-demand",
      intent: {
        name: "morning-demand-gen-pulse",
        purpose: "Her hafta içi 08:00'de ad performansı ve trafik özeti.",
        triggerKind: "schedule",
        cron: "0 8 * * 1-5",
        skillCalls: ["audience-segmentation", "ad-copy-generator"],
        notify: { channel: "slack", target: "#demand-gen" },
      },
    },
    {
      deptId: "d-inbound",
      intent: {
        name: "inbound-lead-triage",
        purpose: "Form webhook'tan gelen her lead için otomatik triage zinciri.",
        triggerKind: "webhook",
        webhookPath: "/hooks/lead-form",
        skillCalls: ["lead-enrichment", "lead-scorer", "icp-match"],
        notify: { channel: "slack", target: "#sales-inbound" },
      },
    },
    {
      deptId: "d-inbound",
      intent: {
        name: "weekly-outreach-batch",
        purpose: "Her Salı 10:00'de yüksek skorlu lead'lere outreach draft'ı hazırla.",
        triggerKind: "schedule",
        cron: "0 10 * * 2",
        skillCalls: ["outreach-personalize", "follow-up-scheduler"],
        notify: { channel: "slack", target: "#sales-outreach" },
      },
    },
    {
      deptId: "d-cs",
      intent: {
        name: "cs-health-scan",
        purpose: "Her gün 09:00'de tüm müşterilerin health score'u taranır.",
        triggerKind: "schedule",
        cron: "0 9 * * *",
        skillCalls: ["health-score", "churn-risk-signal"],
        notify: { channel: "slack", target: "#customer-success" },
      },
    },
    {
      deptId: "d-cs",
      intent: {
        name: "renewal-alert-60d",
        purpose: "Her Pazartesi 60 gün içinde yenilemesi gelen müşterileri işaretler.",
        triggerKind: "schedule",
        cron: "0 9 * * 1",
        skillCalls: ["renewal-playbook"],
        notify: { channel: "slack", target: "#customer-success" },
      },
    },
    {
      deptId: "d-revops",
      intent: {
        name: "weekly-revops-report",
        purpose: "Cuma 17:00 — pipeline forecast + attribution + exec review ön hazırlığı.",
        triggerKind: "schedule",
        cron: "0 17 * * 5",
        skillCalls: ["pipeline-forecast", "attribution-report"],
        notify: { channel: "slack", target: "#leadership" },
      },
    },
    {
      deptId: "d-revops",
      intent: {
        name: "attribution-monthly-close",
        purpose: "Ayın 1'inde bir önceki ay için tam attribution raporu.",
        triggerKind: "schedule",
        cron: "0 10 1 * *",
        skillCalls: ["attribution-report"],
        notify: { channel: "slack", target: "#leadership" },
      },
    },
  ],
  okrs: [
    {
      title: "MQL → SQL dönüşüm oranını %30'a çıkar",
      metric: "MQL→SQL dönüşüm oranı",
      target: 30,
      unit: "%",
    },
    {
      title: "Inbound lead yanıt süresi < 10 dakika",
      metric: "Ortalama yanıt süresi (dk)",
      target: 10,
      unit: "dk",
      invert: true,
    },
    {
      title: "Customer health ≥ 70 olan müşteri oranı %85",
      metric: "Sağlıklı müşteri oranı",
      target: 85,
      unit: "%",
    },
    {
      title: "Net Revenue Retention %120",
      metric: "NRR",
      target: 120,
      unit: "%",
    },
  ],
};

// ============================================================================
// 2) Customer Success Pack — compact (3 depts / 5 agents / 7 skills / 3 wf)
// ============================================================================

const customerSuccess: Blueprint = {
  id: "bp-customer-success",
  domain: "customer-success",
  displayName: "Customer Success",
  summary:
    "Aktif müşteri başarı operasyonu: onboarding, health, destek ve churn önleme.",
  hero: "Yeni müşteri → otomatik onboarding + sağlık taraması + eskalasyon zinciri.",
  author: "matrix-official",
  tags: ["customer-success", "churn", "onboarding", "intercom"],
  estimatedSetupMinutes: 9,
  estimatedMonthlyHoursSaved: 28,
  coverPalette: "quantum",
  digitalCoverage: 88,
  physicalBridges: [
    "NPS saha anket QR kodları",
    "Mağaza içi müşteri deneyim ölçümü (iPad kiosk)",
    "Destek çağrılarının sentiment analizi (telefon entegrasyonu)",
  ],
  departments: [
    { id: "d-onboard", name: "Onboarding", description: "Yeni müşteriyi ilk değerine taşıma." },
    { id: "d-health", name: "Health & Retention", description: "Aktif müşterinin nabzı." },
    { id: "d-support", name: "Support", description: "Destek ticket triage + SLA." },
  ],
  agents: [
    {
      deptId: "d-onboard",
      intent: {
        name: "onboarding-guide",
        displayName: "Onboarding Guide",
        departmentId: "",
        purpose: "Yeni müşteriye adım adım aktivasyon rehberi sağlar.",
        model: "sonnet",
        scopes: ["read", "write", "external-send"],
      },
    },
    {
      deptId: "d-health",
      intent: {
        name: "health-analyst",
        displayName: "Health Analyst",
        departmentId: "",
        purpose: "Ürün kullanım verisiyle health score üretir.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-health",
      intent: {
        name: "churn-defender",
        displayName: "Churn Defender",
        departmentId: "",
        purpose: "Düşüş sinyali gösteren hesaplar için kurtarma playbook'u tetikler.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-support",
      intent: {
        name: "support-triager",
        displayName: "Support Triager",
        departmentId: "",
        purpose: "Gelen destek ticket'larını kategorize eder ve önceliklendirir.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-support",
      intent: {
        name: "support-reply-drafter",
        displayName: "Support Reply Drafter",
        departmentId: "",
        purpose: "Ticket'a yanıt taslağı hazırlar; insan onayıyla gönderir.",
        model: "sonnet",
        scopes: ["read", "write", "external-send"],
      },
    },
  ],
  skills: [
    {
      ownerAgentName: "onboarding-guide",
      intent: {
        name: "onboarding-checklist",
        displayName: "Onboarding Checklist",
        purpose: "Her müşteri için aktivasyon adım listesi oluşturur.",
        triggers: ["yeni müşteri", "onboarding"],
        category: "action",
      },
    },
    {
      ownerAgentName: "onboarding-guide",
      intent: {
        name: "first-value-email",
        displayName: "First Value Email",
        purpose: "İlk 7 gün içinde ilk değeri yakalayan özelleştirilmiş email.",
        triggers: ["first value"],
        category: "action",
      },
    },
    {
      ownerAgentName: "health-analyst",
      intent: {
        name: "health-score",
        displayName: "Health Score",
        purpose: "Kullanım + ticket + NPS sinyallerinden 0-100 sağlık skoru.",
        triggers: ["health çek"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "churn-defender",
      intent: {
        name: "retention-playbook",
        displayName: "Retention Playbook",
        purpose: "Riskli müşteri için kişiselleştirilmiş kurtarma planı üretir.",
        triggers: ["retention"],
        category: "action",
      },
    },
    {
      ownerAgentName: "support-triager",
      intent: {
        name: "ticket-classifier",
        displayName: "Ticket Classifier",
        purpose: "Ticket'ı kategori + aciliyet + sahip ataması ile etiketler.",
        triggers: ["ticket gelsin"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "support-reply-drafter",
      intent: {
        name: "reply-draft",
        displayName: "Reply Draft",
        purpose: "Ticket için bağlam-aware yanıt taslağı üretir.",
        triggers: ["yanıt yaz"],
        category: "action",
      },
    },
    {
      ownerAgentName: "support-reply-drafter",
      intent: {
        name: "sla-monitor",
        displayName: "SLA Monitor",
        purpose: "SLA eşiği yaklaşan ticket'lar için uyarı kuyruğu oluşturur.",
        triggers: ["sla izle"],
        category: "analysis",
      },
    },
  ],
  workflows: [
    {
      deptId: "d-onboard",
      intent: {
        name: "new-customer-activation",
        purpose: "Yeni müşteri HubSpot'ta açıldığında 7 günlük aktivasyon zinciri.",
        triggerKind: "webhook",
        webhookPath: "/hooks/new-customer",
        skillCalls: ["onboarding-checklist", "first-value-email"],
        notify: { channel: "slack", target: "#cs-onboarding" },
      },
    },
    {
      deptId: "d-health",
      intent: {
        name: "daily-health-sweep",
        purpose: "Günlük 08:30 tüm müşterilerin sağlık taraması.",
        triggerKind: "schedule",
        cron: "30 8 * * *",
        skillCalls: ["health-score", "retention-playbook"],
        notify: { channel: "slack", target: "#customer-success" },
      },
    },
    {
      deptId: "d-support",
      intent: {
        name: "ticket-triage-realtime",
        purpose: "Intercom'dan gelen her yeni ticket için triage + SLA izleme.",
        triggerKind: "webhook",
        webhookPath: "/hooks/intercom-ticket",
        skillCalls: ["ticket-classifier", "sla-monitor"],
        notify: { channel: "slack", target: "#support-ops" },
      },
    },
  ],
  okrs: [
    {
      title: "Net Revenue Retention %120",
      metric: "NRR",
      target: 120,
      unit: "%",
    },
    {
      title: "Destek ticket SLA uyumu %95",
      metric: "SLA başarı oranı",
      target: 95,
      unit: "%",
    },
    {
      title: "Ortalama onboarding süresi < 10 gün",
      metric: "İlk değer süresi (gün)",
      target: 10,
      unit: "gün",
      invert: true,
    },
  ],
};

// ============================================================================
// 3) Finance & Reporting — compact
// ============================================================================

const finance: Blueprint = {
  id: "bp-finance",
  domain: "finance",
  displayName: "Finance & Reporting",
  summary:
    "Nakit akışı izleme, burn rate uyarıları, aylık finansal close disiplini.",
  hero: "Banka → otomatik kategorilendirme → anomali tespiti → aylık close raporu.",
  author: "matrix-official",
  tags: ["finance", "accounting", "burn-rate", "cash-flow"],
  estimatedSetupMinutes: 7,
  estimatedMonthlyHoursSaved: 18,
  coverPalette: "solar",
  digitalCoverage: 85,
  physicalBridges: [
    "POS cihazı → günlük ciro akışı",
    "Fatura tarama OCR (mobil uygulama)",
    "Kargo/lojistik IoT gateway → ürün maliyet doğrulama",
  ],
  departments: [
    { id: "d-cash", name: "Cash & Treasury", description: "Banka hesapları, nakit akışı." },
    { id: "d-close", name: "Monthly Close", description: "Aylık kapanış disiplini." },
  ],
  agents: [
    {
      deptId: "d-cash",
      intent: {
        name: "cash-monitor",
        displayName: "Cash Monitor",
        departmentId: "",
        purpose: "Günlük nakit pozisyonu ve burn rate hesaplar; anomali uyarır.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-cash",
      intent: {
        name: "expense-categorizer",
        displayName: "Expense Categorizer",
        departmentId: "",
        purpose: "Banka ve kredi kartı işlemlerini muhasebe kategorilerine atar.",
        model: "haiku",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-close",
      intent: {
        name: "close-orchestrator",
        displayName: "Close Orchestrator",
        departmentId: "",
        purpose: "Aylık kapanış checklist'ini yönetir, eksikleri işaretler.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
  ],
  skills: [
    {
      ownerAgentName: "cash-monitor",
      intent: {
        name: "burn-rate",
        displayName: "Burn Rate Calculator",
        purpose: "Son 30 günün net yakımını hesaplar, runway kestirir.",
        triggers: ["burn rate", "runway"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "cash-monitor",
      intent: {
        name: "anomaly-detector",
        displayName: "Anomaly Detector",
        purpose: "Olağandışı büyük veya tekrarlayan işlemleri işaretler.",
        triggers: ["anomali", "şüpheli işlem"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "expense-categorizer",
      intent: {
        name: "categorize-transaction",
        displayName: "Categorize Transaction",
        purpose: "Merchant ve açıklamadan kategori önerir.",
        triggers: ["kategori bul"],
        category: "action",
      },
    },
    {
      ownerAgentName: "close-orchestrator",
      intent: {
        name: "close-checklist",
        displayName: "Close Checklist",
        purpose: "Aylık kapanışın 14 adımlı disiplinini yürütür.",
        triggers: ["aylık close", "kapanış"],
        category: "action",
      },
    },
  ],
  workflows: [
    {
      deptId: "d-cash",
      intent: {
        name: "daily-cash-pulse",
        purpose: "Her sabah banka pozisyonu + burn rate özeti.",
        triggerKind: "schedule",
        cron: "30 8 * * 1-5",
        skillCalls: ["burn-rate", "anomaly-detector"],
        notify: { channel: "slack", target: "#finance-daily" },
      },
    },
    {
      deptId: "d-close",
      intent: {
        name: "monthly-close-sprint",
        purpose: "Her ayın ilk iş günü tam kapanış zinciri.",
        triggerKind: "schedule",
        cron: "0 9 1 * *",
        skillCalls: ["close-checklist"],
        notify: { channel: "slack", target: "#finance" },
      },
    },
  ],
  okrs: [
    {
      title: "Runway > 18 ay",
      metric: "Kalan runway (ay)",
      target: 18,
      unit: "ay",
    },
    {
      title: "Aylık close süresi < 5 iş günü",
      metric: "Close süresi (gün)",
      target: 5,
      unit: "gün",
      invert: true,
    },
  ],
};

// ============================================================================
// 4) HR & Talent — recruiting, onboarding, people ops
// ============================================================================

const hrTalent: Blueprint = {
  id: "bp-hr-talent",
  domain: "hr-talent",
  displayName: "HR & Talent",
  summary:
    "Aday hunisi, mülakat triage, onboarding ve çalışan deneyimi — uçtan uca talent operasyonu.",
  hero: "Başvuru → otomatik triage → mülakat zinciri → teklif taslağı → onboarding plan.",
  author: "matrix-official",
  tags: ["hr", "talent", "recruiting", "onboarding"],
  estimatedSetupMinutes: 8,
  estimatedMonthlyHoursSaved: 24,
  coverPalette: "nebula",
  digitalCoverage: 80,
  physicalBridges: [
    "Mülakat QR check-in (ofiste)",
    "Ofis içi anlık duygu anketi (iPad kiosk)",
    "Yeni başlayan fiziksel ekipman tesliminin QR onayı",
  ],
  departments: [
    {
      id: "d-talent-acq",
      name: "Talent Acquisition",
      description: "Aday hunisi, mülakat, teklif.",
    },
    {
      id: "d-people-ops",
      name: "People Ops",
      description: "Onboarding, gelişim, çalışan deneyimi.",
    },
  ],
  agents: [
    {
      deptId: "d-talent-acq",
      intent: {
        name: "candidate-triager",
        displayName: "Candidate Triager",
        departmentId: "",
        purpose:
          "Başvuruları CV + portfolyo + kültür sinyalleriyle ön-eler, uygun olanları mülakata çıkarır.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-talent-acq",
      intent: {
        name: "interview-coordinator",
        displayName: "Interview Coordinator",
        departmentId: "",
        purpose:
          "Mülakat panelini ayarlar, takvim bulur, hatırlatmalar yollar, geri bildirim toplar.",
        model: "sonnet",
        scopes: ["read", "write", "external-send"],
      },
    },
    {
      deptId: "d-talent-acq",
      intent: {
        name: "offer-drafter",
        displayName: "Offer Drafter",
        departmentId: "",
        purpose: "Onay sonrası teklif mektubu taslağı hazırlar. external-send onay zorunlu.",
        model: "sonnet",
        scopes: ["read", "write", "external-send"],
      },
    },
    {
      deptId: "d-people-ops",
      intent: {
        name: "onboarding-orchestrator",
        displayName: "Onboarding Orchestrator",
        departmentId: "",
        purpose: "İlk 30/60/90 gün planını oluşturur ve takip eder.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-people-ops",
      intent: {
        name: "pulse-analyst",
        displayName: "Pulse Analyst",
        departmentId: "",
        purpose: "Haftalık pulse anketini okur; duygu analizi + trend + risk sinyali üretir.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
  ],
  skills: [
    {
      ownerAgentName: "candidate-triager",
      intent: {
        name: "cv-parser",
        displayName: "CV Parser",
        purpose: "CV'yi yapılandırılmış profil (deneyim, beceriler, ödüller) haline getirir.",
        triggers: ["cv oku", "başvuru analizi"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "candidate-triager",
      intent: {
        name: "culture-match",
        displayName: "Culture Match",
        purpose: "Aday profili ile şirket değer çıpalarını karşılaştırır.",
        triggers: ["kültür uyumu"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "interview-coordinator",
      intent: {
        name: "panel-scheduler",
        displayName: "Panel Scheduler",
        purpose: "Mülakat paneli için uygun zaman aralığı bulur.",
        triggers: ["mülakat kur"],
        category: "action",
      },
    },
    {
      ownerAgentName: "interview-coordinator",
      intent: {
        name: "feedback-synth",
        displayName: "Feedback Synth",
        purpose: "Panel üyelerinin geri bildirimlerini tek bir karar özetine dönüştürür.",
        triggers: ["mülakat özeti"],
        category: "synthesis",
      },
    },
    {
      ownerAgentName: "offer-drafter",
      intent: {
        name: "offer-letter-draft",
        displayName: "Offer Letter Draft",
        purpose: "Şirket şablonuna uygun, kişiselleştirilmiş teklif mektubu üretir.",
        triggers: ["teklif yaz"],
        category: "action",
      },
    },
    {
      ownerAgentName: "onboarding-orchestrator",
      intent: {
        name: "30-60-90-plan",
        displayName: "30-60-90 Plan",
        purpose: "Yeni başlayan için 30/60/90 gün hedef planı kurar.",
        triggers: ["onboarding plan"],
        category: "action",
      },
    },
    {
      ownerAgentName: "pulse-analyst",
      intent: {
        name: "pulse-synth",
        displayName: "Pulse Synth",
        purpose: "Haftalık pulse verisinden ekip sağlığı + risk sinyali üretir.",
        triggers: ["pulse analizi"],
        category: "analysis",
      },
    },
  ],
  workflows: [
    {
      deptId: "d-talent-acq",
      intent: {
        name: "new-application-triage",
        purpose: "Her yeni başvuru için otomatik triage + ilk geri dönüş.",
        triggerKind: "webhook",
        webhookPath: "/hooks/application",
        skillCalls: ["cv-parser", "culture-match"],
        notify: { channel: "slack", target: "#talent" },
      },
    },
    {
      deptId: "d-talent-acq",
      intent: {
        name: "interview-followup",
        purpose: "Mülakat sonrası panel geri bildirimi toplar ve karar özeti üretir.",
        triggerKind: "webhook",
        webhookPath: "/hooks/interview-done",
        skillCalls: ["feedback-synth"],
        notify: { channel: "slack", target: "#talent" },
      },
    },
    {
      deptId: "d-people-ops",
      intent: {
        name: "weekly-pulse",
        purpose: "Her Cuma ekip pulse anketini analiz edip risk paternlerini çıkarır.",
        triggerKind: "schedule",
        cron: "0 15 * * 5",
        skillCalls: ["pulse-synth"],
        notify: { channel: "slack", target: "#leadership" },
      },
    },
    {
      deptId: "d-people-ops",
      intent: {
        name: "onboarding-day-zero",
        purpose: "Yeni başlayan için 1. gün checklist'i ve sistem erişimlerinin doğrulanması.",
        triggerKind: "webhook",
        webhookPath: "/hooks/new-hire",
        skillCalls: ["30-60-90-plan"],
        notify: { channel: "slack", target: "#people-ops" },
      },
    },
  ],
  okrs: [
    {
      title: "Aday → Teklif dönüşüm oranı %25",
      metric: "Aday dönüşüm",
      target: 25,
      unit: "%",
    },
    {
      title: "Ortalama işe alma süresi < 28 gün",
      metric: "Time to hire (gün)",
      target: 28,
      unit: "gün",
      invert: true,
    },
    {
      title: "90 günlük kalma oranı %95",
      metric: "90d retention",
      target: 95,
      unit: "%",
    },
  ],
};

// ============================================================================
// 5) Product Management — discovery → spec → launch
// ============================================================================

const product: Blueprint = {
  id: "bp-product",
  domain: "product",
  displayName: "Product Management",
  summary:
    "Kullanıcı sinyallerinden spec'e, spec'ten lansmana ürün yönetimi pipeline'ı.",
  hero: "User signal → opportunity → spec → experiment → launch → adoption metric.",
  author: "matrix-official",
  tags: ["product", "research", "roadmap", "experiments"],
  estimatedSetupMinutes: 10,
  estimatedMonthlyHoursSaved: 32,
  coverPalette: "ion",
  digitalCoverage: 94,
  physicalBridges: [
    "Kullanıcı görüşme ses kaydı → otomatik transkript + insight",
    "Etkinlik / meetup geri bildirim QR formları",
    "Fiziksel ürün varsa IoT telemetri → kullanım sinyali",
  ],
  departments: [
    {
      id: "d-discovery",
      name: "Discovery",
      description: "Kullanıcı sinyali, fırsat haritalama, problem framing.",
    },
    {
      id: "d-delivery",
      name: "Delivery",
      description: "Spec, experiment, lansman, metrik izleme.",
    },
  ],
  agents: [
    {
      deptId: "d-discovery",
      intent: {
        name: "signal-miner",
        displayName: "Signal Miner",
        departmentId: "",
        purpose:
          "Destek ticket, NPS, satış kaydı, görüşme transkriptlerinden kalıp çıkarır.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-discovery",
      intent: {
        name: "opportunity-mapper",
        displayName: "Opportunity Mapper",
        departmentId: "",
        purpose: "Sinyalleri fırsat ağacına (Teresa Torres tarzı) yerleştirir.",
        model: "opus",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-delivery",
      intent: {
        name: "spec-writer",
        displayName: "Spec Writer",
        departmentId: "",
        purpose: "Problem + hedef + kabul kriterleriyle PRD taslağı üretir.",
        model: "opus",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-delivery",
      intent: {
        name: "experiment-analyst",
        displayName: "Experiment Analyst",
        departmentId: "",
        purpose: "A/B ve feature flag sonuçlarını yorumlar, karar önerir.",
        model: "sonnet",
        scopes: ["read", "write"],
      },
    },
    {
      deptId: "d-delivery",
      intent: {
        name: "launch-coordinator",
        displayName: "Launch Coordinator",
        departmentId: "",
        purpose:
          "Lansman checklist'ini yürütür: changelog, dokümantasyon, destek eğitimi, iletişim.",
        model: "sonnet",
        scopes: ["read", "write", "external-send"],
      },
    },
  ],
  skills: [
    {
      ownerAgentName: "signal-miner",
      intent: {
        name: "transcript-cluster",
        displayName: "Transcript Cluster",
        purpose: "Kullanıcı görüşmelerinin transkript'lerinden tema kümeleri çıkarır.",
        triggers: ["görüşme kümelemesi"],
        category: "synthesis",
      },
    },
    {
      ownerAgentName: "signal-miner",
      intent: {
        name: "ticket-topic-trend",
        displayName: "Ticket Topic Trend",
        purpose: "Destek ticket'larındaki konu trendlerini izler.",
        triggers: ["ticket trendi"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "opportunity-mapper",
      intent: {
        name: "opportunity-tree",
        displayName: "Opportunity Tree Builder",
        purpose: "Hedef → fırsat → çözüm hiyerarşisini oluşturur.",
        triggers: ["fırsat ağacı"],
        category: "synthesis",
      },
    },
    {
      ownerAgentName: "spec-writer",
      intent: {
        name: "prd-draft",
        displayName: "PRD Draft",
        purpose: "Problem + kullanıcı hikayesi + kabul kriterleri yapısında spec üretir.",
        triggers: ["prd yaz", "spec taslağı"],
        category: "action",
      },
    },
    {
      ownerAgentName: "spec-writer",
      intent: {
        name: "success-metrics",
        displayName: "Success Metrics",
        purpose: "Her feature için mantıklı ölçüt metrik seti önerir.",
        triggers: ["başarı metrikleri"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "experiment-analyst",
      intent: {
        name: "ab-test-interpret",
        displayName: "A/B Test Interpreter",
        purpose: "A/B sonucundan istatistik anlamlılık + iş etkisi çıkarır.",
        triggers: ["a/b sonucu"],
        category: "analysis",
      },
    },
    {
      ownerAgentName: "launch-coordinator",
      intent: {
        name: "launch-checklist",
        displayName: "Launch Checklist",
        purpose: "Lansman öncesi 18 adımlı disiplin kontrolü.",
        triggers: ["lansman kontrol"],
        category: "action",
      },
    },
    {
      ownerAgentName: "launch-coordinator",
      intent: {
        name: "changelog-writer",
        displayName: "Changelog Writer",
        purpose: "Release için müşteri-dostu changelog yazar.",
        triggers: ["changelog"],
        category: "action",
      },
    },
  ],
  workflows: [
    {
      deptId: "d-discovery",
      intent: {
        name: "weekly-signal-scan",
        purpose: "Her Pazartesi son hafta boyunca gelen kullanıcı sinyallerini sentezle.",
        triggerKind: "schedule",
        cron: "0 10 * * 1",
        skillCalls: ["transcript-cluster", "ticket-topic-trend"],
        notify: { channel: "slack", target: "#product-discovery" },
      },
    },
    {
      deptId: "d-delivery",
      intent: {
        name: "launch-pipeline",
        purpose: "Release tag atıldığında tam lansman zinciri.",
        triggerKind: "webhook",
        webhookPath: "/hooks/release-tag",
        skillCalls: ["launch-checklist", "changelog-writer"],
        notify: { channel: "slack", target: "#product-launch" },
      },
    },
    {
      deptId: "d-delivery",
      intent: {
        name: "experiment-weekly-review",
        purpose: "Cuma 14:00 aktif A/B testlerinin durum özeti.",
        triggerKind: "schedule",
        cron: "0 14 * * 5",
        skillCalls: ["ab-test-interpret"],
        notify: { channel: "slack", target: "#experiments" },
      },
    },
  ],
  okrs: [
    {
      title: "Feature benimsenme oranı ≥ %40",
      metric: "Active usage / release",
      target: 40,
      unit: "%",
    },
    {
      title: "Aylık > 3 kararlı experiment sonuçlandır",
      metric: "Experiment throughput",
      target: 3,
      unit: "exp",
    },
    {
      title: "Fikir → lansman ortalama süresi < 6 hafta",
      metric: "Idea to launch (hafta)",
      target: 6,
      unit: "hafta",
      invert: true,
    },
  ],
};

export const blueprints: Blueprint[] = [
  salesMarketing,
  customerSuccess,
  finance,
  hrTalent,
  product,
];

export function getBlueprint(id: string): Blueprint | null {
  return blueprints.find((b) => b.id === id) ?? null;
}
