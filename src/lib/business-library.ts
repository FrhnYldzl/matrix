/**
 * Business Library — the "what to build" layer.
 *
 * Upstream of Blueprints. Instead of "how do I run a sales department",
 * this library answers: "what business should I build, and how will it make money?"
 *
 * Three shelves:
 *  1. Business Models   — archetypes (SaaS, Marketplace, Creator, etc.)
 *  2. Opportunities     — curated trend-rooted openings
 *  3. Revenue Playbooks — monetization patterns with North Star metrics
 *
 * Each item references related blueprints so the user can jump from idea
 * to one-click department setup.
 */

export type Accent = "ion" | "nebula" | "quantum" | "solar";

// How much of the work is digital vs. physical.
// Matrix colours physical-heavy tasks differently so hybrid operators can
// see at a glance where their offline time goes.
export type ExecutionType = "digital-only" | "hybrid" | "physical-heavy";

export interface ResourceProfile {
  capital: {
    level: "none" | "low" | "medium" | "high";
    minUsd?: number;
    maxUsd?: number;
    note?: string;
  };
  time: {
    hoursPerWeek: { min: number; max: number };
    weeksToMvp: { min: number; max: number };
  };
  physicalPresence: "none" | "occasional" | "regular" | "full-time";
  humanSkills: string[]; // people skills the operator needs
  tools: string[]; // software / hardware
  // Common hybrid tasks exposed with colour coding in UI
  physicalTasks?: string[]; // e.g. "Ürün paketleme", "Tedarikçi ziyareti"
  digitalTasks?: string[]; // e.g. "Ad kampanya yönetimi", "Email sequence"
}

// Hunter Agent — a built-in scanner surface.
// Produces live "opportunity signals" by watching social, web, marketplaces,
// then filtering by digital-revenue-share %.
export interface HunterSignal {
  id: string;
  capturedAt: string; // ISO timestamp
  source: "twitter" | "reddit" | "producthunt" | "amazon-movers" | "etsy-trending" | "shopify-apps" | "google-trends" | "youtube";
  title: string;
  summary: string;
  digitalShare: number; // 0-100, % of revenue that can be earned via digital channels
  category: string;
  signalStrength: "weak" | "emerging" | "strong";
  relatedModelIds: string[];
  estimatedResourceProfile: ResourceProfile;
  verdict: "worth-exploring" | "needs-more-signal" | "skip";
}


// ----------------------------------------------------------------------------
// Business Models
// ----------------------------------------------------------------------------

export interface BusinessModel {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accent: Accent;
  tags: string[];
  examples: string[]; // real companies as inspiration
  revenuePattern: "subscription" | "usage" | "take-rate" | "ads" | "one-time" | "hybrid";
  northStar: string; // primary KPI
  secondaryKpis: string[];
  capitalIntensity: "low" | "medium" | "high";
  scaleBehavior: string; // one-line "how does it grow"
  idealTeamSize: string;
  timeToFirstDollar: string;
  defensibility: string;
  risks: string[];
  recommendedBlueprints: string[]; // blueprint ids
  visionTemplate: {
    mission: string;
    vision: string;
    themes: { label: string; description: string; weight: number }[];
  };
  // New — execution split and resource report
  executionType?: ExecutionType;
  digitalRevenueShare?: number; // 0-100
  resourceProfile?: ResourceProfile;
}

// ----------------------------------------------------------------------------
// Opportunities
// ----------------------------------------------------------------------------

export interface MarketSnapshot {
  tam: string; // total addressable market
  growth: string; // e.g. "%22 CAGR"
  incumbents: string[];
  whitespace: string; // what's missing / underserved
}

export interface OracleOutlook {
  horizonMonths: number; // e.g. 24
  forecast: string; // narrative "12-24 months the space will look like..."
  wedge: string; // where Matrix thinks the best entry is
  confidence: "low" | "medium" | "high";
}

export interface RoadmapStep {
  phase: "validate" | "build" | "launch" | "scale";
  month: string; // e.g. "0-1 ay"
  action: string;
  deliverable: string;
}

export interface InvestmentProfile {
  timeMonths: { min: number; max: number };
  capitalUsd: { min: number; max: number };
  teamSize: string;
  burnRiskLevel: "low" | "medium" | "high";
}

export interface BusinessOpportunity {
  id: string;
  title: string;
  thesis: string; // one-paragraph "why now"
  accent: Accent;
  tags: string[];
  trend: string; // macro trend powering this
  marketSize: string; // TAM estimate (short)
  timing: "emerging" | "hot" | "mature" | "reviving";
  startupFit: "solo-founder" | "small-team" | "funded-team";
  relatedModelIds: string[];
  relatedBlueprintIds: string[];
  evidence: string[]; // signals: stats, articles, reports
  // Oracle's deep analysis — optional, filled in for featured opportunities
  market?: MarketSnapshot;
  outlook?: OracleOutlook;
  roadmap?: RoadmapStep[];
  investment?: InvestmentProfile;
  goNoGo?: string[];
  northStar?: string;
  // Execution split & resource report
  executionType?: ExecutionType;
  digitalRevenueShare?: number;
  resourceProfile?: ResourceProfile;
}

// ----------------------------------------------------------------------------
// Revenue Playbooks
// ----------------------------------------------------------------------------

export interface RevenuePlaybook {
  id: string;
  name: string;
  pattern: BusinessModel["revenuePattern"];
  description: string;
  accent: Accent;
  northStar: string;
  formula: string; // human-readable formula
  testPlan: string[]; // how to validate in weeks, not months
  gotchas: string[];
  bestFor: string; // archetype description
}

// ----------------------------------------------------------------------------
// Seed data
// ----------------------------------------------------------------------------

export const businessModels: BusinessModel[] = [
  {
    id: "bm-vertical-saas",
    name: "Vertical SaaS",
    tagline: "Bir sektörün ihtiyaçlarına derinlemesine odaklanan yazılım.",
    description:
      "Yatay bir araç değil, tek bir sektörün (restoran zinciri, emlak, klinik, taşımacılık) iş akışına özel tasarlanmış yazılım. Rakipleri 'tek arayüzde her şey' veriyorsa sen 'sektörün dilini konuşan tek yazılım' oluyorsun.",
    accent: "ion",
    tags: ["saas", "b2b", "niche", "workflow"],
    examples: ["Toast (restoran)", "Procore (inşaat)", "ServiceTitan (servis)", "Veeva (pharma)"],
    revenuePattern: "subscription",
    northStar: "Net Revenue Retention (NRR)",
    secondaryKpis: ["MRR growth", "CAC payback", "Logo churn", "Expansion MRR"],
    capitalIntensity: "medium",
    scaleBehavior: "Önce 1 sektörde derinleş, sonra komşu sektörlere sız.",
    idealTeamSize: "3–15 kişi",
    timeToFirstDollar: "4–9 ay",
    defensibility: "Sektöre özel veri + entegrasyonlar + workflow kilidi.",
    risks: [
      "Küçük pazarda tavana çarpmak",
      "Alıcı ekonomik döngüye hassas",
      "Sektörel regülasyon değişikliği",
    ],
    recommendedBlueprints: ["bp-sales-marketing", "bp-customer-success", "bp-product"],
    visionTemplate: {
      mission: "[Sektör] profesyonellerinin günlük işini radikal ölçüde kolaylaştırmak.",
      vision:
        "5 yıl içinde [sektör]'deki ilk üç yazılım sağlayıcısından biri olmak; sektörün de-facto işletim sistemi haline gelmek.",
      themes: [
        {
          label: "Sektör Uzmanlığı",
          description: "Kullanıcının dilini kendimiz kadar iyi konuşmak.",
          weight: 90,
        },
        {
          label: "Entegrasyon Derinliği",
          description: "Sektörün mevcut araçlarına sessiz ama derin köprüler.",
          weight: 75,
        },
        {
          label: "Net Revenue Retention",
          description: "Genişleyen hesaplardan büyü, yeni satışa bağımlı kalma.",
          weight: 85,
        },
      ],
    },
  },
  {
    id: "bm-marketplace",
    name: "Two-Sided Marketplace",
    tagline: "Alıcı ile satıcıyı buluşturan platform.",
    description:
      "Kendin envanter tutmazsın; iki tarafı eşleştirir, işlemden komisyon alırsın. Zor kısım: 'chicken-and-egg' (hangi taraf önce gelir).",
    accent: "nebula",
    tags: ["marketplace", "platform", "network-effect"],
    examples: ["Airbnb", "Etsy", "Udemy", "Fiverr"],
    revenuePattern: "take-rate",
    northStar: "GMV (Gross Merchandise Value)",
    secondaryKpis: ["Take rate %", "Repeat transaction %", "Supply utilization"],
    capitalIntensity: "medium",
    scaleBehavior: "Şehir-şehir veya kategori-kategori büyür. Ağ etkisi kritik.",
    idealTeamSize: "5–30 kişi",
    timeToFirstDollar: "6–18 ay",
    defensibility: "Ağ etkisi + marka + veri",
    risks: [
      "Tek taraf çökerse iki taraf gider",
      "Disintermediation (taraflar sonra birbirini bulur)",
      "Regülasyon (gig ekonomisi)",
    ],
    recommendedBlueprints: ["bp-sales-marketing", "bp-customer-success", "bp-product"],
    visionTemplate: {
      mission: "[Arz tarafı] için [talep tarafı]'na en kısa ve güvenli köprüyü kurmak.",
      vision:
        "Kategorimizde ağ etkisi kilidine ulaşmış, pazar payı liderliğini elinde tutan tek platform olmak.",
      themes: [
        {
          label: "Liquidity First",
          description: "Arz ve talep dengesinde boşluk bırakmamak.",
          weight: 95,
        },
        {
          label: "Güven Altyapısı",
          description: "Her iki tarafın da 'gönül rahatlığı' üretecek kanıtlar.",
          weight: 80,
        },
      ],
    },
  },
  {
    id: "bm-creator-economy",
    name: "Creator/Content",
    tagline: "Kişisel marka üzerinden içerik + ürün + topluluk.",
    description:
      "Bir kişi veya küçük ekip içerik üretir, izleyici büyütür, ve bu izleyiciye eğitim / ürün / üyelik / sponsorluk üzerinden monetize olur. En hızlı başlangıç; en kırılgan ölçek.",
    accent: "solar",
    tags: ["creator", "content", "audience", "brand"],
    examples: ["MrBeast", "Joe Rogan", "Stratechery", "The Hustle"],
    revenuePattern: "hybrid",
    northStar: "Haftalık aktif audience + Sponsorluk geliri",
    secondaryKpis: ["Subscriber growth", "Engagement rate", "ARPU", "Sponsor-slot fill"],
    capitalIntensity: "low",
    scaleBehavior: "İçerik kalitesi → audience → monetization. Algoritma bağımlı.",
    idealTeamSize: "1–8 kişi",
    timeToFirstDollar: "3–12 ay",
    defensibility: "Kişisel marka + topluluk + arşiv içerik kütüphanesi",
    risks: [
      "Platform bağımlılığı (YouTube, Spotify politika değişimi)",
      "Burnout",
      "Monetizasyon çeşitlenmezse kırılgan",
    ],
    recommendedBlueprints: ["bp-product", "bp-customer-success"],
    visionTemplate: {
      mission: "[Niş] hakkında en akıllı, en tutarlı ve en samimi içerik merkezini kurmak.",
      vision: "Nişimizde ilk akla gelen kişisel marka ve topluluk olmak.",
      themes: [
        {
          label: "İçerik Tutarlılığı",
          description: "Her hafta aynı kaliteyle, aynı tempoda yayın.",
          weight: 90,
        },
        {
          label: "Topluluk Derinliği",
          description: "Takipçi değil, aidiyet hisseden üye.",
          weight: 80,
        },
      ],
    },
  },
  {
    id: "bm-dtc",
    name: "DTC (Direct-to-Consumer)",
    tagline: "Fiziksel ürünü aracısız satmak.",
    description:
      "Kendi markanla ürettiğin (veya private label) ürünü doğrudan tüketiciye — web sitesi, Shopify, Instagram — üzerinden satarsın. Pazar araştırması + tedarik zinciri + marka hikayesi üç ayağı.",
    accent: "quantum",
    tags: ["e-commerce", "physical", "brand", "shopify"],
    examples: ["Allbirds", "Glossier", "Warby Parker", "Gymshark"],
    revenuePattern: "one-time",
    northStar: "Kontribüsyon marjı × sipariş hacmi",
    secondaryKpis: ["CAC", "AOV", "Repeat order rate", "Inventory turnover"],
    capitalIntensity: "high",
    scaleBehavior: "Paid ads + organik marka birlikte yürür. Stok döngüsü kritik.",
    idealTeamSize: "4–20 kişi",
    timeToFirstDollar: "3–6 ay",
    defensibility: "Marka + ürün kalitesi + müşteri sadakati",
    risks: ["iOS 14 sonrası attribution", "Ad cost enflasyonu", "Stok yönetim hatası"],
    recommendedBlueprints: ["bp-sales-marketing", "bp-finance"],
    visionTemplate: {
      mission: "[Ürün kategorisi]'nde alıcıya en net ve samimi deneyimi sunmak.",
      vision: "Kategorimizde Instagram'dan tanınan, 5 yılda üçüncü kez satın alınan markayı kurmak.",
      themes: [
        { label: "Marka Samimiyeti", description: "", weight: 85 },
        { label: "Unit Ekonomisi Disiplini", description: "", weight: 90 },
      ],
    },
  },
  {
    id: "bm-boutique-consulting",
    name: "Boutique Consulting",
    tagline: "Dar uzmanlık + yüksek ücret + az müşteri.",
    description:
      "Belirli bir problem türünde derin uzmanlık geliştirip, az sayıda yüksek-ödemeli müşteriyle çalışırsın. Gelir insan saati bağımlı ama marj yüksek.",
    accent: "solar",
    tags: ["services", "expertise", "b2b", "high-touch"],
    examples: ["First Round Partners", "Reforge (önce)", "McKinsey Digital Labs"],
    revenuePattern: "one-time",
    northStar: "Aylık faturalanabilir saat × saat ücreti",
    secondaryKpis: ["Kullanılan/toplam saat", "Proje marjı", "Müşteri tekrar oranı"],
    capitalIntensity: "low",
    scaleBehavior: "İnsanla büyür — prodüktizasyon (ürünleştirme) olmadan tavan var.",
    idealTeamSize: "2–12 kişi",
    timeToFirstDollar: "1–3 ay",
    defensibility: "Kişisel itibar + referans zinciri + metodoloji",
    risks: [
      "Scale sınırı",
      "Kilit kişiye bağımlılık",
      "İşveren piyasası döngüye hassas",
    ],
    recommendedBlueprints: ["bp-sales-marketing", "bp-finance"],
    visionTemplate: {
      mission: "[Problem türü] konusunda en derin uzmanlık adresi olmak.",
      vision: "Sektörde ilk 5'te hatırlanan butik danışmanlık markası.",
      themes: [
        { label: "Uzmanlık Derinliği", description: "", weight: 95 },
        { label: "Marj Disiplini", description: "", weight: 80 },
      ],
    },
  },
  {
    id: "bm-ai-native-tool",
    name: "AI-Native Tool",
    tagline: "LLM çağında mümkün olan, öncesinde imkansız olan araç.",
    description:
      "Ürünü çekirdek LLM yeteneklerini (planlama, özetleme, üretim) iş akışına entegre eder. Önceki dönemde yapılması ya çok pahalı ya imkansız olan işleri masifleştirir.",
    accent: "nebula",
    tags: ["ai", "llm", "tools", "productivity"],
    examples: ["Cursor", "Perplexity", "Harvey (legal)", "Hebbia"],
    revenuePattern: "subscription",
    northStar: "Haftalık aktif kullanıcı × ortalama prompt başına değer",
    secondaryKpis: ["Retention D30", "Seat expansion", "Inference cost / revenue"],
    capitalIntensity: "medium",
    scaleBehavior:
      "Dağıtım > model. Viral kalite + entegrasyonlar büyümeyi taşır.",
    idealTeamSize: "3–20 kişi",
    timeToFirstDollar: "2–6 ay",
    defensibility: "Özel iş akışı + veri etkisi + marka",
    risks: [
      "Temel modeller özelliği komoditeleştirir",
      "Inference maliyeti",
      "Hızlı rekabet",
    ],
    recommendedBlueprints: ["bp-sales-marketing", "bp-product", "bp-customer-success"],
    visionTemplate: {
      mission:
        "LLM çağında [iş] problemini tek sürtünmesiz deneyime indirgeyen aracı kurmak.",
      vision: "Kategorimizde AI-native aracın de-facto standardı olmak.",
      themes: [
        { label: "AI Kullanıcı Deneyimi", description: "", weight: 95 },
        { label: "Dağıtım > Model", description: "", weight: 80 },
      ],
    },
  },
  {
    id: "bm-subscription-commerce",
    name: "Subscription Commerce",
    tagline: "Tekrar eden fiziksel / dijital ürün kutusu.",
    description:
      "Abonelik modeliyle aylık/haftalık ürün veya servis. Churn ve kargo maliyeti iki tehdit; predictable revenue ve veri avantajı.",
    accent: "quantum",
    tags: ["subscription", "dtc", "recurring"],
    examples: ["Dollar Shave Club", "Birchbox", "HelloFresh"],
    revenuePattern: "subscription",
    northStar: "MRR × 1/churn",
    secondaryKpis: ["Monthly churn %", "AOV", "LTV:CAC"],
    capitalIntensity: "high",
    scaleBehavior: "Önceden stok tahmini kritik. Abonelik veri avantajı sağlar.",
    idealTeamSize: "5–25 kişi",
    timeToFirstDollar: "4–8 ay",
    defensibility: "Veri + marka + lojistik verimliliği",
    risks: ["Churn", "Kargo maliyeti", "Kategori yorgunluğu"],
    recommendedBlueprints: ["bp-sales-marketing", "bp-customer-success", "bp-finance"],
    visionTemplate: {
      mission: "[Kategori]'de aylık sürpriz + rutin'i kusursuz birleştirmek.",
      vision: "Abonemizin ayın en merakla beklenen paketini göndermek.",
      themes: [
        { label: "Churn Direnci", description: "", weight: 95 },
        { label: "Kargo Operasyon Disiplini", description: "", weight: 85 },
      ],
    },
  },
  {
    id: "bm-affiliate",
    name: "Affiliate / Niche Site",
    tagline: "İçerik üret, trafik al, başkasının ürününü sat, komisyon kazan.",
    description:
      "SEO veya sosyal medya üzerinden trafik çekip, Amazon Associates / Impact / kendi seçtiğin network'ten komisyon kazandığın site/kanal. Sermaye neredeyse sıfır, zaman yoğun.",
    accent: "ion",
    tags: ["affiliate", "seo", "content", "digital-only"],
    examples: ["Wirecutter", "NerdWallet", "The Points Guy"],
    revenuePattern: "hybrid",
    northStar: "Organik aylık trafik × ortalama komisyon",
    secondaryKpis: ["Anahtar kelime sıralaması", "Konverjans oranı", "EPC"],
    capitalIntensity: "low",
    scaleBehavior: "İçerik + backlink + niş otoritesi birleşir; Google update riskine açık.",
    idealTeamSize: "1-3 kişi",
    timeToFirstDollar: "2-6 ay",
    defensibility: "Domain otoritesi + marka + içerik arşivi",
    risks: [
      "Google algoritma değişiklikleri",
      "AI arama sonuçlarının trafik emmesi",
      "Komisyon programlarında koşul değişimi",
    ],
    recommendedBlueprints: ["bp-product"],
    visionTemplate: {
      mission: "[Niş] hakkında internetteki en güvenilir bağımsız kaynak olmak.",
      vision: "Nişimizde Google'ın ilk 3 otoritesinden biri.",
      themes: [
        { label: "İçerik Kalitesi", description: "", weight: 90 },
        { label: "Güvenilir Referans", description: "", weight: 80 },
      ],
    },
    executionType: "digital-only",
    digitalRevenueShare: 100,
    resourceProfile: {
      capital: { level: "none", minUsd: 0, maxUsd: 500, note: "Domain + hosting + belki 1 tool" },
      time: { hoursPerWeek: { min: 10, max: 25 }, weeksToMvp: { min: 4, max: 8 } },
      physicalPresence: "none",
      humanSkills: ["Yazı", "SEO dürtüsü", "Sabır"],
      tools: ["WordPress/Ghost", "Ahrefs/Semrush", "Google Analytics"],
      digitalTasks: ["Makale yazımı", "Anahtar kelime araştırması", "Email list kurma", "Affiliate link yönetimi"],
    },
  },
  {
    id: "bm-print-on-demand",
    name: "Print-on-Demand (POD)",
    tagline: "Tasarla, yükle, sat — üretim stresi yok.",
    description:
      "Tasarımlarını Printful, Printify, Gelato gibi POD partner'ına yüklersin; müşteri sipariş verince o basar ve kargolar. Stok tutmazsın ama marjlar ince.",
    accent: "nebula",
    tags: ["pod", "ecommerce", "design", "etsy"],
    examples: ["The Crying Shop", "Sunday Paper Shop", "Local Fluff"],
    revenuePattern: "one-time",
    northStar: "Günlük sipariş sayısı × ortalama marj",
    secondaryKpis: ["CAC", "Repeat customer %", "Tasarım başı satış"],
    capitalIntensity: "low",
    scaleBehavior:
      "Viral olan tek tasarım işi 10x büyütebilir; çoğu zaman 'niş topluluk + doğru tasarım' patent yaratır.",
    idealTeamSize: "1-4 kişi",
    timeToFirstDollar: "1-3 ay",
    defensibility: "Marka + tasarımcı yetenek + topluluk bağlılığı",
    risks: [
      "POD partner'ın kalite sorunu",
      "Kargo gecikmesi şikayetleri (fiziksel)",
      "İnce marj — ads fiyatı yerse batarsın",
    ],
    recommendedBlueprints: ["bp-sales-marketing"],
    visionTemplate: {
      mission: "[Niş topluluk]'u temsil eden özgün tasarımları fiziksel ürüne dönüştürmek.",
      vision: "Topluluğumuzun 'biz' diyeceği markayı kurmak.",
      themes: [
        { label: "Tasarım Orijinalliği", description: "", weight: 95 },
        { label: "Topluluk Bağlılığı", description: "", weight: 85 },
      ],
    },
    executionType: "hybrid",
    digitalRevenueShare: 85,
    resourceProfile: {
      capital: { level: "low", minUsd: 300, maxUsd: 3000, note: "İlk tasarım testleri + ad bütçesi" },
      time: { hoursPerWeek: { min: 12, max: 30 }, weeksToMvp: { min: 2, max: 6 } },
      physicalPresence: "occasional",
      humanSkills: ["Tasarım", "Ürün fotoğrafı", "Topluluk iletişimi"],
      tools: ["Printful/Printify", "Shopify/Etsy", "Canva/Figma", "Meta Ads"],
      digitalTasks: [
        "Tasarım üretimi + mockup",
        "Etsy/Shopify listing",
        "Meta + TikTok ads",
        "Community management",
      ],
      physicalTasks: [
        "Tasarım kalite kontrol (ilk basılı örnekler)",
        "İade/kargo hatası süreç yönetimi",
        "Occasional fuar/etkinlik standı",
      ],
    },
  },
  {
    id: "bm-shopify-brand",
    name: "Shopify DTC / Dropship Brand",
    tagline: "Kendi markan, seçtiğin tedarikçi, Shopify üzerinden satış.",
    description:
      "Ürünü kendin üretmezsin (tedarikçi / private label) ama markan senin. Shopify + Meta/TikTok ads motorunu kurup unit ekonomisini ayakta tutman lazım.",
    accent: "quantum",
    tags: ["shopify", "dtc", "ecommerce", "hybrid"],
    examples: ["Allbirds (önce)", "Gymshark", "Pura Vida"],
    revenuePattern: "one-time",
    northStar: "Kontribüsyon marjı × sipariş hacmi",
    secondaryKpis: ["CAC", "AOV", "Repeat order %", "Inventory turns"],
    capitalIntensity: "medium",
    scaleBehavior: "Paid ads + organik marka birlikte yürür; stok döngüsü kritiktir.",
    idealTeamSize: "2-8 kişi",
    timeToFirstDollar: "2-4 ay",
    defensibility: "Marka + müşteri sadakati + supplier ilişkisi",
    risks: [
      "iOS 14 sonrası attribution kaybı",
      "Ad cost enflasyonu",
      "Tedarikçi kalite/süre problemi (fiziksel)",
    ],
    recommendedBlueprints: ["bp-sales-marketing", "bp-customer-success", "bp-finance"],
    visionTemplate: {
      mission: "[Kategori]'de alıcıya en net ve samimi deneyimi sunmak.",
      vision: "Kategorimizde 5 yılda üç kez satın alınan markayı kurmak.",
      themes: [
        { label: "Marka Samimiyeti", description: "", weight: 85 },
        { label: "Unit Ekonomisi", description: "", weight: 90 },
      ],
    },
    executionType: "hybrid",
    digitalRevenueShare: 90,
    resourceProfile: {
      capital: { level: "medium", minUsd: 5000, maxUsd: 50000, note: "İlk stok + ads + Shopify/app" },
      time: { hoursPerWeek: { min: 20, max: 50 }, weeksToMvp: { min: 6, max: 14 } },
      physicalPresence: "occasional",
      humanSkills: ["Tedarikçi müzakere", "Marka hikayesi", "Ads optimization", "Müşteri hizmetleri"],
      tools: ["Shopify", "Klaviyo", "Meta Ads", "Triple Whale", "Gorgias"],
      digitalTasks: [
        "Shopify store + theme",
        "Ad kampanya yönetimi",
        "Email/SMS retention",
        "Content + influencer",
      ],
      physicalTasks: [
        "Tedarikçi seçimi + kalite kontrol",
        "Numuneler + paketleme onayı",
        "3PL / depo operasyon (ya da kendin)",
        "İade + hasarlı kargo süreci",
      ],
    },
  },
  {
    id: "bm-amazon-fba",
    name: "Amazon FBA Brand",
    tagline: "Private label ürün + Amazon fulfillment + listing optimization.",
    description:
      "Ürünü (genelde Çin/Türkiye tedarikçiden) private label yaptırır, Amazon FBA'ya gönderir, Amazon listing'i + PPC ile satarsın. Stok sermayesi yüksek, marj makul.",
    accent: "solar",
    tags: ["amazon", "fba", "ecommerce", "private-label"],
    examples: ["Anker (önce FBA)", "Ahead Brand", "bir sürü KOBİ FBA brand"],
    revenuePattern: "one-time",
    northStar: "TACOS (total ad cost of sales) dengeli + büyüyen review/brand",
    secondaryKpis: ["Buy Box win rate", "ACoS", "Inventory Performance Index"],
    capitalIntensity: "high",
    scaleBehavior: "İlk ürün satış makinesi kurulduğunda, portföye 2. 3. ürün eklenir; Amazon'a bağımlı.",
    idealTeamSize: "1-5 kişi",
    timeToFirstDollar: "3-6 ay",
    defensibility: "Review sayısı + brand registry + supplier ilişki",
    risks: [
      "Amazon hesap askıya alma",
      "Listing hijacking",
      "Tedarikçi kargo gecikmesi (fiziksel)",
      "Stok kararlarında nakit sıkışıklığı",
    ],
    recommendedBlueprints: ["bp-sales-marketing", "bp-finance"],
    visionTemplate: {
      mission: "[Ürün kategorisinde] Amazon'da en yüksek değerlendirmeli marka olmak.",
      vision: "Kategori lideri + markalı web sitesine geçiş yapan brand.",
      themes: [
        { label: "Review Disiplini", description: "", weight: 90 },
        { label: "Stok Döngüsü Yönetimi", description: "", weight: 80 },
      ],
    },
    executionType: "hybrid",
    digitalRevenueShare: 88,
    resourceProfile: {
      capital: { level: "high", minUsd: 8000, maxUsd: 60000, note: "İlk parti stok + FBA nakliye + ads" },
      time: { hoursPerWeek: { min: 15, max: 40 }, weeksToMvp: { min: 10, max: 20 } },
      physicalPresence: "occasional",
      humanSkills: ["Ürün araştırması", "Tedarikçi Alibaba", "Listing SEO"],
      tools: ["Helium 10 / Jungle Scout", "Seller Central", "Alibaba", "Amazon Ads"],
      digitalTasks: [
        "Ürün araştırma + keyword",
        "Listing (başlık, bullet, görsel)",
        "Amazon PPC yönetimi",
        "Review yönetimi",
      ],
      physicalTasks: [
        "Tedarikçi numunesi onayı",
        "Paketleme tasarımı + kalite kontrol",
        "Inspection + FBA'ya gönderim lojistiği",
        "İade/hasar süreç yönetimi",
      ],
    },
  },
  {
    id: "bm-platform-plugin",
    name: "Platform Plugin / Ecosystem Play",
    tagline: "Büyük platformun üstünde yaşayan eklenti.",
    description:
      "Shopify, Salesforce, HubSpot, Notion gibi bir platformun kullanıcılarına özel değer katan eklenti. Hızlı dağıtım + düşük CAC, ama platformun insafına bağımlısın.",
    accent: "ion",
    tags: ["plugin", "ecosystem", "app-store"],
    examples: ["Klaviyo (önce Shopify)", "Superhuman (Gmail)", "Calendly"],
    revenuePattern: "subscription",
    northStar: "Aktif install × ARPU",
    secondaryKpis: ["Install to paid %", "Churn", "Platform'daki sıralama"],
    capitalIntensity: "low",
    scaleBehavior: "Platform'un büyümesine paralel. Listelenme + yorum oyunu.",
    idealTeamSize: "2–10 kişi",
    timeToFirstDollar: "2–5 ay",
    defensibility: "Platform entegrasyonu + kullanıcı veri birikimi",
    risks: [
      "Platform seni klonlar veya politika değiştirir",
      "Revenue share kesintisi",
      "Marka bağımsızlığı zayıf",
    ],
    recommendedBlueprints: ["bp-product", "bp-customer-success"],
    visionTemplate: {
      mission: "[Platform] kullanıcılarına [spesifik problem] için en parlak eklentiyi sunmak.",
      vision: "Platform'un app store'unda kategori liderliği.",
      themes: [
        { label: "Platform Entegrasyon Derinliği", description: "", weight: 85 },
        { label: "Müşteri Sahipliği", description: "", weight: 70 },
      ],
    },
  },
];

export const opportunities: BusinessOpportunity[] = [
  {
    id: "op-ai-vertical-saas",
    title: "Orta pazar için AI-native dikey SaaS",
    thesis:
      "Klasik SaaS'ın yatay yazılımı giderek komoditelleşti; fakat belirli sektörlerde (klinik, gayrimenkul, hukuk, eğitim) AI ile insanın 8 saatlik işini 30 dakikaya indiren workflow'lar yeniden açılıyor. Büyük oyuncular 'yatay' olduğu için bu hızla hareket edemiyor.",
    accent: "ion",
    tags: ["ai", "saas", "vertical"],
    trend: "LLM'lerin komotilize olması + dikey veri avantajının geri dönüşü",
    marketSize: "Her dikey için $5B-$50B TAM",
    timing: "hot",
    startupFit: "small-team",
    relatedModelIds: ["bm-vertical-saas", "bm-ai-native-tool"],
    relatedBlueprintIds: ["bp-sales-marketing", "bp-customer-success", "bp-product"],
    evidence: [
      "Harvey (hukuk), Abridge (sağlık), EvenUp (sigorta) son 18 ayda $100M+ raised",
      "Incumbent'lar AI özelliklerini sonradan ekliyor, native rakipler hızla pazar alıyor",
    ],
    market: {
      tam: "Seçilen dikey başına $5-50B; 12 dikeye erişilebilir",
      growth: "%18-25 CAGR (AI-native segmenti)",
      incumbents: [
        "Yatay platform (Salesforce, HubSpot) — yavaş",
        "Legacy vertical (Veeva, Epic) — modernizasyon ağır",
        "Yeni AI-native rakipler (Harvey, Abridge, Sybill)",
      ],
      whitespace:
        "Orta pazar segmenti (50-500 kişilik şirket) hâlâ büyük ölçüde boş; enterprise-only AI araçları küçük müşteriye oturmuyor, yatay araçlar ise derinlik yok.",
    },
    outlook: {
      horizonMonths: 24,
      forecast:
        "2 yıl içinde her büyük dikeyde (hukuk, sağlık, emlak, eğitim, lojistik) AI-native lider belirginleşir. İlk giren + veri avantajı olanlar pazarı hapseder. Sonradan giren yatay platformlar satın alma yoluna gitmek zorunda kalır. Exit potansiyeli: $200M-$2B.",
      wedge:
        "Tek bir 50-250 kişilik müşteri segmentine odaklan; onların 1 kritik workflow'unu (prop değerleme, dava hazırlık, ön-tanı) AI ile 10x hızlandır; NRR motorunu kurarak büyü.",
      confidence: "high",
    },
    roadmap: [
      {
        phase: "validate",
        month: "0-1 ay",
        action: "10 hedef müşteri ile derinlemesine görüşme; 1 workflow seç",
        deliverable: "Problem-solution fit raporu + 3 design partner",
      },
      {
        phase: "build",
        month: "1-4 ay",
        action: "MVP: Tek workflow için AI-native akış + entegrasyon",
        deliverable: "Çalışan prototip, 3 design partner canlı kullanıyor",
      },
      {
        phase: "launch",
        month: "4-7 ay",
        action: "10 müşteriye ölçekle, paid pilot'lara dönüştür",
        deliverable: "$10K MRR, net promoter score > 50",
      },
      {
        phase: "scale",
        month: "7-18 ay",
        action: "NRR motoru + ikinci workflow + satış ekibi",
        deliverable: "$50K+ MRR, Series A hazır",
      },
    ],
    investment: {
      timeMonths: { min: 12, max: 24 },
      capitalUsd: { min: 150000, max: 800000 },
      teamSize: "3-8 kişi (founder + 2 dev + 1 domain expert + CS)",
      burnRiskLevel: "medium",
    },
    goNoGo: [
      "Seçtiğin dikeyde en az 2 yıl deneyimin/bağlantın var mı?",
      "5 potansiyel design partner'ı 30 günde bulabilir misin?",
      "Seçtiğin workflow gerçekten 10x hızlanabilir mi (yoksa 2x)?",
      "Müşteri ortalama $500+ ayda ödeyebilir mi?",
      "Regülasyon engeli var mı (HIPAA, SOC2, vs.)?",
    ],
    northStar: "Net Revenue Retention (ilk 12 ay) + yeni dikey geçiş hızı",
  },
  {
    id: "op-creator-tooling",
    title: "Bağımsız creator için 'tüm işletme' araç takımı",
    thesis:
      "Creator artık 'bir YouTube kanalı' değil; podcast + email list + ürün + topluluk işleten bir küçük işletme. Fakat bu 7-8 aracı birbirine bağlayacak entegre bir 'creator OS' yok.",
    accent: "solar",
    tags: ["creator", "tools", "audience"],
    trend: "Creator ekonomisi $250B'a büyüyor, profesyonelleşiyor",
    marketSize: "$50B global",
    timing: "emerging",
    startupFit: "solo-founder",
    relatedModelIds: ["bm-creator-economy", "bm-vertical-saas", "bm-platform-plugin"],
    relatedBlueprintIds: ["bp-product", "bp-customer-success"],
    evidence: [
      "Kajabi, Beehiiv, Passionfroot büyük fon topladı",
      "Bireysel creator'ların 6-haneli gelir kırılımlarını kamuya açması",
    ],
    market: {
      tam: "$50B creator ekonomisi altyapı; yazılım segmenti ~$12B",
      growth: "%20 CAGR",
      incumbents: [
        "Tekli araçlar (Substack, Patreon, Kajabi) — entegre değil",
        "Yatay platformlar (Notion, Beehiiv) — creator-native değil",
        "Yeni integrated plays (Passionfroot)",
      ],
      whitespace:
        "'Bir creator için tek dashboard' — newsletter + podcast + kurs + topluluk + sponsorluk pipeline'ı tek yerde. Şu an 5-7 araç arasında geçiş yapmak zorunda.",
    },
    outlook: {
      horizonMonths: 24,
      forecast:
        "Creator'lar büyüdükçe profesyonelleşiyor. 2 yıl içinde 'creator OS' kategorisi olgunlaşacak; first-mover'lar brand sadakati yaratacak. Exit: creator platform satın alımı (Patreon benzeri) veya PE roll-up.",
      wedge:
        "Tek bir creator tipine odaklan (newsletter yazarı / podcaster / edukator). Onların tüm gelir kaynakları + operasyonu için tek pane. Sonra komşu niş'e geç.",
      confidence: "medium",
    },
    roadmap: [
      {
        phase: "validate",
        month: "0-1 ay",
        action: "3 creator tipinden biri seç; 8 creator ile derinlemesine görüşme",
        deliverable: "Pain ranking + feature priorities + 3 design partner",
      },
      {
        phase: "build",
        month: "1-4 ay",
        action: "Core flow (içerik + audience + gelir) + Stripe/email/Ghost entegrasyonları",
        deliverable: "3 creator canlı kullanıyor; hafta başı workflow kapanıyor",
      },
      {
        phase: "launch",
        month: "4-8 ay",
        action: "Creator-led marketing (referans, YouTube review videoları)",
        deliverable: "$8K MRR, 50 paying creator, organic growth canlı",
      },
      {
        phase: "scale",
        month: "8-18 ay",
        action: "İkinci creator tipi + sponsor marketplace + analytics premium tier",
        deliverable: "$50K+ MRR, Series A veya profitable indie",
      },
    ],
    investment: {
      timeMonths: { min: 8, max: 18 },
      capitalUsd: { min: 50000, max: 300000 },
      teamSize: "1-4 kişi (solo kurulabilir)",
      burnRiskLevel: "low",
    },
    goNoGo: [
      "Creator olarak kendi audience'in var mı (distribution avantajı)?",
      "Seçtiğin creator tipinin gerçek ödeme kapasitesi var mı (yoksa sadece büyük hayaller)?",
      "7 aracı tek UI'da birleştirme teknik zorluğunu kabul ediyor musun?",
      "İlk 10 creator'ı 60 günde bulabilir misin?",
      "Platform yerine brand kuracak pazarlama disiplini var mı?",
    ],
    northStar: "Haftalık aktif creator × ortalama entegrasyon kullanımı",
  },
  {
    id: "op-embedded-finance",
    title: "Niche B2B SaaS için embedded finance",
    thesis:
      "Dikey SaaS'lar müşterilerinin ödeme / banka / kredi / sigorta akışlarını kontrol ettiği için bu ürünleri embed ederek yazılım gelirinin 2-5 katı finans geliri açabilir. Ama regülasyon + partner seçimi zordur.",
    accent: "quantum",
    tags: ["fintech", "saas", "embedded"],
    trend: "Stripe/Adyen/Unit gibi API katmanlarının olgunlaşması",
    marketSize: "$7T embedded finance volume by 2030",
    timing: "hot",
    startupFit: "funded-team",
    relatedModelIds: ["bm-vertical-saas"],
    relatedBlueprintIds: ["bp-finance", "bp-sales-marketing"],
    evidence: [
      "Toast, ServiceTitan, Shopify ödeme gelirlerinin %30-50 payı",
      "Andreessen, Bessemer 2024'te embedded finance thesis yayınları",
    ],
  },
  {
    id: "op-ai-agents-for-ops",
    title: "Küçük işletmeler için AI ajan operasyon altyapısı",
    thesis:
      "5-50 kişilik şirketler enterprise-grade agent altyapısını kuramıyor; IT ekibi yok. 'Sales + CS + Finance ekibinin 50%'sini AI ajanlarla işleten' paket ürünler başlıyor. Matrix'in kendisi bu fırsatın bir örneği.",
    accent: "nebula",
    tags: ["ai-agents", "smb", "operations"],
    trend: "Claude Agent SDK / ChatGPT Operator / kendi çerçevelerin yükselişi",
    marketSize: "$30B SMB ops software",
    timing: "emerging",
    startupFit: "small-team",
    relatedModelIds: ["bm-vertical-saas", "bm-ai-native-tool"],
    relatedBlueprintIds: [
      "bp-sales-marketing",
      "bp-customer-success",
      "bp-finance",
      "bp-hr-talent",
    ],
    evidence: [
      "YC 2024 batch'inin %30'undan fazlası agent-native",
      "Anthropic, OpenAI agent SDK yatırımları",
    ],
    market: {
      tam: "$30B SMB ops software (global); ~$8B erişilebilir ilk katman",
      growth: "%32 CAGR (AI ops kategorisi, 2025-2028)",
      incumbents: [
        "Horizontal automation (Zapier, Make) — AI değil",
        "Enterprise ajan platformları (Salesforce Agentforce) — KOBİ için ağır",
        "Yeni native rakipler (Lindy, Relay, Matrix tipi)",
      ],
      whitespace:
        "5-50 kişilik şirketlerin 'tek bir pakette hepsi' araç ihtiyacı. IT ekibi yok, kendi kodlarını yazamazlar; ama enterprise fiyat da ödeyemezler.",
    },
    outlook: {
      horizonMonths: 18,
      forecast:
        "18 ay içinde 'KOBİ için agent OS' kategorisi netleşir. 3-5 oyuncu ortaya çıkar, geri kalanı niche kalır. Exit mantığı: hızlı PE roll-up veya enterprise platformdan acquihire. Matrix'in kendisi bu pazarda parlamak için uygun durumda.",
      wedge:
        "Tek bir ekip (satış / ops / CS) için çerçeveyi mükemmelleştir, sonra yatay genişle. Blueprint konsepti kilit — müşteri 1 tık ile tam departman kuruyorsa switching cost yüksektir.",
      confidence: "high",
    },
    roadmap: [
      {
        phase: "validate",
        month: "0-2 ay",
        action: "10 KOBİ kurucusuyla 1:1; hangi ekibin 'tamamını al' paketi en değerli?",
        deliverable: "Segment seçimi + 5 design partner",
      },
      {
        phase: "build",
        month: "2-6 ay",
        action: "1 blueprint + 1 agent admin arayüzü + onboarding wizard",
        deliverable: "Self-serve onboarding, 5 paying pilot",
      },
      {
        phase: "launch",
        month: "6-10 ay",
        action: "PLG motoru + ilk content marketing; 2. blueprint",
        deliverable: "$20K MRR, NPS > 60, 2 blueprint canlı",
      },
      {
        phase: "scale",
        month: "10-24 ay",
        action: "Marketplace (3rd-party blueprint) + enterprise upgrade path",
        deliverable: "$200K+ MRR, Series A",
      },
    ],
    investment: {
      timeMonths: { min: 12, max: 30 },
      capitalUsd: { min: 200000, max: 1500000 },
      teamSize: "4-10 kişi (founder + 2 dev + 1 designer + 2 SE/CS)",
      burnRiskLevel: "medium",
    },
    goNoGo: [
      "Kendi Matrix-benzeri sistemini kuracak vision + tasarım gücün var mı?",
      "KOBİ satış deneyimin/ağın var mı?",
      "Inference + agent API maliyetini unit ekonomisinde kapatabiliyor musun?",
      "İlk 6 ay içinde 5 paying pilot garanti edilebilir mi?",
      "Anthropic/OpenAI/Google'ın kategoriye girmesine karşı wedge'in net mi?",
    ],
    northStar: "Active workspace sayısı × ortalama blueprint kurulum sayısı",
  },
  {
    id: "op-lokal-marketplace",
    title: "Lokal dikey marketplace",
    thesis:
      "Amazon global, Trendyol ulusal, ama 'şehrine özel' berber rezervasyonu, ev temizliği, halı yıkama gibi marketplace'ler derin likitite açıkları bırakıyor. Şehir-şehir kapanabilir, düşük CAC fırsatı.",
    accent: "quantum",
    tags: ["marketplace", "local", "services"],
    trend: "Post-pandemic lokal ekonomi + mobil yaygınlaşma",
    marketSize: "$50M-500M per city",
    timing: "mature",
    startupFit: "small-team",
    relatedModelIds: ["bm-marketplace"],
    relatedBlueprintIds: ["bp-sales-marketing", "bp-customer-success"],
    evidence: [
      "Local Fishbowl (US), Superpeer, Quicker Türkiye'de",
      "Google Local Services Ads adoption",
    ],
  },
  {
    id: "op-prosumer-creator-software",
    title: "Creator için prodüktif creator yazılımı",
    thesis:
      "Video / podcast / blog üreten herkese en baş ağrısı post-production: clip, transkript, thumbnail, çeviri, yayın dağıtımı. AI her birini saniyelere indirebilir, fakat 'entegre süreç' kimse kuramadı.",
    accent: "nebula",
    tags: ["creator", "video", "audio", "ai"],
    trend: "Kısa video patlaması + multi-platform dağıtım",
    marketSize: "$12B creator tools",
    timing: "hot",
    startupFit: "small-team",
    relatedModelIds: ["bm-ai-native-tool", "bm-creator-economy"],
    relatedBlueprintIds: ["bp-product", "bp-customer-success"],
    evidence: [
      "Descript, Opus Clip, Cast Magic'in hızlı büyümesi",
      "Capcut/Eklipse gibi araçların kullanıcı sayıları",
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Generic asset archetypes — Matrix'in "bu iş yapılabilir" ilham koleksiyonu.
  // Her biri, dijital pazarlarda (Flippa/EF/Acquire/TrueMRR) tekrarlayan
  // örüntülerden süzülmüş, spesifik listing değil; pattern + thesis + wedge.
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "op-productivity-microsaas",
    title: "Productivity Micro-SaaS — Focus / Timer / Habit",
    thesis:
      "Knowledge worker'ların günlük ritüelini basit tutan tek-amaçlı araçlar ($5-15/ay sub) sürekli yeni alıcı buluyor. Düşük CAC, Chrome extension + web app, tek developer ile sürdürülebilir. Matrix için 'productivity vertical' başlangıç noktası.",
    accent: "ion",
    tags: ["saas", "micro-saas", "productivity", "solo-founder"],
    trend: "Solo founder + AI ile tek araç bakımı artık mümkün",
    marketSize: "$500M niche · Chrome Web Store top 100'de sürekli rotasyon",
    timing: "hot",
    startupFit: "solo-founder",
    relatedModelIds: ["bm-ai-native-tool"],
    relatedBlueprintIds: ["bp-product", "bp-customer-success"],
    evidence: [
      "Flippa/Acquire'da $60-150K aralığında sürekli listing akışı",
      "Tek geliştiriciyle $5-15K MRR örnekleri yaygın",
      "Chrome extension dağıtım kanalı organik",
    ],
  },
  {
    id: "op-personal-finance-seo-affiliate",
    title: "Personal Finance SEO Affiliate Sitesi",
    thesis:
      "'Best budgeting app', 'how to save money' gibi commercial-intent keyword'ler yüksek CPC ve yüksek affiliate komisyon. SEO-driven, büyüdükten sonra neredeyse pasif. Matrix'in content-writer + SEO-researcher ajanlarıyla aylık 12-20 sayfa üretip kaldıraç yüksek.",
    accent: "solar",
    tags: ["affiliate", "seo", "content", "personal-finance"],
    trend: "Google Helpful Content sonrası otantik içeriğe prim veriliyor — AI-draft + human-edit karışımı çalışıyor",
    marketSize: "$2B+ personal finance affiliate pazarı",
    timing: "mature",
    startupFit: "solo-founder",
    relatedModelIds: ["bm-content-brand"],
    relatedBlueprintIds: ["bp-product"],
    evidence: [
      "Empire Flippers'da personal finance SEO siteleri 30-45x monthly profit multiple'ıyla satılıyor",
      "NerdWallet, The Points Guy gibi referans oyuncular",
      "18-36 ayda $3-8K/ay pasif gelire ulaşma örnekleri yaygın",
    ],
  },
  {
    id: "op-ai-meeting-to-crm",
    title: "AI Meeting Notes → CRM Auto-Log Micro-SaaS",
    thesis:
      "Zoom/Meet kaydını transcript eden + HubSpot/Salesforce'a structured update yazan niche araç. Sales team'ler her meeting sonrası 8-12 dakika admin'den kurtulur. $49-99/user/ay ödenir, B2B churn düşük.",
    accent: "quantum",
    tags: ["ai", "saas", "b2b", "sales-ops"],
    trend: "AI transcription komodite oldu, farklılaşma 'nereye yazdığında' — entegrasyon kalitesi",
    marketSize: "$8B sales enablement · 600K+ paid sales rep global",
    timing: "hot",
    startupFit: "small-team",
    relatedModelIds: ["bm-ai-native-tool", "bm-vertical-saas"],
    relatedBlueprintIds: ["bp-sales-marketing", "bp-product", "bp-customer-success"],
    evidence: [
      "Gong, Chorus, Sybill'in $1B+ değerlemeleri",
      "Mid-market segment açık — enterprise pricing küçük ekibe çok pahalı",
      "Acquire.com'da bu kategoride $300-800K aralığında aktif alım-satım",
    ],
  },
  {
    id: "op-digital-template-catalog",
    title: "Dijital Template Kataloğu (Notion / Figma / Excel)",
    thesis:
      "Tek-seferlik $29-79 satış + düşük iade oranı. Gumroad + custom landing + Product Hunt launch'ı ile organik trafik. Matrix'in Keymaker blueprint'leriyle crossover — kataloğu agent'lar ile sürekli güncel tutulabilir.",
    accent: "nebula",
    tags: ["digital-product", "template", "one-time-sale", "gumroad"],
    trend: "Creator economy'de paketli bilgi ürünleri kurs'tan daha hızlı satıyor",
    marketSize: "Niche başına $1-3M/yıl ulaşılabilir gelir",
    timing: "mature",
    startupFit: "solo-founder",
    relatedModelIds: ["bm-content-brand", "bm-creator-economy"],
    relatedBlueprintIds: ["bp-product"],
    evidence: [
      "Tiny Acquisitions'da $25-50K aralığında düzenli listing",
      "Product Hunt top launch'lar ayda $5-15K ilk ay revenue üretebiliyor",
      "9-14 ayda $2-4K/ay steady state yaygın",
    ],
  },
  {
    id: "op-dev-tools-github-app",
    title: "Developer Tools · GitHub App",
    thesis:
      "Kod review, test coverage, deployment safety gibi spesifik dev workflow'unu AI ile otomatize eden GitHub App. Multi-tenant omurgası doğal, müşteri sadakati yüksek — dev'ler aracı günde 20+ kez görüyor.",
    accent: "ion",
    tags: ["saas", "devtools", "github", "b2b"],
    trend: "Claude Agent SDK + Cursor + Copilot sonrası dev-tools'da AI derinlik arttı",
    marketSize: "$12B dev tools · 100M+ developer global",
    timing: "hot",
    startupFit: "small-team",
    relatedModelIds: ["bm-ai-native-tool", "bm-vertical-saas"],
    relatedBlueprintIds: ["bp-product", "bp-customer-success"],
    evidence: [
      "TrueMRR'da dev tools kategorisi 5-8x MRR multiple ile premium'da satılıyor",
      "GitHub Marketplace 2.5M+ app install — ekosistem büyüyor",
      "16-24 ayda $6-12K/ay MRR örnekleri yaygın",
    ],
  },
  {
    id: "op-ai-sector-newsletter",
    title: "AI / Sektör Odaklı Newsletter Brand",
    thesis:
      "Haftada 2-3 edition · Beehiiv + sponsor + paid tier. İlk 5K sub sponsor fiyatlandırmayı açar, 25K+ sub premium subscription'ı destekler. Matrix'in research-curator + content-writer ajanlarıyla bir creator'ın emeğini %70 kısaltır.",
    accent: "nebula",
    tags: ["newsletter", "content-brand", "media", "sponsor"],
    trend: "Morning Brew, TLDR, Lenny's Newsletter — creator-led media growing",
    marketSize: "$10B+ newsletter sponsor ecosystem",
    timing: "hot",
    startupFit: "solo-founder",
    relatedModelIds: ["bm-content-brand", "bm-creator-economy"],
    relatedBlueprintIds: ["bp-product"],
    evidence: [
      "Beehiiv'da $2-10K/ay sponsor gelir bandı yaygın",
      "Tiny Acquisitions'da AI/tech newsletter'lar 2-3x annual revenue ile el değiştiriyor",
      "9-15 ayda 10K+ sub & ilk sponsor örnekleri yaygın",
    ],
  },
  {
    id: "op-shopify-pod-niche-brand",
    title: "Shopify POD Niche Brand (Apparel / Accessories)",
    thesis:
      "Printful/Printify + Shopify + Meta Ads + UGC creator network. 30-50 SKU, dar niş (fitness / outdoor / pet / hobby), minimal envanter riski. Matrix'in ad-creative-generator + inventory-sync + customer-service ajanlarıyla fiziksel operasyon %10 altına iner.",
    accent: "solar",
    tags: ["ecommerce", "pod", "shopify", "physical-brand"],
    trend: "D2C çağının pre-order + POD ile sermaye-hafif versiyonu hâlâ güçlü",
    marketSize: "$50B POD global, %15 CAGR",
    timing: "mature",
    startupFit: "solo-founder",
    relatedModelIds: ["bm-ecommerce-brand"],
    relatedBlueprintIds: ["bp-sales-marketing", "bp-product", "bp-customer-success"],
    evidence: [
      "Empire Flippers'da POD apparel markaları 28-36x monthly profit ile premium'da",
      "24-30 ayda $10-20K/ay net profit örnekleri yaygın",
      "Creator-led UGC maliyeti Meta Ads kalitesini 3x artırıyor",
    ],
  },
  {
    id: "op-b2b-sales-intel-saas",
    title: "B2B Sales Intelligence · Contact + Sequence SaaS",
    thesis:
      "ZoomInfo/Apollo'ya alternatif — mid-market ekibe odaklı $49-99/user/ay. Matrix'in sales-qualifier + outbound-sequencer + lead-enricher ajanlarıyla tam entegre, SDK lisansına çevrilebilir. Sales operating system hâline getirilirse lock-in yüksek.",
    accent: "ion",
    tags: ["saas", "b2b", "sales-intelligence", "mid-market"],
    trend: "Apollo modeli Türkiye/EMEA'ya da yaygınlaştı, compliance + lokal veri avantajı açık",
    marketSize: "$8B+ sales intelligence TAM, %12 CAGR",
    timing: "mature",
    startupFit: "small-team",
    relatedModelIds: ["bm-vertical-saas", "bm-ai-native-tool"],
    relatedBlueprintIds: ["bp-sales-marketing", "bp-product"],
    evidence: [
      "Proven-SaaS top-10'da istikrarlı, 3-5x MRR multiple'ları ile premium",
      "36+ ayda $18K+/ay steady-state gerçekçi",
      "GDPR-compliant Avrupa pazarı için açık beyaz alan",
    ],
  },
  {
    id: "op-document-ai-qa",
    title: "Document AI · Chat-with-your-docs Micro-SaaS",
    thesis:
      "ChatPDF kalıbının dar niş versiyonları (contract review, tez/makale okuma, mühendislik standartları). Claude Sonnet 4.6 veya Llama 4 70B ile cost-optimize edilebilir — rakipler GPT-4 üstünde %70 maliyetli.",
    accent: "nebula",
    tags: ["saas", "ai", "document-qa", "niche-vertical"],
    trend: "Document Q&A komoditeleşti — farklılaşma niş UX + fiyat",
    marketSize: "$2B+ document AI, niş başına $50-200M reachable",
    timing: "hot",
    startupFit: "solo-founder",
    relatedModelIds: ["bm-ai-native-tool"],
    relatedBlueprintIds: ["bp-product", "bp-customer-success"],
    evidence: [
      "MicroAcquire'da $100-200K aralığında aktif alım-satım",
      "Cost-optimization play — Claude Sonnet 4.6 routing ile marj 3x artırılabilir",
      "14 ayda $5K/ay MRR örnekleri yaygın",
    ],
  },
  {
    id: "op-notion-system-pack",
    title: "Dijital Productivity System Paketi (Gumroad)",
    thesis:
      "Second Brain / PARA / GTD gibi metodolojileri hazır Notion/Obsidian template paketi olarak satmak. $29-99 tek seferlik, düşük iade. Ucuz pick-up opportunity — Matrix Blueprint library'sine direkt template deposu olur.",
    accent: "quantum",
    tags: ["digital-product", "notion", "productivity", "cheap-pickup"],
    trend: "Tiago Forte, Ali Abdaal etkisiyle productivity-system pazarı olgunlaştı, premium'dan low-ticket'a iniyor",
    marketSize: "$50M+ productivity templates niş",
    timing: "mature",
    startupFit: "solo-founder",
    relatedModelIds: ["bm-content-brand", "bm-creator-economy"],
    relatedBlueprintIds: ["bp-product"],
    evidence: [
      "Flippa'da distressed $15-25K aralığında sık listing — pazarlığa açık",
      "11-18 ayda $1.5-3K/ay steady state yaygın",
      "Matrix Blueprint'lerle entegre edilirse B2B kullanıma genişletilebilir",
    ],
  },
];

// ----------------------------------------------------------------------------
// Market Deals — live radar of what's for sale (SaaS marketplaces, acquisition
// platforms, indie deal boards). Matrix continuously ingests listings and
// surfaces ideas with price, MRR, risk, and a "start something similar" path.
// ----------------------------------------------------------------------------

export type DealSource =
  | "flippa"
  | "empire-flippers"
  | "acquire-com"
  | "trustmrr"
  | "proven-saas"
  | "microns"
  | "indie-hackers";

export interface MarketDeal {
  id: string;
  source: DealSource;
  listingTitle: string;
  category: string;
  oneLiner: string;
  askingPrice: number;
  mrr: number;
  arr: number;
  growthRateMoM: number;
  ageMonths: number;
  multipleX: number;
  teamSize: number;
  techStack: string[];
  defensibility: "low" | "medium" | "high";
  risks: string[];
  startupPath: {
    estimatedBuildMonths: number;
    estimatedBuildUSD: number;
    relatedModelIds: string[];
    relatedBlueprintIds: string[];
    keyMetric: string;
  };
  sourceUrl: string;
  tags: string[];
}

const sourceLabelMap: Record<DealSource, string> = {
  flippa: "Flippa",
  "empire-flippers": "Empire Flippers",
  "acquire-com": "Acquire.com",
  trustmrr: "TrustMRR",
  "proven-saas": "Proven SaaS",
  microns: "Microns.io",
  "indie-hackers": "Indie Hackers",
};

export function dealSourceLabel(s: DealSource): string {
  return sourceLabelMap[s];
}

export const marketDeals: MarketDeal[] = [
  {
    id: "deal-ai-email-triage",
    source: "acquire-com",
    listingTitle: "AI-powered Email Triage for Support Teams",
    category: "B2B SaaS · Customer Support",
    oneLiner:
      "Gmail eklentisi, müşteri desteği ekipleri için otomatik ticket kategorilendirme + yanıt taslağı üretiyor.",
    askingPrice: 180000,
    mrr: 6200,
    arr: 74400,
    growthRateMoM: 12,
    ageMonths: 11,
    multipleX: 2.4,
    teamSize: 1,
    techStack: ["Next.js", "OpenAI API", "Postgres", "Stripe"],
    defensibility: "medium",
    risks: [
      "Kurucu solo — transfer sonrası devamlılık risk",
      "OpenAI API fiyat değişimi marjı etkileyebilir",
      "Gmail policy değişikliği (add-on listing)",
    ],
    startupPath: {
      estimatedBuildMonths: 3,
      estimatedBuildUSD: 25000,
      relatedModelIds: ["bm-ai-native-tool", "bm-vertical-saas"],
      relatedBlueprintIds: ["bp-customer-success", "bp-product"],
      keyMetric: "Destek ticket yanıt süresi düşüşü",
    },
    sourceUrl: "https://acquire.com/listings/ai-email-triage",
    tags: ["ai", "email", "support", "gmail-addon"],
  },
  {
    id: "deal-shopify-review",
    source: "empire-flippers",
    listingTitle: "Shopify Review App · $19K MRR",
    category: "Shopify App · E-commerce",
    oneLiner:
      "Shopify mağazalarına ürün değerlendirme + UGC fotoğraf toplama sistemi. 1,400+ mağaza aktif.",
    askingPrice: 680000,
    mrr: 19000,
    arr: 228000,
    growthRateMoM: 4,
    ageMonths: 38,
    multipleX: 3.0,
    teamSize: 3,
    techStack: ["Remix", "Shopify API", "Redis", "AWS"],
    defensibility: "high",
    risks: [
      "Shopify'ın benzer native feature eklemesi",
      "3 yıl eski — büyüme yavaşlıyor",
      "App store revenue share",
    ],
    startupPath: {
      estimatedBuildMonths: 5,
      estimatedBuildUSD: 60000,
      relatedModelIds: ["bm-platform-plugin"],
      relatedBlueprintIds: ["bp-sales-marketing", "bp-customer-success"],
      keyMetric: "Aktif install + paid conversion",
    },
    sourceUrl: "https://empireflippers.com/listing/shopify-review-app",
    tags: ["shopify", "e-commerce", "reviews", "app-store"],
  },
  {
    id: "deal-creator-analytics",
    source: "microns",
    listingTitle: "Newsletter Analytics · $3.4K MRR · Solo",
    category: "Creator Tools",
    oneLiner:
      "Beehiiv & Substack yazarlarına gelişmiş subscriber analytics: cohort, retention, revenue attribution.",
    askingPrice: 88000,
    mrr: 3400,
    arr: 40800,
    growthRateMoM: 18,
    ageMonths: 8,
    multipleX: 2.15,
    teamSize: 1,
    techStack: ["Next.js", "ClickHouse", "Stripe"],
    defensibility: "medium",
    risks: [
      "Beehiiv / Substack native analytics geliştirirse",
      "Solo founder — kod + destek aynı kişide",
    ],
    startupPath: {
      estimatedBuildMonths: 2,
      estimatedBuildUSD: 15000,
      relatedModelIds: ["bm-platform-plugin", "bm-vertical-saas", "bm-creator-economy"],
      relatedBlueprintIds: ["bp-product", "bp-customer-success"],
      keyMetric: "Paid newsletter creator adoption",
    },
    sourceUrl: "https://microns.io/newsletter-analytics",
    tags: ["creator", "newsletter", "analytics"],
  },
  {
    id: "deal-dental-saas",
    source: "flippa",
    listingTitle: "Vertical SaaS for Dental Clinics · $42K MRR",
    category: "Vertical SaaS · Healthcare",
    oneLiner:
      "Küçük ve orta dental klinikler için randevu + hasta dosyası + sigorta faturalandırma. 340 klinik aktif.",
    askingPrice: 2100000,
    mrr: 42000,
    arr: 504000,
    growthRateMoM: 3,
    ageMonths: 62,
    multipleX: 4.2,
    teamSize: 7,
    techStack: ["Ruby on Rails", "React", "Postgres", "AWS"],
    defensibility: "high",
    risks: [
      "HIPAA compliance — transfer due diligence",
      "Sağlık sektörü satış döngüsü uzun",
      "5 yıl eski stack — modernizasyon yatırımı",
    ],
    startupPath: {
      estimatedBuildMonths: 18,
      estimatedBuildUSD: 400000,
      relatedModelIds: ["bm-vertical-saas"],
      relatedBlueprintIds: [
        "bp-sales-marketing",
        "bp-customer-success",
        "bp-finance",
        "bp-product",
      ],
      keyMetric: "Klinik başına aylık aktif kullanım",
    },
    sourceUrl: "https://flippa.com/dental-saas",
    tags: ["healthcare", "vertical-saas", "enterprise-ready"],
  },
  {
    id: "deal-ai-resume",
    source: "acquire-com",
    listingTitle: "AI Resume Builder · $8K MRR · B2C",
    category: "Consumer SaaS · Career",
    oneLiner:
      "GPT-4 destekli CV oluşturucu. LinkedIn profili + JD girince 90 saniyede tailored CV.",
    askingPrice: 145000,
    mrr: 8000,
    arr: 96000,
    growthRateMoM: 8,
    ageMonths: 15,
    multipleX: 1.5,
    teamSize: 2,
    techStack: ["Next.js", "OpenAI", "Stripe", "PostHog"],
    defensibility: "low",
    risks: [
      "Komoditeleşme riski yüksek (10+ benzer ürün)",
      "LinkedIn ToS değişim riski",
      "Retention düşük (tek kullanımlık niyet)",
    ],
    startupPath: {
      estimatedBuildMonths: 1.5,
      estimatedBuildUSD: 8000,
      relatedModelIds: ["bm-ai-native-tool"],
      relatedBlueprintIds: ["bp-sales-marketing", "bp-product"],
      keyMetric: "Paid conversion rate",
    },
    sourceUrl: "https://acquire.com/listings/ai-resume",
    tags: ["ai", "consumer", "b2c", "low-retention"],
  },
  {
    id: "deal-agency-crm",
    source: "empire-flippers",
    listingTitle: "Lightweight CRM for Marketing Agencies · $14K MRR",
    category: "B2B SaaS · Agency",
    oneLiner:
      "Ajanslar için proje + müşteri + saat takibi. 210 ajans müşteri. 4 yaşında.",
    askingPrice: 540000,
    mrr: 14000,
    arr: 168000,
    growthRateMoM: 2,
    ageMonths: 51,
    multipleX: 3.2,
    teamSize: 4,
    techStack: ["Laravel", "Vue", "MySQL"],
    defensibility: "medium",
    risks: [
      "HubSpot / Monday rekabet",
      "Düşük growth — expansion motoru kurulmalı",
      "Legacy stack — migration maliyeti",
    ],
    startupPath: {
      estimatedBuildMonths: 6,
      estimatedBuildUSD: 80000,
      relatedModelIds: ["bm-vertical-saas"],
      relatedBlueprintIds: ["bp-sales-marketing", "bp-customer-success"],
      keyMetric: "NRR + seat expansion",
    },
    sourceUrl: "https://empireflippers.com/listing/agency-crm",
    tags: ["b2b", "agencies", "project-management"],
  },
  {
    id: "deal-local-marketplace",
    source: "flippa",
    listingTitle: "Pet Sitting Marketplace · Single City · $22K GMV/mo",
    category: "Marketplace · Local Services",
    oneLiner:
      "Tek şehir pet sitting/walking marketplace'i. 850 aktif sitter · 2,400 owner.",
    askingPrice: 120000,
    mrr: 4500,
    arr: 54000,
    growthRateMoM: 6,
    ageMonths: 22,
    multipleX: 2.2,
    teamSize: 2,
    techStack: ["Next.js", "Stripe Connect", "Postgres"],
    defensibility: "medium",
    risks: [
      "Rover gibi ulusal rakibin şehre girişi",
      "Take rate sınırlı (%8)",
      "Supply-demand balance hassas",
    ],
    startupPath: {
      estimatedBuildMonths: 4,
      estimatedBuildUSD: 35000,
      relatedModelIds: ["bm-marketplace"],
      relatedBlueprintIds: ["bp-sales-marketing", "bp-customer-success"],
      keyMetric: "GMV × take rate",
    },
    sourceUrl: "https://flippa.com/pet-marketplace",
    tags: ["marketplace", "local", "services", "pet"],
  },
  {
    id: "deal-dtc-skincare",
    source: "empire-flippers",
    listingTitle: "DTC Skincare Brand · $55K Net/mo",
    category: "E-commerce · DTC",
    oneLiner:
      "Clean beauty niche, Shopify + Instagram. 45K Instagram follower, AOV $62.",
    askingPrice: 1800000,
    mrr: 55000,
    arr: 660000,
    growthRateMoM: 5,
    ageMonths: 36,
    multipleX: 2.7,
    teamSize: 5,
    techStack: ["Shopify Plus", "Klaviyo", "Meta Ads"],
    defensibility: "medium",
    risks: [
      "Meta ad cost enflasyonu",
      "Stok yönetim disiplini kritik",
      "Marka bağımsız olmadan bağlı kaldı",
    ],
    startupPath: {
      estimatedBuildMonths: 9,
      estimatedBuildUSD: 150000,
      relatedModelIds: ["bm-dtc", "bm-subscription-commerce"],
      relatedBlueprintIds: ["bp-sales-marketing", "bp-finance"],
      keyMetric: "Contribution margin × order volume",
    },
    sourceUrl: "https://empireflippers.com/dtc-skincare",
    tags: ["dtc", "skincare", "beauty", "shopify"],
  },
  {
    id: "deal-ai-scheduling",
    source: "trustmrr",
    listingTitle: "AI Meeting Scheduler · $11K MRR",
    category: "Productivity · AI",
    oneLiner:
      "Email thread'den otomatik toplantı ayarlayan AI. Gmail + Google Calendar + Zoom.",
    askingPrice: 230000,
    mrr: 11000,
    arr: 132000,
    growthRateMoM: 22,
    ageMonths: 9,
    multipleX: 1.75,
    teamSize: 2,
    techStack: ["Next.js", "Claude API", "Google OAuth"],
    defensibility: "medium",
    risks: [
      "Google native feature geliştirirse",
      "API maliyeti growth'la orantılı",
      "Calendly brand gücü",
    ],
    startupPath: {
      estimatedBuildMonths: 2,
      estimatedBuildUSD: 18000,
      relatedModelIds: ["bm-ai-native-tool", "bm-platform-plugin"],
      relatedBlueprintIds: ["bp-product", "bp-customer-success"],
      keyMetric: "Meeting scheduled per user / week",
    },
    sourceUrl: "https://trustmrr.com/ai-scheduler",
    tags: ["ai", "productivity", "calendar"],
  },
];

// ----------------------------------------------------------------------------
// Hunter Agent — continuous opportunity scanner.
//
// This is conceptually an agent (later a department). It watches social + web
// + marketplaces, filters for >= 80% digital-revenue-share businesses, and
// turns each finding into a custom "project card" with a resource profile.
// ----------------------------------------------------------------------------

export const hunterSignals: HunterSignal[] = [
  {
    id: "hs-ai-notion-templates",
    capturedAt: "2026-04-23T07:42:00Z",
    source: "twitter",
    title: "Notion template marketplace'i AI-destekli kişiselleştirme bekliyor",
    summary:
      "Her hafta binlerce kişi 'AI destekli kişisel CRM Notion template' arıyor. Mevcut templates static; AI destekli versiyonları komoditeleşmemiş.",
    digitalShare: 100,
    category: "Notion ecosystem · creator tools",
    signalStrength: "emerging",
    relatedModelIds: ["bm-platform-plugin", "bm-creator-economy"],
    estimatedResourceProfile: {
      capital: { level: "none", minUsd: 0, maxUsd: 200, note: "Gumroad + domain" },
      time: { hoursPerWeek: { min: 8, max: 15 }, weeksToMvp: { min: 2, max: 4 } },
      physicalPresence: "none",
      humanSkills: ["Notion uzmanlığı", "Temel pazarlama"],
      tools: ["Notion", "Gumroad", "Twitter", "ChatGPT"],
      digitalTasks: ["Template tasarımı", "AI prompt kataloğu", "Gumroad listing", "Twitter thread marketing"],
    },
    verdict: "worth-exploring",
  },
  {
    id: "hs-etsy-wedding-digital",
    capturedAt: "2026-04-23T06:15:00Z",
    source: "etsy-trending",
    title: "Etsy'de 'dijital düğün davetiye' nişi hızlı yükselişte",
    summary:
      "Son 30 günde Etsy'de 'editable wedding invite' aramaları %47 artmış. Rekabet var ama Canva ile giriş bariyeri düşük.",
    digitalShare: 95,
    category: "Etsy digital products · weddings",
    signalStrength: "strong",
    relatedModelIds: ["bm-affiliate", "bm-print-on-demand"],
    estimatedResourceProfile: {
      capital: { level: "low", minUsd: 100, maxUsd: 500, note: "Canva Pro + Etsy açılış + ilk ads" },
      time: { hoursPerWeek: { min: 6, max: 15 }, weeksToMvp: { min: 2, max: 3 } },
      physicalPresence: "none",
      humanSkills: ["Canva/Figma", "Trend okuma"],
      tools: ["Canva Pro", "Etsy", "Pinterest"],
      digitalTasks: ["Davetiye tasarım şablonu", "Etsy listing SEO", "Pinterest pin", "Mood board"],
    },
    verdict: "worth-exploring",
  },
  {
    id: "hs-shopify-dog-supplement",
    capturedAt: "2026-04-23T05:00:00Z",
    source: "amazon-movers",
    title: "Amazon movers: köpek eklem takviyesi kategorisi %230 büyüdü",
    summary:
      "Amazon'un 'movers & shakers' kategorisinde köpek mafsal takviyesi haftalık %230 sıçradı. Private label için zaman penceresi açık.",
    digitalShare: 82,
    category: "Pet supplements · private label",
    signalStrength: "strong",
    relatedModelIds: ["bm-amazon-fba", "bm-shopify-brand"],
    estimatedResourceProfile: {
      capital: { level: "high", minUsd: 8000, maxUsd: 25000, note: "İlk 500 unit stok + nakliye + listing" },
      time: { hoursPerWeek: { min: 15, max: 30 }, weeksToMvp: { min: 10, max: 14 } },
      physicalPresence: "occasional",
      humanSkills: ["Tedarikçi müzakere", "Ürün ruhsatlandırma (FDA/EU)", "Amazon SEO"],
      tools: ["Alibaba", "Helium 10", "Seller Central", "QuickBooks"],
      digitalTasks: ["Listing + görsel + PPC", "Review programı", "Brand registry"],
      physicalTasks: [
        "Tedarikçi numunesi değerlendirme (FDA güvenliği)",
        "Paketleme tasarımı + kalite",
        "FBA inbound lojistik",
      ],
    },
    verdict: "needs-more-signal",
  },
  {
    id: "hs-producthunt-ai-meeting",
    capturedAt: "2026-04-23T04:20:00Z",
    source: "producthunt",
    title: "ProductHunt: AI toplantı notu araçları şişirildi, sıra 'post-meeting action'da",
    summary:
      "Son 4 launch hepsi sadece transkript + özet. Toplantı sonrası otomatik CRM güncelleme + Slack follow-up yazma nişi açık.",
    digitalShare: 100,
    category: "AI productivity · sales tools",
    signalStrength: "emerging",
    relatedModelIds: ["bm-ai-native-tool", "bm-vertical-saas"],
    estimatedResourceProfile: {
      capital: { level: "medium", minUsd: 3000, maxUsd: 15000, note: "Inference API + domain + ilk ads" },
      time: { hoursPerWeek: { min: 25, max: 45 }, weeksToMvp: { min: 6, max: 10 } },
      physicalPresence: "none",
      humanSkills: ["Backend mühendisliği", "B2B satış", "Claude/OpenAI prompt"],
      tools: ["Claude API", "Vercel", "Supabase", "HubSpot API"],
      digitalTasks: [
        "Core workflow engine",
        "Gong/Fireflies integration",
        "CRM sync layer",
        "PLG landing",
      ],
    },
    verdict: "worth-exploring",
  },
  {
    id: "hs-tiktok-creator-store",
    capturedAt: "2026-04-22T22:10:00Z",
    source: "youtube",
    title: "TikTok Creator Store servisleri yeni bir niş açıyor",
    summary:
      "TikTok Shop'ta creator'lar için 'store kurulum + ürün seçimi' hizmeti talep patladı. Tek kişi, agency modeliyle haftada 2-3 creator açabilir.",
    digitalShare: 90,
    category: "Creator services · TikTok Shop",
    signalStrength: "emerging",
    relatedModelIds: ["bm-boutique-consulting", "bm-shopify-brand"],
    estimatedResourceProfile: {
      capital: { level: "low", minUsd: 200, maxUsd: 1500, note: "Portfolio + CRM aracı" },
      time: { hoursPerWeek: { min: 12, max: 25 }, weeksToMvp: { min: 3, max: 5 } },
      physicalPresence: "none",
      humanSkills: ["TikTok platform bilgisi", "Basit tedarik matching", "Creator iletişimi"],
      tools: ["TikTok Shop", "Pipedrive", "Canva"],
      digitalTasks: [
        "Creator keşif + outreach",
        "Store setup + ürün listing",
        "Ads hesap kurulum",
        "Haftalık rapor dashboard",
      ],
    },
    verdict: "worth-exploring",
  },
  {
    id: "hs-reddit-indie-forum",
    capturedAt: "2026-04-22T19:30:00Z",
    source: "reddit",
    title: "r/entrepreneur 'haftalık revenue report' postları düşüyor",
    summary:
      "Indie founder'lar artık 'kamera açık' rapor vermek istemiyor. Anonim kalıp kendi aralarında revenue paylaşacağı platform ihtiyacı açık.",
    digitalShare: 100,
    category: "Community platform · indie makers",
    signalStrength: "weak",
    relatedModelIds: ["bm-creator-economy", "bm-ai-native-tool"],
    estimatedResourceProfile: {
      capital: { level: "low", minUsd: 500, maxUsd: 3000, note: "Supabase + domain + launch bütçesi" },
      time: { hoursPerWeek: { min: 20, max: 40 }, weeksToMvp: { min: 4, max: 8 } },
      physicalPresence: "none",
      humanSkills: ["Full-stack", "Topluluk modere", "Trust design"],
      tools: ["Next.js", "Supabase", "Stripe"],
      digitalTasks: ["Auth + revenue KPI", "Anonim paylaşım tasarımı", "Trust/verify akışı"],
    },
    verdict: "needs-more-signal",
  },
];

export const revenuePlaybooks: RevenuePlaybook[] = [
  {
    id: "rp-mrr-expansion",
    name: "MRR Expansion Motor",
    pattern: "subscription",
    description:
      "Yeni müşteri edinmek yerine mevcut hesapların kullanımını artırarak büyümek. $1 'expansion' → $3 'new logo' değerinde.",
    accent: "ion",
    northStar: "Net Revenue Retention %",
    formula: "NRR = (Başlangıç MRR + Expansion − Churn − Downsell) / Başlangıç MRR",
    testPlan: [
      "Mevcut 10 müşterinin kullanım paternini incele → kim tavan yakın?",
      "Seat/usage expansion triggerlarını tanımla (milestone, integration, team size)",
      "6 haftada 3 expansion'ı test et — dönüşüm oranı + hızı ölç",
    ],
    gotchas: [
      "Expansion çoğunlukla self-serve değil; CS ekibi gerektirir",
      "Müşteri sağlığı zayıfken expansion teklif etmek churn hızlandırır",
    ],
    bestFor: "Vertical SaaS, AI-native tools, platform plugin",
  },
  {
    id: "rp-usage-based",
    name: "Usage-Based Pricing",
    pattern: "usage",
    description:
      "Faturalama kullanıma göre (API call, token, depo alanı, işlem sayısı). Adoption engelini düşürür ama gelir tahmini zorlaşır.",
    accent: "quantum",
    northStar: "Consumption revenue / customer",
    formula: "Gelir = ΣKullanım × Birim fiyat (dönem)",
    testPlan: [
      "1 ay ücretsiz + kullanım trackle → en ağır 10 kullanıcının ödemeye yakınlık testini yap",
      "Fiyat değişim deneyi: $0.01 vs $0.02 birim → kullanım elastikiyeti ölç",
      "Commitment tier'ları test et (yıllık minimum alım vs pay-as-you-go)",
    ],
    gotchas: [
      "Müşteri 'bill shock' yaşarsa churn",
      "Gelir tahmini zorlaşır, finansman planlaması güçleşir",
    ],
    bestFor: "AI tools, API products, infra",
  },
  {
    id: "rp-take-rate",
    name: "Take Rate Optimization",
    pattern: "take-rate",
    description:
      "Marketplace'te her işlemden komisyon al. Take rate %3 mü %15 mi — kategori + alternatif + ağ etkisi dengesine bağlı.",
    accent: "nebula",
    northStar: "GMV × Take rate",
    formula: "Gelir = GMV × Take Rate",
    testPlan: [
      "Kategori içinde rakip komisyon oranlarını kaz",
      "2 segmentte A/B test: düşük take rate + volume vs yüksek take rate + az seller",
      "Seller elastikiyeti: %1 artış → kaç seller kaybı?",
    ],
    gotchas: [
      "Take rate çok yüksek olursa disintermediation",
      "Düşük olursa unit ekonomisi kapanmaz",
    ],
    bestFor: "Two-sided marketplaces",
  },
  {
    id: "rp-content-sponsorship",
    name: "Content Sponsorship Ladder",
    pattern: "ads",
    description:
      "Audience gerçek sayıya ulaştıkça sponsor slot fiyatları üstel artar. Diversified (newsletter + podcast + video) olursa baz gelir daha istikrarlı.",
    accent: "solar",
    northStar: "Weekly sponsor slot yield",
    formula: "Gelir = Dolduran slot × CPM × Audience",
    testPlan: [
      "Audience 5K'yı geçince ilk sponsor testini başlat (bedava ya da düşük fiyat)",
      "Her 10K büyümede slot fiyatını %30 artır",
      "3 kategori × 2 format (preroll/midroll) test",
    ],
    gotchas: [
      "Sponsor dolguya bağımlılık → diversify: ürün, üyelik",
      "Marka uyumsuzluğu audience kaybına yol açar",
    ],
    bestFor: "Creator/Content",
  },
  {
    id: "rp-freemium",
    name: "Freemium → Self-Serve PLG",
    pattern: "subscription",
    description:
      "Cömert bedava tier → kullanıcı değer yaşar → paid tier'a kendi kendine yükselir. Satış ekibi gerektirmeyen büyüme.",
    accent: "ion",
    northStar: "Free → Paid conversion %",
    formula: "Conversion = Paid dönenler / Aktif free kullanıcılar",
    testPlan: [
      "Conversion trigger'larını tanımla (limit, feature wall, collaboration)",
      "3 tier yapılandırma testi: free/pro/team vs free/team",
      "Activation milestone'u değiştir: ilk değer 5 dk vs 30 dk",
    ],
    gotchas: [
      "Cömert tier viral ama sürdürülebilir değilse inference/hosting maliyeti yiyebilir",
      "Conversion düşük olursa pazarlama CAC karşılayamaz",
    ],
    bestFor: "AI-native tools, vertical SaaS, platform plugin",
  },
];
