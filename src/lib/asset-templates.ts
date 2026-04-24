/**
 * Asset Templates — Matrix holdco portfolio'sunda kurulabilir dijital varlık
 * çeşitleri.
 *
 * Her template:
 *   - Marketplace'lerde (TrueMRR, Empire Flippers, Flippa, Acquire.com,
 *     Tiny Acquisitions, MicroAcquire) tekrarlayan bir patern
 *   - Seed DNA: mission + vision + 3-5 stratejik tema
 *   - Tipik exit multiple + MRR bant + kurulum zamanı (ilham için)
 *   - "Cesaret verici" copy — Matrix dilinde solo operator'u motive eden
 *
 * Oracle's Picks: mevcut portföy boşluğuna göre önerilenler.
 */

import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Code2,
  FileText,
  Headphones,
  Mail,
  MessageCircle,
  MousePointerClick,
  Package,
  PlaySquare,
  Rocket,
  ShoppingBag,
  Smartphone,
  Store,
  Users,
} from "lucide-react";

// Lucide'da Youtube ikonu yok — PlaySquare en yakın TV/video şekli
const Youtube = PlaySquare;

export type AssetCategory =
  | "software"
  | "content"
  | "commerce"
  | "service"
  | "custom";

export type AssetType =
  | "saas"
  | "micro-saas"
  | "mobile-app"
  | "chrome-extension"
  | "youtube"
  | "podcast"
  | "newsletter"
  | "course"
  | "ecommerce"
  | "affiliate"
  | "digital-product"
  | "agency"
  | "community"
  | "job-board"
  | "custom";

export interface AssetTemplate {
  type: AssetType;
  category: AssetCategory;
  label: string;
  icon: LucideIcon;
  accent: "ion" | "nebula" | "quantum" | "solar";
  /** 1-cümle ürün çerçevesi */
  tagline: string;
  /** Cesaret verici Matrix-dilinde tek cümle */
  encouragement: string;
  /** Marketplace referansı (Flippa/EF/TrueMRR/Acquire pattern) */
  marketplaceEvidence: string;
  /** Tipik exit multiple (satış fiyatı / aylık profit) */
  typicalMultiple: string;
  /** Tipik MRR bandı */
  typicalMrrBand: string;
  /** 1. dolara kadar tipik süre */
  timeToFirstDollar: string;
  defaultIndustry: string;
  mission: string;
  vision: string;
  themes: { label: string; description: string; weight: number }[];
  /** Önerilen Blueprint slug'ları (The Keymaker'dan) */
  recommendedBlueprints: string[];
}

export const ASSET_TEMPLATES: AssetTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // SOFTWARE
  // ═══════════════════════════════════════════════════════════════════════
  {
    type: "saas",
    category: "software",
    label: "SaaS Ürünü",
    icon: Code2,
    accent: "ion",
    tagline: "B2B abonelik yazılımı — MRR + CAC + churn üçgeni.",
    encouragement:
      "Matrix sana 50 kişilik şirketin sales/CS/product ekibini ajan kadrosu olarak kurar.",
    marketplaceEvidence:
      "Acquire.com + TrueMRR top segment — $10-50K MRR bandında sürekli deal akışı",
    typicalMultiple: "3-5x MRR",
    typicalMrrBand: "$5K-$50K/ay",
    timeToFirstDollar: "4-9 ay",
    defaultIndustry: "B2B SaaS",
    mission:
      "[Sektör] profesyonellerinin günlük iş akışını 10x hızlandırmak.",
    vision:
      "5 yıl içinde sektörün de-facto işletim sistemi haline gelmek; NRR 115%+ ile kapalı, sürdürülebilir büyüme.",
    themes: [
      { label: "Müşteri Başarısı", description: "NRR > 115%", weight: 95 },
      {
        label: "Ürün Kaldıracı",
        description: "Her feature workflow'a dönüşür",
        weight: 80,
      },
      {
        label: "Dikey Uzmanlık",
        description: "Sektör dilini ana dilim gibi konuşurum",
        weight: 70,
      },
    ],
    recommendedBlueprints: ["sales-marketing", "customer-success", "product"],
  },
  {
    type: "micro-saas",
    category: "software",
    label: "Micro-SaaS",
    icon: Rocket,
    accent: "ion",
    tagline: "Tek-amaçlı ürün — $5-15/ay sub, solo founder sürdürür.",
    encouragement:
      "Pomodoro timer'dan $8K MRR'a giden bir yol var. Küçük başla, derinleş.",
    marketplaceEvidence:
      "Flippa + MicroAcquire $60K-$150K bandında sürekli listing — tek dev sürdürüyor",
    typicalMultiple: "2-4x MRR",
    typicalMrrBand: "$2K-$15K/ay",
    timeToFirstDollar: "2-4 ay",
    defaultIndustry: "Productivity · Micro-SaaS",
    mission:
      "Knowledge worker'ların tek bir günlük ritüelini radikal ölçüde kolaylaştırmak.",
    vision:
      "Solo founder sürdürebilir, $10K+/ay recurring geliri olan bir niche araç.",
    themes: [
      {
        label: "Tek Amaç",
        description: "Bir şeyi mükemmel yap, 10 şeyi iyi yapma",
        weight: 95,
      },
      {
        label: "Organik Dağıtım",
        description: "Chrome Store, Product Hunt, Twitter",
        weight: 75,
      },
      { label: "Low-Touch Support", description: "Self-serve + LLM çözüm", weight: 70 },
    ],
    recommendedBlueprints: ["product", "customer-success"],
  },
  {
    type: "mobile-app",
    category: "software",
    label: "Mobile App",
    icon: Smartphone,
    accent: "ion",
    tagline: "App Store / Play Store — ad-supported veya IAP.",
    encouragement:
      "iOS ilk hafta 10K download'a gidiyor organik, matriks arsenal'ini arkana al.",
    marketplaceEvidence:
      "Flippa apps kategorisi — $30K-$200K aralığında, Tiny Acquisitions popüler",
    typicalMultiple: "2-3x annual revenue",
    typicalMrrBand: "$1K-$25K/ay",
    timeToFirstDollar: "3-6 ay",
    defaultIndustry: "Mobile · Consumer App",
    mission:
      "Kullanıcının günlük mobil ritüeline değer katan tek-amaçlı bir app.",
    vision:
      "App Store top 10 (kategori) — organic install velocity + high retention.",
    themes: [
      { label: "Retention", description: "Day-30 > %40", weight: 90 },
      { label: "ASO", description: "Organic install > paid", weight: 80 },
      { label: "Monetization", description: "IAP + subscription karışımı", weight: 75 },
    ],
    recommendedBlueprints: ["product"],
  },
  {
    type: "chrome-extension",
    category: "software",
    label: "Chrome Extension",
    icon: Package,
    accent: "ion",
    tagline: "Freemium browser extension — Chrome Web Store dağıtımı.",
    encouragement:
      "Chrome Web Store'da 10K kullanıcıya 2 ayda ulaşmak mümkün — Matrix dağıtım ajanıyla.",
    marketplaceEvidence:
      "Flippa extension kategorisi — $20K-$80K bandında tek-geliştirici listings",
    typicalMultiple: "2-3x MRR",
    typicalMrrBand: "$500-$8K/ay",
    timeToFirstDollar: "2-3 ay",
    defaultIndustry: "Browser Tooling",
    mission: "Belirli bir workflow'u tarayıcıda bulunduğun anda hızlandırmak.",
    vision:
      "Chrome Web Store top 5 (niş kategoride), organic discovery + freemium upgrade.",
    themes: [
      {
        label: "Install-to-Paid",
        description: "Freemium conversion > 3%",
        weight: 85,
      },
      {
        label: "Kullanım Derinliği",
        description: "Weekly active / install",
        weight: 80,
      },
      { label: "Review Kalitesi", description: "4.7+ yıldız", weight: 70 },
    ],
    recommendedBlueprints: ["product"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════════════════════════════════
  {
    type: "youtube",
    category: "content",
    label: "YouTube Kanalı",
    icon: Youtube,
    accent: "solar",
    tagline: "Ads + sponsor + products — compounding attention moat.",
    encouragement:
      "Haftada 2 video × Matrix content pipeline = 1 yılda 100K sub potansiyeli.",
    marketplaceEvidence:
      "Flippa youtube channels kategorisi — $30K-$500K bandında, 50K+ sub ile sürekli listing",
    typicalMultiple: "2-4x annual revenue",
    typicalMrrBand: "$1K-$30K/ay (sub sayısına bağlı)",
    timeToFirstDollar: "6-12 ay",
    defaultIndustry: "Content · YouTube",
    mission:
      "[Niş] konusundaki en güvenilir, derinleşmiş video kütüphanesi olmak.",
    vision:
      "100K+ sub, yıllık 6-rakamlı sponsor + ads geliri, kendi tarzında referans kanal.",
    themes: [
      {
        label: "Watch Time",
        description: "Avg view duration > 8 dk",
        weight: 90,
      },
      {
        label: "Sponsor Ekonomisi",
        description: "CPM $40+",
        weight: 75,
      },
      { label: "Editör Disiplini", description: "Pazartesi + Perşembe upload", weight: 85 },
    ],
    recommendedBlueprints: ["product"],
  },
  {
    type: "podcast",
    category: "content",
    label: "Podcast",
    icon: Headphones,
    accent: "nebula",
    tagline: "Haftalık audio — sponsor + Patreon + premium tier.",
    encouragement:
      "Sabah yürüyüşünde dinlenen 10K sadık dinleyici, $5K/ay sponsor MRR demektir.",
    marketplaceEvidence:
      "Tiny Acquisitions podcast bölümü — $20K-$100K bandında, sponsor-driven",
    typicalMultiple: "2-3x annual revenue",
    typicalMrrBand: "$800-$15K/ay",
    timeToFirstDollar: "4-9 ay",
    defaultIndustry: "Content · Audio",
    mission:
      "[Niş] profesyonellerinin haftalık beyin besinlerini tek yerden sağlamak.",
    vision:
      "Top 10 [kategori] podcast'i, yıllık $100K+ sponsor geliri, loyal community.",
    themes: [
      {
        label: "Dinlenme Tamamlama",
        description: ">70% complete rate",
        weight: 90,
      },
      {
        label: "Konuk Kalitesi",
        description: "Tanınan ismi her ay bir",
        weight: 75,
      },
      { label: "Cross-Channel", description: "YouTube clips + Twitter", weight: 70 },
    ],
    recommendedBlueprints: ["product"],
  },
  {
    type: "newsletter",
    category: "content",
    label: "Newsletter",
    icon: Mail,
    accent: "nebula",
    tagline: "Haftalık email — Beehiiv/Substack + sponsor + paid tier.",
    encouragement:
      "5K sub ile $2K sponsor, 25K sub ile premium'a geçiş — Morning Brew kalıbı.",
    marketplaceEvidence:
      "Tiny Acquisitions + Duuce newsletter'lar — $30K-$200K bandında",
    typicalMultiple: "2-3x annual revenue",
    typicalMrrBand: "$1K-$30K/ay",
    timeToFirstDollar: "3-6 ay",
    defaultIndustry: "Content · Newsletter",
    mission:
      "[Kitle] için haftalık [konu] briefing'inin en güvenilir tek kaynağı.",
    vision:
      "50K+ sub, yıllık 6-rakamlı sponsor geliri. Matrix content pipeline'ı tam otomasyonlu.",
    themes: [
      { label: "Sub Büyüme", description: "Haftalık %5+ organik", weight: 90 },
      {
        label: "Sponsor Ekonomi",
        description: "Her edition'da 1 sponsor",
        weight: 75,
      },
      { label: "Editör Disiplini", description: "AI draft + human polish", weight: 85 },
    ],
    recommendedBlueprints: ["product", "sales-marketing"],
  },
  {
    type: "course",
    category: "content",
    label: "Online Kurs / Cohort",
    icon: FileText,
    accent: "nebula",
    tagline: "Tek-seferlik $297-1997 veya $97/ay subscription kurs.",
    encouragement:
      "Bildiğini aktar — Matrix pazarlama + operasyon yükünü alsın, sen öğretmeye odaklan.",
    marketplaceEvidence:
      "Acquire.com + Flippa courses — $50K-$500K bandında, evergreen + cohort model",
    typicalMultiple: "2-4x annual revenue",
    typicalMrrBand: "$3K-$40K/ay",
    timeToFirstDollar: "2-4 ay",
    defaultIndustry: "Education · Creator",
    mission:
      "[Kitleye] [yetenek]i en kısa yoldan kazandırmak.",
    vision:
      "Niş alanında 'the' kurs — 3000+ alum, yıllık $500K+ ciro, NPS 60+.",
    themes: [
      {
        label: "Tamamlama Oranı",
        description: ">50% öğrenci bitirir",
        weight: 85,
      },
      {
        label: "Sosyal Kanıt",
        description: "Haftada 1 testimonial",
        weight: 80,
      },
      { label: "Evergreen Funnel", description: "Facebook/Youtube → email → sale", weight: 75 },
    ],
    recommendedBlueprints: ["sales-marketing", "customer-success"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COMMERCE
  // ═══════════════════════════════════════════════════════════════════════
  {
    type: "ecommerce",
    category: "commerce",
    label: "E-commerce / POD",
    icon: ShoppingBag,
    accent: "solar",
    tagline: "Shopify + Printful/Printify + Meta Ads — fiziksel ürün, dijital ops.",
    encouragement:
      "30 SKU × dar niş × Matrix ad-creative agent = $10K+/ay net profit örnekleri yaygın.",
    marketplaceEvidence:
      "Empire Flippers apparel/accessories — $300K-$1M bandında, 28-36x monthly profit",
    typicalMultiple: "28-36x monthly profit",
    typicalMrrBand: "$10K-$80K/ay revenue",
    timeToFirstDollar: "2-4 ay",
    defaultIndustry: "D2C · E-commerce",
    mission:
      "[Dar niş topluluğu] için minimal envanter riskiyle kaliteli ürünler sunmak.",
    vision:
      "24 ayda $10K+/ay net kâr. Fiziksel ops %10 altında — ad creative + inventory sync + CS tam ajan.",
    themes: [
      { label: "Dar Niche", description: "Geniş yerine derin", weight: 90 },
      { label: "Creator UGC", description: "Organic content moat", weight: 80 },
      {
        label: "Agent-Operated",
        description: "Human ops minimum",
        weight: 85,
      },
    ],
    recommendedBlueprints: ["sales-marketing", "customer-success", "product"],
  },
  {
    type: "digital-product",
    category: "commerce",
    label: "Dijital Ürün / Template",
    icon: Package,
    accent: "quantum",
    tagline: "Gumroad/Whop — Notion template, Figma pack, preset bundles.",
    encouragement:
      "Hazırlık 2 hafta, pazarlama sonsuz — Matrix dağıtım ajanıyla uzun kuyruk.",
    marketplaceEvidence:
      "Flippa + Tiny Acquisitions — $15K-$80K bandında, evergreen template catalog",
    typicalMultiple: "1.5-2.5x annual revenue",
    typicalMrrBand: "$500-$8K/ay",
    timeToFirstDollar: "1-2 ay",
    defaultIndustry: "Digital Product · Templates",
    mission:
      "[Niche] profesyonellerinin hazır iş çıkışı yapmasına yardım etmek.",
    vision:
      "Kategori'de referans template kütüphanesi — sürekli büyüyen portföy, pasif gelir.",
    themes: [
      { label: "Katalog Derinliği", description: "Ayda 2+ yeni template", weight: 85 },
      { label: "Organic Discovery", description: "Pinterest + Twitter + SEO", weight: 80 },
      { label: "Low-Refund Rate", description: "<%3", weight: 70 },
    ],
    recommendedBlueprints: ["product"],
  },
  {
    type: "affiliate",
    category: "commerce",
    label: "Affiliate / SEO Sitesi",
    icon: MousePointerClick,
    accent: "solar",
    tagline: "Organik trafik + affiliate komisyon — evergreen passive income.",
    encouragement:
      "18 ayda $3K+/ay pasif + Matrix SEO writer ile ayda 20 yeni sayfa = compound.",
    marketplaceEvidence:
      "Empire Flippers top — $150K-$500K bandında, 30-45x monthly profit (premium)",
    typicalMultiple: "30-45x monthly profit",
    typicalMrrBand: "$2K-$15K/ay",
    timeToFirstDollar: "6-12 ay",
    defaultIndustry: "Affiliate · SEO Content",
    mission:
      "[Niche] alanındaki satın alma kararlarını kolaylaştıran en güvenilir karşılaştırma.",
    vision:
      "12-24 ayda $5K+/ay pasif. Matrix SEO pipeline'ı ayda 20+ sayfa üretir, human edits.",
    themes: [
      {
        label: "SEO Liderliği",
        description: "Commercial keyword'lerde top 3",
        weight: 95,
      },
      { label: "İçerik Ölçeği", description: "Haftada 5 sayfa", weight: 80 },
      {
        label: "Otantik Voice",
        description: "Google Helpful Content uyumu",
        weight: 85,
      },
    ],
    recommendedBlueprints: ["product"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SERVICE / COMMUNITY
  // ═══════════════════════════════════════════════════════════════════════
  {
    type: "agency",
    category: "service",
    label: "Productized Agency",
    icon: Bot,
    accent: "nebula",
    tagline: "Sabit scope × aylık fiyat — 'Done-for-you' SaaS hissi.",
    encouragement:
      "3-5 müşteri × $3K/ay = $10-15K/ay → Matrix ops katmanıyla solo founder sürdürebilir.",
    marketplaceEvidence:
      "Acquire.com productized services — $50K-$250K bandında, 2-3x annual",
    typicalMultiple: "2-3x annual revenue",
    typicalMrrBand: "$5K-$40K/ay",
    timeToFirstDollar: "1-2 ay",
    defaultIndustry: "Productized Service",
    mission:
      "[Kitleye] [outcome]'u tekrarlanabilir paket olarak teslim etmek.",
    vision:
      "Matrix üstünde sabit ops ile solo-operated, $30K+/ay MRR, 5-10 müşteri cap.",
    themes: [
      { label: "Delivery Disiplini", description: "Her müşteri aynı scope", weight: 90 },
      {
        label: "Agent-Leverage",
        description: "Her deliverable % ajanla",
        weight: 85,
      },
      { label: "Client Churn Önleme", description: "Quarterly renewals", weight: 75 },
    ],
    recommendedBlueprints: ["sales-marketing", "customer-success", "product"],
  },
  {
    type: "community",
    category: "service",
    label: "Paid Community / Discord",
    icon: MessageCircle,
    accent: "nebula",
    tagline: "Aylık ücretli topluluk — Circle, Discord, Whop üzerinde.",
    encouragement:
      "500 üye × $29/ay = $15K MRR. Matrix moderation + onboarding ajanı yükü çeker.",
    marketplaceEvidence:
      "Acquire.com + Tiny Acquisitions communities — $30K-$150K bandında",
    typicalMultiple: "2-3x MRR",
    typicalMrrBand: "$2K-$25K/ay",
    timeToFirstDollar: "2-4 ay",
    defaultIndustry: "Community · Subscription",
    mission:
      "[Niş profesyonelleri] için birbirinin tecrübesinden öğrenebileceği kapalı alan.",
    vision:
      "1000+ üye, $30K+/ay MRR, event calendar + peer mentorship canlı.",
    themes: [
      {
        label: "Retention",
        description: "Monthly churn < %5",
        weight: 90,
      },
      {
        label: "Etkinlik Ritmi",
        description: "Haftalık live + aylık event",
        weight: 80,
      },
      {
        label: "Üye Üretkenliği",
        description: "Üyelerden topluluğa katkı",
        weight: 75,
      },
    ],
    recommendedBlueprints: ["customer-success"],
  },
  {
    type: "job-board",
    category: "service",
    label: "Niche Job Board",
    icon: Store,
    accent: "solar",
    tagline: "Özel niş iş ilanı kataloğu — employer sponsored listings.",
    encouragement:
      "Remote.io / RemoteOK modelinde bir niş job board, Matrix scraper agent + outreach = compounding.",
    marketplaceEvidence:
      "Empire Flippers job boards — $80K-$400K bandında, recurring listing fee model",
    typicalMultiple: "25-35x monthly profit",
    typicalMrrBand: "$2K-$20K/ay",
    timeToFirstDollar: "4-8 ay",
    defaultIndustry: "Job Board · Two-sided Marketplace",
    mission:
      "[Niş rollerin] doğru adaylarla buluşması için en odaklı kaynak.",
    vision:
      "Niş'te de-facto job board, aylık 50+ ücretli listing, 10K+ aktif job seeker.",
    themes: [
      {
        label: "İlan Kalitesi",
        description: "Her ilan manuel verified",
        weight: 90,
      },
      { label: "Aday Akışı", description: "Weekly newsletter + SEO", weight: 85 },
      {
        label: "Employer Deneyimi",
        description: "Listing setup < 5 dk",
        weight: 75,
      },
    ],
    recommendedBlueprints: ["sales-marketing", "product"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CUSTOM
  // ═══════════════════════════════════════════════════════════════════════
  {
    type: "custom",
    category: "custom",
    label: "Custom / Özel",
    icon: Users,
    accent: "quantum",
    tagline: "Yukarıdakilere uymayan özel yapı — sıfırdan tasarla.",
    encouragement: "Her template bir ilham. Kendi asset'in kendi kurallarını yazabilir.",
    marketplaceEvidence: "—",
    typicalMultiple: "—",
    typicalMrrBand: "—",
    timeToFirstDollar: "—",
    defaultIndustry: "Özel / Kişisel",
    mission: "",
    vision: "",
    themes: [],
    recommendedBlueprints: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Oracle's Picks — mevcut portföy boşluğuna göre önerilen template'ler
// ═══════════════════════════════════════════════════════════════════════════

export interface OraclePickSuggestion {
  template: AssetTemplate;
  reason: string;
  priority: "high" | "medium" | "low";
}

/**
 * Mevcut workspace'lerine bakarak Oracle hangi yeni asset'i önerir?
 *
 * Kural motoru:
 *   - Hiç software asset yoksa → SaaS (high)
 *   - Hiç content asset yoksa → Newsletter veya Podcast (medium)
 *   - Hiç commerce asset yoksa → Affiliate (low - pasif gelir)
 *   - Hepsinden 1'er tane varsa → YouTube (cross-channel amplify)
 *   - Tek portföy varsa → Custom önerme, tamamlayıcı öner
 */
export function oraclePicksForPortfolio(
  currentIndustries: string[]
): OraclePickSuggestion[] {
  const picks: OraclePickSuggestion[] = [];
  const i = currentIndustries.map((s) => s.toLowerCase()).join(" ");

  const hasSoftware = /saas|software|app|extension/.test(i);
  const hasContent = /content|newsletter|podcast|youtube|course|media/.test(i);
  const hasCommerce = /commerce|d2c|pod|affiliate|digital product|templates/.test(i);
  const hasService = /service|agency|community|job/.test(i);

  const t = (type: AssetType): AssetTemplate =>
    ASSET_TEMPLATES.find((x) => x.type === type)!;

  if (!hasContent) {
    picks.push({
      template: t("newsletter"),
      reason:
        "Portföyünde bir content brand yok. Newsletter compounding dağıtım kanalı kurar — diğer asset'lerinin tanıtımını da yapar.",
      priority: "high",
    });
  }

  if (!hasSoftware) {
    picks.push({
      template: t("micro-saas"),
      reason:
        "Software recurring revenue omurgası verir. Micro-SaaS solo-founder sürdürülebilir, 2-4 ayda ilk dolar.",
      priority: "high",
    });
  }

  if (!hasCommerce && hasContent) {
    picks.push({
      template: t("affiliate"),
      reason:
        "Content brand'in varsa, affiliate site'ı yan pasif gelir — aynı niş, SEO overlap, minimum ekstra iş.",
      priority: "medium",
    });
  }

  if (hasContent && !currentIndustries.join(" ").toLowerCase().includes("youtube")) {
    picks.push({
      template: t("youtube"),
      reason:
        "Content pipeline'ını YouTube'a da dağıt — attention moat compounding, ads + sponsor + product.",
      priority: "medium",
    });
  }

  if (hasSoftware && hasContent && !hasService) {
    picks.push({
      template: t("community"),
      reason:
        "Hem yazılımın hem içeriğin var — community kur, müşteri başarısını peer-driven hale getir.",
      priority: "low",
    });
  }

  // Fallback — hiç bir koşul yakalanmadıysa
  if (picks.length === 0) {
    picks.push({
      template: t("podcast"),
      reason:
        "Yeni bir ritüel: haftalık podcast. Konuklar sana network getirir, dinleyici yavaş ama yoğun bağlanır.",
      priority: "medium",
    });
  }

  return picks.slice(0, 3);
}

export const categoryLabels: Record<AssetCategory, string> = {
  software: "Software",
  content: "Content",
  commerce: "Commerce",
  service: "Service · Community",
  custom: "Custom",
};
