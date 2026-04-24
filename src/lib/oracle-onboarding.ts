/**
 * Oracle Onboarding — workspace yaratıldıktan sonra kişiselleştirilmiş
 * proje önerisi üretir.
 *
 * İki mod:
 *   1. RULE-BASED (default, offline) — template tipine göre canonical proposal
 *   2. CLAUDE-ENHANCED (ANTHROPIC_API_KEY varsa) — Claude ile dinamik proposal
 *
 * Kullanıcı interview cevaplarını verir, bu motor proje iskeletini üretir:
 *   - Departmanlar (org graph)
 *   - Skills (canonical name + summary + scopes)
 *   - Agents (name + model routing + skill list)
 *   - Workflows (cron + step outline)
 *   - Physical/human tasks (The Operator'a düşer)
 *   - Milestones (30/60/90 gün, Captain's Log Rocks'a düşer)
 */

import type { AssetTemplate } from "./asset-templates";

// ───────────────────────────────────────────────────────────────────────────
// Interview Answers
// ───────────────────────────────────────────────────────────────────────────

export interface InterviewAnswers {
  /** Aylık gelir hedefi (USD) */
  monthlyRevenueTargetUsd: number;
  /** Hedefe kaç ayda ulaşma hedefi */
  timelineMonths: number;
  /** Spesifik niş (serbest metin) */
  niche: string;
  /** Haftalık zaman bütçesi (saat) */
  weeklyHoursAvailable: number;
  /** Başlangıç sermayesi (USD) */
  startingCapitalUsd: number;
  /** Unique angle / hipotez */
  uniqueAngle?: string;
}

// ───────────────────────────────────────────────────────────────────────────
// Proposal Types
// ───────────────────────────────────────────────────────────────────────────

export interface ProposedDepartment {
  name: string; // kebab-case
  displayName: string;
  summary: string;
  accent: "ion" | "nebula" | "quantum" | "solar";
}

export interface ProposedSkill {
  name: string;
  displayName: string;
  summary: string;
  scopes: Array<"read" | "write" | "external-send">;
  modelPreference?: "opus" | "sonnet" | "haiku";
}

export interface ProposedAgent {
  name: string;
  displayName: string;
  role: string;
  summary: string;
  departmentName: string; // references ProposedDepartment.name
  skillNames: string[];
  model: "opus" | "sonnet" | "haiku";
}

export interface ProposedWorkflow {
  name: string;
  displayName: string;
  cadence: string; // "cron:0 9 * * 1" | "manual" | etc.
  description: string;
  steps: string[]; // high-level step descriptions
}

export interface ProposedPhysicalTask {
  title: string;
  description: string;
  realm: "physical";
  priority: "p0" | "p1" | "p2" | "p3";
  estimatedMinutes: number;
  dueInDays: number; // relative to workspace creation
}

export interface ProposedMilestone {
  label: string; // "30 gün", "60 gün", "90 gün"
  daysFromNow: number;
  rockTitle: string;
  rockDescription: string;
  targetMetric: string; // "$500 MRR" gibi
  status: "pending";
}

export interface OracleProposal {
  /** Oracle'ın tek-paragraf açıklaması */
  narrative: string;
  /** Oracle'ın bu işe güven skoru (0-100) — hedef × zaman × kapital analizi */
  confidenceScore: number;
  /** Confidence gerekçesi */
  confidenceReasoning: string;
  departments: ProposedDepartment[];
  skills: ProposedSkill[];
  agents: ProposedAgent[];
  workflows: ProposedWorkflow[];
  physicalTasks: ProposedPhysicalTask[];
  milestones: ProposedMilestone[];
  /** Bu proposal üretim modu */
  mode: "rule-based" | "claude-enhanced";
}

// ───────────────────────────────────────────────────────────────────────────
// Rule-based generators — template tipine göre canonical proposal
// ───────────────────────────────────────────────────────────────────────────

export function generateProposal(
  template: AssetTemplate,
  answers: InterviewAnswers
): OracleProposal {
  // Template tipine göre uygun generator'ı çağır
  switch (template.type) {
    case "saas":
    case "micro-saas":
      return generateSaasProposal(template, answers);
    case "newsletter":
    case "podcast":
      return generateContentProposal(template, answers);
    case "youtube":
      return generateYouTubeProposal(template, answers);
    case "course":
      return generateCourseProposal(template, answers);
    case "ecommerce":
      return generateEcommerceProposal(template, answers);
    case "affiliate":
      return generateAffiliateProposal(template, answers);
    case "digital-product":
      return generateDigitalProductProposal(template, answers);
    case "agency":
      return generateAgencyProposal(template, answers);
    case "community":
      return generateCommunityProposal(template, answers);
    case "mobile-app":
    case "chrome-extension":
      return generateSaasProposal(template, answers); // similar pattern
    case "job-board":
      return generateAffiliateProposal(template, answers); // similar two-sided pattern
    default:
      return generateGenericProposal(template, answers);
  }
}

/**
 * Confidence skoru — hedef × zaman × kapital uyumluluk analizi.
 * Agresif hedefleri destekleriz ama gerçekçi geri bildirim veririz.
 */
function computeConfidence(
  template: AssetTemplate,
  answers: InterviewAnswers
): { score: number; reasoning: string } {
  const target = answers.monthlyRevenueTargetUsd;
  const months = answers.timelineMonths;
  const hours = answers.weeklyHoursAvailable;
  const capital = answers.startingCapitalUsd;

  let score = 60; // baseline
  const reasons: string[] = [];

  // Timeline realism — template.timeToFirstDollar'a göre
  const typicalFirstDollarMonths = parseTypicalMonths(template.timeToFirstDollar);
  if (months < typicalFirstDollarMonths) {
    score -= 20;
    reasons.push(
      `bu türde ilk dolar ~${typicalFirstDollarMonths} ay, senin ${months} ay hedefin agresif`
    );
  } else if (months >= typicalFirstDollarMonths * 1.5) {
    score += 10;
    reasons.push("timeline ile ilk-dolar bandı uyumlu");
  }

  // Revenue target vs typical
  const typicalMidMrr = parseTypicalMrrMid(template.typicalMrrBand);
  if (target > typicalMidMrr * 3) {
    score -= 15;
    reasons.push(
      `$${target}/ay hedefin bu türde üst %10'da, orta band $${typicalMidMrr}/ay`
    );
  } else if (target <= typicalMidMrr) {
    score += 10;
    reasons.push("gelir hedefi sürdürülebilir bant içinde");
  }

  // Hours available
  if (hours < 5) {
    score -= 20;
    reasons.push("haftada <5 saat çoğu asset için yetersiz");
  } else if (hours >= 15) {
    score += 15;
    reasons.push("haftalık zaman bütçen çok sağlıklı");
  }

  // Capital — bazı türler sermaye-hafif, bazıları değil
  const capitalHeavy = ["ecommerce", "mobile-app"].includes(template.type);
  if (capitalHeavy && capital < 1000) {
    score -= 15;
    reasons.push(`${template.label} için $${capital} başlangıç sermayesi sınırlı`);
  } else if (!capitalHeavy && capital >= 500) {
    score += 5;
    reasons.push("sermaye-hafif model için mevcut başlangıç yeterli");
  }

  score = Math.max(10, Math.min(95, score));

  let reasoning = reasons.slice(0, 3).join("; ");
  if (score >= 75) reasoning = `Yüksek olasılıkla başarılı: ${reasoning}.`;
  else if (score >= 55) reasoning = `Olabilir ama dikkat: ${reasoning}.`;
  else reasoning = `Gerçekçi ol: ${reasoning}.`;

  return { score, reasoning };
}

function parseTypicalMonths(band: string): number {
  // "2-4 ay" → 3 (mid)
  const match = band.match(/(\d+)\s*-\s*(\d+)/);
  if (match) return (parseInt(match[1]) + parseInt(match[2])) / 2;
  return 6;
}

function parseTypicalMrrMid(band: string): number {
  // "$2K-$15K/ay" → 8500 (mid)
  const match = band.match(/\$(\d+(?:\.\d+)?)K?\s*-\s*\$(\d+(?:\.\d+)?)K?/);
  if (match) {
    const lo = parseFloat(match[1]) * (band.includes("K") ? 1000 : 1);
    const hi = parseFloat(match[2]) * (band.includes("K") ? 1000 : 1);
    return (lo + hi) / 2;
  }
  return 5000;
}

// ───────────────────────────────────────────────────────────────────────────
// Affiliate / SEO proposal generator
// ───────────────────────────────────────────────────────────────────────────

function generateAffiliateProposal(
  template: AssetTemplate,
  answers: InterviewAnswers
): OracleProposal {
  const { score, reasoning } = computeConfidence(template, answers);
  const target = answers.monthlyRevenueTargetUsd;
  const niche = answers.niche || "[niş]";

  return {
    mode: "rule-based",
    confidenceScore: score,
    confidenceReasoning: reasoning,
    narrative: `${niche} nişinde affiliate SEO sitesi. Hedef: ${answers.timelineMonths} ayda $${target}/ay pasif gelir. Matrix'in SEO writer + keyword researcher ajanlarıyla ayda 20+ sayfa üretilebilir. Google Helpful Content uyumu için human-edit katmanı şart. Ana kaldıraç: commercial-intent keyword + affiliate program karması.`,
    departments: [
      {
        name: "content-ops",
        displayName: "Content Operations",
        summary: "Keyword araştırma → taslak → editör review → publish",
        accent: "nebula",
      },
      {
        name: "growth",
        displayName: "Growth",
        summary: "SEO backlink, internal linking, affiliate partner outreach",
        accent: "solar",
      },
    ],
    skills: [
      {
        name: "keyword-researcher",
        displayName: "Keyword Researcher",
        summary:
          "Ahrefs/SEMrush pattern ile commercial-intent keyword'leri bulur, zorluk + CPC skorlar",
        scopes: ["read"],
        modelPreference: "sonnet",
      },
      {
        name: "content-writer",
        displayName: "Content Writer",
        summary:
          "Canlı örnek paragraflı 1500-3000 kelime karşılaştırma yazıları yazar",
        scopes: ["read", "write"],
        modelPreference: "sonnet",
      },
      {
        name: "seo-optimizer",
        displayName: "SEO Optimizer",
        summary:
          "On-page SEO (meta, heading, internal link, alt text) + schema markup",
        scopes: ["read", "write"],
        modelPreference: "haiku",
      },
      {
        name: "affiliate-link-manager",
        displayName: "Affiliate Link Manager",
        summary: "Her içerikteki affiliate link'leri günceller, broken link tarar",
        scopes: ["read", "write", "external-send"],
        modelPreference: "haiku",
      },
      {
        name: "editor-review",
        displayName: "Editor Review",
        summary: "Human-edit öncesi AI fact-check + tone-of-voice + hallucination",
        scopes: ["read"],
        modelPreference: "sonnet",
      },
    ],
    agents: [
      {
        name: "seo-researcher",
        displayName: "SEO Researcher",
        role: "Research",
        summary:
          "Haftada 10 yeni keyword fırsatı bulur, zorluk skoru ve affiliate program eşleşmesi",
        departmentName: "content-ops",
        skillNames: ["keyword-researcher"],
        model: "sonnet",
      },
      {
        name: "content-publisher",
        displayName: "Content Publisher",
        role: "Content",
        summary:
          "Haftada 5 taslak üretir → editor-review → SEO optimizer → WordPress publish",
        departmentName: "content-ops",
        skillNames: ["content-writer", "seo-optimizer", "editor-review"],
        model: "sonnet",
      },
      {
        name: "link-maintainer",
        displayName: "Link Maintainer",
        role: "Ops",
        summary:
          "Aylık tüm sayfaları tarayıp broken link + güncel olmayan affiliate kodu tespit eder",
        departmentName: "growth",
        skillNames: ["affiliate-link-manager"],
        model: "haiku",
      },
    ],
    workflows: [
      {
        name: "weekly-content-pipeline",
        displayName: "Haftalık İçerik Pipeline",
        cadence: "cron: Pazartesi 06:00",
        description:
          "seo-researcher → 10 keyword seç → content-publisher → 5 taslak → editor-review → WordPress draft",
        steps: [
          "seo-researcher keyword listesi çıkartır",
          "Ferhan 5 keyword onaylar (approval gate)",
          "content-publisher 5 taslak yazar",
          "editor-review ve seo-optimizer geçer",
          "WordPress'e draft olarak yazılır (external-send approval)",
        ],
      },
      {
        name: "monthly-link-audit",
        displayName: "Aylık Link Audit",
        cadence: "cron: ayın 1'i 09:00",
        description:
          "link-maintainer tüm sayfaları tarar, broken link + eski affiliate kod raporu üretir",
        steps: [
          "Tüm sayfaları crawl et",
          "Affiliate link durumlarını kontrol et",
          "Broken/stale link'leri Operator'a task olarak düşür",
        ],
      },
    ],
    physicalTasks: [
      {
        title: `${niche} için 3-5 affiliate programına başvuru`,
        description:
          "İlgili affiliate network'lere (Amazon Associates, Impact, ShareASale, niche-specific) hesap aç, terms'leri oku, tax form doldur. Matrix ajanları hesap açamaz — bu seni bekliyor.",
        realm: "physical",
        priority: "p0",
        estimatedMinutes: 180,
        dueInDays: 3,
      },
      {
        title: "Domain + hosting + WordPress kurulumu",
        description:
          "Domain satın al (Namecheap/Cloudflare), hosting (Cloudways veya VPS), WordPress yükle, theme seç. ~2-3 saat.",
        realm: "physical",
        priority: "p0",
        estimatedMinutes: 150,
        dueInDays: 5,
      },
      {
        title: "Niche için 3 rakip site derin analizi",
        description:
          "En iyi 3 rakibin içerik stratejisini manuel oku, hangi keyword'leri kapsadıklarını, voice/tone'unu notice et. AI yapamayacağı derinlik bu.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 120,
        dueInDays: 7,
      },
      {
        title: "Google Search Console + Analytics setup",
        description:
          "Siteni Google'a submit et, sitemap gönder, GA4 ekle. İlk trafik sinyallerini yakalayabilmek için.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 45,
        dueInDays: 7,
      },
      {
        title: "İlk 10 pillar post için outline onayı",
        description:
          "seo-researcher'ın önerdiği keyword listesinden en değerli 10'u seç, her biri için outline'ı gözden geçir. Agent yanlışa gitmesin, yönünü sen ver.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 60,
        dueInDays: 10,
      },
    ],
    milestones: [
      {
        label: "30 gün",
        daysFromNow: 30,
        rockTitle: "İlk 20 makale publish",
        rockDescription:
          "20 pillar post canlıda, her biri en az 1500 kelime, editor-review'dan geçmiş. Hedef: Google index'e alınma başlasın.",
        targetMetric: "20 indexed pages",
        status: "pending",
      },
      {
        label: "60 gün",
        daysFromNow: 60,
        rockTitle: "İlk organik trafik + ilk affiliate komisyon",
        rockDescription:
          "Aylık 1K+ organik session, en az 1 affiliate dönüşüm. Google bizi ciddiye alıyor.",
        targetMetric: "1K sessions · $10+ affiliate",
        status: "pending",
      },
      {
        label: "90 gün",
        daysFromNow: 90,
        rockTitle: "İlk aylık $500 pasif gelir",
        rockDescription: `50+ makale publish, 5K+ aylık session, $500+ affiliate MRR. Bu bant $${target} hedefinin ~${Math.round((500 / target) * 100)}%'u.`,
        targetMetric: `$500/ay affiliate revenue`,
        status: "pending",
      },
    ],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// SaaS / Micro-SaaS proposal
// ───────────────────────────────────────────────────────────────────────────

function generateSaasProposal(
  template: AssetTemplate,
  answers: InterviewAnswers
): OracleProposal {
  const { score, reasoning } = computeConfidence(template, answers);
  const target = answers.monthlyRevenueTargetUsd;
  const niche = answers.niche || "[niş]";

  return {
    mode: "rule-based",
    confidenceScore: score,
    confidenceReasoning: reasoning,
    narrative: `${niche} için ${template.label}. ${answers.timelineMonths} ayda $${target}/ay MRR hedefi. Matrix'in sales-qualifier + onboarding + customer-success ajan kadrosu ile solo operator'un 3x kaldıracı olur. İlk doları görmenin kilidi: 10 design partner ile derin validation, sonra self-serve onboarding.`,
    departments: [
      {
        name: "product",
        displayName: "Product",
        summary: "Build + iterate + release",
        accent: "ion",
      },
      {
        name: "growth",
        displayName: "Growth",
        summary: "Sign-up funnel, content marketing, paid experiments",
        accent: "nebula",
      },
      {
        name: "customer-success",
        displayName: "Customer Success",
        summary: "Onboarding, NPS, expansion, churn prevention",
        accent: "quantum",
      },
    ],
    skills: [
      {
        name: "lead-qualifier",
        displayName: "Lead Qualifier",
        summary: "Sign-up form verisinden ICP fit skoru üretir",
        scopes: ["read"],
        modelPreference: "haiku",
      },
      {
        name: "onboarding-writer",
        displayName: "Onboarding Writer",
        summary: "Her yeni user için personalized onboarding email dizisi",
        scopes: ["read", "write", "external-send"],
        modelPreference: "sonnet",
      },
      {
        name: "churn-predictor",
        displayName: "Churn Predictor",
        summary: "Kullanım drop pattern'i tespit edip retention campaign önerir",
        scopes: ["read"],
        modelPreference: "sonnet",
      },
      {
        name: "feature-usage-analyst",
        displayName: "Feature Usage Analyst",
        summary: "Feature-level adoption raporu haftalık çıkartır",
        scopes: ["read"],
        modelPreference: "haiku",
      },
      {
        name: "support-triager",
        displayName: "Support Triager",
        summary: "Gelen ticket'ı kategorize + urgency skoru + draft reply",
        scopes: ["read", "write"],
        modelPreference: "sonnet",
      },
    ],
    agents: [
      {
        name: "customer-onboarder",
        displayName: "Customer Onboarder",
        role: "CS",
        summary: "Her yeni sign-up'a kişiselleştirilmiş onboarding akışı",
        departmentName: "customer-success",
        skillNames: ["lead-qualifier", "onboarding-writer"],
        model: "sonnet",
      },
      {
        name: "support-agent",
        displayName: "Support Agent",
        role: "CS",
        summary: "Tier-1 ticket'ları otomatik cevaplar, Ferhan onayı ile gönderir",
        departmentName: "customer-success",
        skillNames: ["support-triager"],
        model: "sonnet",
      },
      {
        name: "retention-analyst",
        displayName: "Retention Analyst",
        role: "Growth",
        summary: "Haftalık churn risk listesi + retention action önerisi",
        departmentName: "growth",
        skillNames: ["churn-predictor", "feature-usage-analyst"],
        model: "sonnet",
      },
    ],
    workflows: [
      {
        name: "signup-onboarding",
        displayName: "Sign-up → Onboarding",
        cadence: "webhook: /api/webhooks/stripe/signup",
        description:
          "Yeni Stripe sign-up → lead-qualifier ICP skoru → onboarding email dizisi",
        steps: [
          "Stripe webhook geldi",
          "lead-qualifier ICP skoru üretir",
          "onboarding-writer 5-email dizisi hazırlar",
          "Ferhan onayı (external-send)",
          "Sequence Drip campaign başlar",
        ],
      },
      {
        name: "weekly-churn-review",
        displayName: "Haftalık Churn Review",
        cadence: "cron: Pazartesi 09:00",
        description:
          "retention-analyst + churn-predictor + feature-usage-analyst → risk listesi + aksiyon önerisi",
        steps: [
          "Son 7 gün kullanım metriklerini çek",
          "Risk skorunu hesapla",
          "Top 10 risk user için retention playbook öner",
          "Rapor Captain's Log'a düşer",
        ],
      },
    ],
    physicalTasks: [
      {
        title: "Stripe hesabı + pricing plan kurulumu",
        description:
          "Stripe business account, tax settings, subscription tier'ları ($29/$99/$299). Matrix hesabını senin yerine açamaz.",
        realm: "physical",
        priority: "p0",
        estimatedMinutes: 120,
        dueInDays: 3,
      },
      {
        title: "İlk 10 design partner ile video call",
        description:
          "10 potansiyel müşteri ile 30dk'lık problem-discovery görüşmesi. Transcript Matrix'e düşer ama konuşma insan işi.",
        realm: "physical",
        priority: "p0",
        estimatedMinutes: 600,
        dueInDays: 14,
      },
      {
        title: "Landing page + sign-up flow copy",
        description:
          "İlk version Matrix content-writer yazabilir ama final'e human-edit + brand tone senin imzan. 1-2 saat.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 90,
        dueInDays: 10,
      },
      {
        title: "Legal: ToS + Privacy Policy",
        description:
          "Termly.io veya avukat ile standard dokümanlar hazırla. AI draft olabilir, final review insan.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 60,
        dueInDays: 14,
      },
    ],
    milestones: [
      {
        label: "30 gün",
        daysFromNow: 30,
        rockTitle: "10 design partner + MVP demo",
        rockDescription:
          "10 derin discovery call tamamlandı, MVP'nin ilk demo'su hazır, 3 beta user aktif.",
        targetMetric: "10 partners · 3 betas",
        status: "pending",
      },
      {
        label: "60 gün",
        daysFromNow: 60,
        rockTitle: "İlk ödeyen müşteri + $1 MRR",
        rockDescription:
          "Stripe sign-up çalışıyor, Matrix onboarding akışı canlı, en az 1 ödeyen müşteri.",
        targetMetric: "1 paying customer · $99+ MRR",
        status: "pending",
      },
      {
        label: "90 gün",
        daysFromNow: 90,
        rockTitle: `$${Math.round(target * 0.2)}/ay MRR`,
        rockDescription: `İlk ${Math.round(target * 0.2)}/ay MRR'a ulaş — ${target} hedefinin %20'si. Product-market fit sinyalleri kontrol et.`,
        targetMetric: `$${Math.round(target * 0.2)} MRR`,
        status: "pending",
      },
    ],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Content (Newsletter / Podcast) proposal
// ───────────────────────────────────────────────────────────────────────────

function generateContentProposal(
  template: AssetTemplate,
  answers: InterviewAnswers
): OracleProposal {
  const { score, reasoning } = computeConfidence(template, answers);
  const target = answers.monthlyRevenueTargetUsd;
  const niche = answers.niche || "[niş]";
  const isNewsletter = template.type === "newsletter";

  return {
    mode: "rule-based",
    confidenceScore: score,
    confidenceReasoning: reasoning,
    narrative: `${niche} için ${isNewsletter ? "newsletter" : "podcast"} brand'i. ${answers.timelineMonths} ayda $${target}/ay sponsor gelir hedefi. Matrix'in research-curator + content-writer + fact-checker pipeline'ı haftalık 2 edition üretebilir — editor (sen) son polish'i yapar, Matrix dağıtımı otomatik yürütür.`,
    departments: [
      {
        name: "editorial",
        displayName: "Editorial",
        summary: "Araştırma, yazım, fact-check, publish",
        accent: "nebula",
      },
      {
        name: "sponsor-ops",
        displayName: "Sponsor Operations",
        summary: "Sponsor outreach, kontrat, delivery",
        accent: "solar",
      },
    ],
    skills: [
      {
        name: "research-curator",
        displayName: "Research Curator",
        summary: `${niche} alanında son 7 gün haberlerini tarar, en önemli 10'unu önerir`,
        scopes: ["read"],
        modelPreference: "sonnet",
      },
      {
        name: "content-writer",
        displayName: "Content Writer",
        summary: "Research'ten edition taslak yazısı hazırlar",
        scopes: ["read", "write"],
        modelPreference: "sonnet",
      },
      {
        name: "fact-checker",
        displayName: "Fact Checker",
        summary: "Her claim için kaynak doğrulama + hallucination tespit",
        scopes: ["read"],
        modelPreference: "sonnet",
      },
      {
        name: "sponsor-outreach-writer",
        displayName: "Sponsor Outreach Writer",
        summary:
          "Potansiyel sponsorlara personalized outreach email hazırlar",
        scopes: ["read", "write", "external-send"],
        modelPreference: "sonnet",
      },
      {
        name: "subscriber-engagement",
        displayName: "Subscriber Engagement",
        summary: "Open rate + click rate'den hangi konu ilgi çekiyor analiz",
        scopes: ["read"],
        modelPreference: "haiku",
      },
    ],
    agents: [
      {
        name: "edition-producer",
        displayName: "Edition Producer",
        role: "Editorial",
        summary: "Haftalık edition'ı uçtan uca üretir",
        departmentName: "editorial",
        skillNames: ["research-curator", "content-writer", "fact-checker"],
        model: "sonnet",
      },
      {
        name: "sponsor-hunter",
        displayName: "Sponsor Hunter",
        role: "Sponsor Ops",
        summary: "Haftada 5 potansiyel sponsora personalized outreach",
        departmentName: "sponsor-ops",
        skillNames: ["sponsor-outreach-writer"],
        model: "sonnet",
      },
      {
        name: "analytics-reporter",
        displayName: "Analytics Reporter",
        role: "Editorial",
        summary: "Haftalık engagement raporu + konu önerisi",
        departmentName: "editorial",
        skillNames: ["subscriber-engagement"],
        model: "haiku",
      },
    ],
    workflows: [
      {
        name: "weekly-edition",
        displayName: isNewsletter ? "Haftalık Newsletter" : "Haftalık Podcast",
        cadence: "cron: Pazartesi 08:00",
        description:
          "research-curator → content-writer → fact-checker → Ferhan polish → publish",
        steps: [
          "research-curator son 7 gün haber taraması",
          "Ferhan top 5 story'yi onaylar",
          "content-writer 2000 kelime taslağı yazar",
          "fact-checker geçer",
          "Ferhan final polish (30 dk)",
          "Beehiiv/Spotify'a publish (external-send approval)",
        ],
      },
      {
        name: "weekly-sponsor-outreach",
        displayName: "Haftalık Sponsor Outreach",
        cadence: "cron: Salı 10:00",
        description: "sponsor-hunter haftada 5 yeni potansiyel sponsora email",
        steps: [
          "Target sponsor listesi filtrele",
          "Her biri için personalized email",
          "Ferhan onayı",
          "Send + CRM'e log",
        ],
      },
    ],
    physicalTasks: [
      {
        title: `${isNewsletter ? "Beehiiv/Substack" : "Spotify/Anchor"} hesap kurulumu`,
        description: "Platform hesabı, domain bağla, custom design yükle.",
        realm: "physical",
        priority: "p0",
        estimatedMinutes: 90,
        dueInDays: 3,
      },
      {
        title: "İlk 10 sponsor listesi manuel derle",
        description:
          "Rakip newsletter'ların sponsor bölümlerine bak, kim reklam veriyor listele. Matrix ajanları bunu da yapabilir ama first-pass kalite için senin derleyişin önemli.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 120,
        dueInDays: 7,
      },
      {
        title: "Voice/tone guide yaz",
        description:
          "3 paragraf: nasıl yazarsın, ne tür kelimeler kullanmazsın, kitleye nasıl hitap edersin. content-writer bu guide'a göre yazacak.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 45,
        dueInDays: 5,
      },
      {
        title: "İlk 5 edition için topic backlog",
        description:
          "Matrix haftalık research yapar ama ilk 5 edition için senin editöryel vizyonun gerek.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 60,
        dueInDays: 10,
      },
    ],
    milestones: [
      {
        label: "30 gün",
        daysFromNow: 30,
        rockTitle: "İlk 4 edition + 500 sub",
        rockDescription:
          "4 haftalık edition yayında, organic + LinkedIn/Twitter tanıtımla 500 free sub.",
        targetMetric: "4 editions · 500 subs",
        status: "pending",
      },
      {
        label: "60 gün",
        daysFromNow: 60,
        rockTitle: "2K sub + ilk sponsor demo",
        rockDescription:
          "2K sub'a ulaş, ilk sponsor pitch'i (henüz revenue yok, partner bulmak için).",
        targetMetric: "2K subs · 1 sponsor demo",
        status: "pending",
      },
      {
        label: "90 gün",
        daysFromNow: 90,
        rockTitle: `İlk sponsor revenue: $${Math.round(target * 0.3)}/ay`,
        rockDescription: `5K sub, 1-2 aktif sponsor, $${Math.round(target * 0.3)}/ay MRR — ${target} hedefinin %30'u.`,
        targetMetric: `$${Math.round(target * 0.3)}/ay sponsor`,
        status: "pending",
      },
    ],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Diğer template türleri için kısa versiyonlar (genişletilebilir)
// ───────────────────────────────────────────────────────────────────────────

function generateYouTubeProposal(
  template: AssetTemplate,
  answers: InterviewAnswers
): OracleProposal {
  const base = generateContentProposal(template, answers);
  return {
    ...base,
    narrative: `${answers.niche || "niş"} için YouTube kanalı. Haftada 2 video ritmi, Matrix content pipeline'ı + video-editor ajanıyla. İlk 1K sub organik 2-3 ayda, monetization 4K watch hour'dan sonra başlar.`,
    physicalTasks: [
      {
        title: "YouTube kanalı + branding kurulumu",
        description: "Channel oluştur, banner + logo tasarla, About yazıp sosyal link'leri bağla.",
        realm: "physical",
        priority: "p0",
        estimatedMinutes: 120,
        dueInDays: 3,
      },
      {
        title: "Çekim setup (mikrofon + ışık + kamera)",
        description: "Shure SM7B veya equivalent + key light + iPhone/Sony. Kalite bariyeri.",
        realm: "physical",
        priority: "p0",
        estimatedMinutes: 180,
        dueInDays: 5,
      },
      {
        title: "İlk 10 video konsepti ve script outline",
        description:
          "Matrix research yapar, scripting öner ama sen konuşan kişi olarak ilk 10'u sen belirle.",
        realm: "physical",
        priority: "p1",
        estimatedMinutes: 120,
        dueInDays: 7,
      },
    ],
  };
}

function generateCourseProposal(
  template: AssetTemplate,
  answers: InterviewAnswers
): OracleProposal {
  return generateSaasProposal(template, answers); // Similar SaaS-style funnel
}

function generateEcommerceProposal(
  template: AssetTemplate,
  answers: InterviewAnswers
): OracleProposal {
  const { score, reasoning } = computeConfidence(template, answers);
  const niche = answers.niche || "[niş]";
  return {
    mode: "rule-based",
    confidenceScore: score,
    confidenceReasoning: reasoning,
    narrative: `${niche} için Shopify + Printful POD. ${answers.timelineMonths} ayda $${answers.monthlyRevenueTargetUsd}/ay revenue hedefi. Matrix'in ad-creative-generator + customer-service + inventory-sync ajanlarıyla solo operator'un fiziksel operasyon yükü %10 altına iner.`,
    departments: [
      {
        name: "acquisition",
        displayName: "Acquisition",
        summary: "Meta Ads + TikTok + influencer UGC",
        accent: "solar",
      },
      {
        name: "fulfillment-cs",
        displayName: "Fulfillment & CS",
        summary: "Shopify + Printful + destek",
        accent: "quantum",
      },
    ],
    skills: [
      { name: "ad-creative-writer", displayName: "Ad Creative Writer", summary: "Meta/TikTok ad copy + image prompt üretir", scopes: ["read", "write"], modelPreference: "sonnet" },
      { name: "customer-service-triager", displayName: "CS Triager", summary: "Shopify ticket'larını kategorize + draft cevap", scopes: ["read", "write"], modelPreference: "haiku" },
      { name: "inventory-monitor", displayName: "Inventory Monitor", summary: "Printful stock + order fulfillment anomaly", scopes: ["read"], modelPreference: "haiku" },
      { name: "review-harvester", displayName: "Review Harvester", summary: "Order sonrası automatic review request email", scopes: ["read", "write", "external-send"], modelPreference: "haiku" },
    ],
    agents: [
      { name: "ads-manager", displayName: "Ads Manager", role: "Acquisition", summary: "Haftalık 10 ad creative variant + A/B test öneri", departmentName: "acquisition", skillNames: ["ad-creative-writer"], model: "sonnet" },
      { name: "cs-bot", displayName: "CS Bot", role: "CS", summary: "Tier-1 ticket'lar", departmentName: "fulfillment-cs", skillNames: ["customer-service-triager"], model: "haiku" },
      { name: "ops-monitor", displayName: "Ops Monitor", role: "Fulfillment", summary: "Inventory + review chain", departmentName: "fulfillment-cs", skillNames: ["inventory-monitor", "review-harvester"], model: "haiku" },
    ],
    workflows: [
      { name: "weekly-ad-creative", displayName: "Haftalık Ad Creative Sprint", cadence: "cron: Pazartesi 09:00", description: "ads-manager 10 variant üretir, senin onayınla yayına çıkar", steps: ["10 copy + image prompt üretir", "Ferhan onayı", "Meta/TikTok Ads Manager'a yükle", "A/B test başlar"] },
      { name: "order-fulfillment", displayName: "Order Fulfillment Chain", cadence: "webhook: shopify/order/paid", description: "Her siparişte otomatik Printful + customer email + review request scheduling", steps: ["Order webhook", "Printful'a order push", "Customer email template personalize et", "14 gün sonra review request scheduleaan"] },
    ],
    physicalTasks: [
      { title: "Shopify + Printful hesap kurulumu", description: "Shopify store, domain, Printful integration, payment gateway (Stripe + Shopify Payments)", realm: "physical", priority: "p0", estimatedMinutes: 180, dueInDays: 5 },
      { title: "İlk 10 ürün tasarımı + listing", description: "Printful'da 10 mockup, Shopify'da listing (title, description, tag, SEO). Matrix copy yazabilir ama tasarım senin.", realm: "physical", priority: "p0", estimatedMinutes: 300, dueInDays: 10 },
      { title: "Meta + TikTok Ad Manager hesapları + ilk $500 test budget", description: "Business accounts, pixel kurulumu, ilk $500 test campaign", realm: "physical", priority: "p1", estimatedMinutes: 90, dueInDays: 7 },
      { title: "3 creator/UGC partner bul (ilk iletişim)", description: "Niche'ine uygun 3 mikro-influencer/creator, UGC partnership teklifi. Matrix outreach yazabilir ama negotiation insan.", realm: "physical", priority: "p1", estimatedMinutes: 120, dueInDays: 14 },
    ],
    milestones: [
      { label: "30 gün", daysFromNow: 30, rockTitle: "Store canlı + ilk 10 sipariş", rockDescription: "Shopify store yayında, ilk ad kampanyaları test edildi, 10+ ödeyen müşteri.", targetMetric: "10 orders · $300+ revenue", status: "pending" },
      { label: "60 gün", daysFromNow: 60, rockTitle: "ROAS 2x + $1K+ revenue", rockDescription: "Return On Ad Spend 2x altına düşmüyor, aylık $1K+ revenue.", targetMetric: "ROAS 2x · $1K+ revenue", status: "pending" },
      { label: "90 gün", daysFromNow: 90, rockTitle: `$${Math.round(answers.monthlyRevenueTargetUsd * 0.3)}/ay revenue`, rockDescription: `Target'ın %30'u. Creator UGC + repeat customer oranı yükselmiş.`, targetMetric: `$${Math.round(answers.monthlyRevenueTargetUsd * 0.3)}/ay`, status: "pending" },
    ],
  };
}

function generateDigitalProductProposal(template: AssetTemplate, answers: InterviewAnswers): OracleProposal {
  return generateAffiliateProposal(template, answers); // similar content + distribution pattern
}

function generateAgencyProposal(template: AssetTemplate, answers: InterviewAnswers): OracleProposal {
  return generateSaasProposal(template, answers); // similar sales + delivery
}

function generateCommunityProposal(template: AssetTemplate, answers: InterviewAnswers): OracleProposal {
  return generateContentProposal(template, answers); // similar content + engagement
}

function generateGenericProposal(template: AssetTemplate, answers: InterviewAnswers): OracleProposal {
  const { score, reasoning } = computeConfidence(template, answers);
  return {
    mode: "rule-based",
    confidenceScore: score,
    confidenceReasoning: reasoning,
    narrative: `${answers.niche || "niş"} için ${template.label}. Matrix uçtan uca kurulum için daha fazla detaya ihtiyaç duyuyor — Oracle manual kurulum için ipucu verdi.`,
    departments: [{ name: "ops", displayName: "Ops", summary: "Genel operasyon", accent: "ion" }],
    skills: [],
    agents: [],
    workflows: [],
    physicalTasks: [
      {
        title: "Asset tipine özel kurulum",
        description: "Bu asset türü için Matrix henüz özel template üretmedi. Prime Program'dan DNA'yı yazıp Oracle'dan önerileri dinle.",
        realm: "physical",
        priority: "p0",
        estimatedMinutes: 60,
        dueInDays: 7,
      },
    ],
    milestones: [
      {
        label: "30 gün", daysFromNow: 30, rockTitle: "İlk kurulum tamamlandı",
        rockDescription: "DNA + ilk 3 skill + 1 workflow canlıda.",
        targetMetric: "3 skills · 1 workflow", status: "pending",
      },
    ],
  };
}
