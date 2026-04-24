/**
 * The Codex — canonical knowledge compendium for every Matrix module.
 *
 * Her module için: ne · niçin · nasıl · tipik kullanım senaryoları.
 * User Guide olarak /codex route'unda render edilir ve her kartın
 * "açmak için" linki ilgili modüle götürür.
 */

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  ClipboardList,
  Compass,
  Database,
  LayoutGrid,
  Library as LibraryIcon,
  Network,
  Plug,
  Rocket,
  ScrollText,
  Sparkles,
  Wallet,
  Waypoints,
} from "lucide-react";

export type CodexAccent = "ion" | "nebula" | "quantum" | "solar" | "crimson";

export interface CodexEntry {
  /** route or virtual key (oracle: "modal") */
  slug: string;
  href?: string; // route to navigate; null for non-routable (oracle modal)
  matrixName: string; // "The Construct"
  subLabel: string; // "Command Deck"
  icon: LucideIcon;
  accent: CodexAccent;
  /** Matrix universe pointer — canon karakter veya kavram */
  matrixReference: string;
  /** Plain-Turkish tek-cümle özet */
  oneLiner: string;
  /** Ne? — 2-3 cümle, doğrudan ne olduğu */
  what: string;
  /** Niçin var? — problem tanımı */
  why: string;
  /** Nasıl kullanılır? — adım adım tipik akış */
  howToUse: string[];
  /** 2-3 tipik kullanım senaryosu */
  useCases: string[];
  /** Crossover — başka hangi modülle çalışır */
  relatesTo: string[];
  group: "bootstrap" | "organize" | "connect" | "operate" | "analyze";
}

export const CODEX: CodexEntry[] = [
  // ─── BOOTSTRAP ───────────────────────────────────────────────────────────
  {
    slug: "keymaker",
    href: "/blueprints",
    matrixName: "The Keymaker",
    subLabel: "Blueprints · Ideas",
    icon: Rocket,
    accent: "solar",
    matrixReference:
      "The Keymaker, Matrix Reloaded'da her kapının anahtarını üreten exile program. Burada her asset'in kurulum anahtarları.",
    oneLiner:
      "Fikirden (Ideas tab) kuruluma (Blueprints tab) giden iki katlı atölye.",
    what:
      "Hazır domain paketleri: her Blueprint bir departman kurar — departmanlar + ajanlar + skill'ler + workflow'lar + OKR'ler. Ideas tab iş modelleri, pazar fırsatları ve gelir playbook'ları ile ilham verir.",
    why:
      "Yeni bir asset eklerken sıfırdan şema çizmek 2-3 gün alır. Blueprint tek tıkla 12 dakikada canonical bir departman kurar. Ideas tab doğru Blueprint'i seçmene yardım eder.",
    howToUse: [
      "Workspace switcher'dan yeni bir asset ekle (örn. Juris SaaS)",
      "Ideas tab'ında pazara uygun iş fikri örüntüsünü gör",
      "Blueprints tab'ında Customer Success / Sales & Marketing / Product gibi hazır paketi seç",
      "Install drawer'ı açılınca ne kurulacağını gör, onayla",
      "The Archive'da yeni skill/agent/workflow'lar belirir",
    ],
    useCases: [
      "Juris SaaS'ına 12 dk'da Sales & Marketing departmanı kur",
      "Newsletter brand'ine Content Operations departmanı kur",
      "E-commerce asset'i için Customer Support blueprint'i kur",
    ],
    relatesTo: ["The Architect", "The Archive", "Oracle"],
    group: "bootstrap",
  },

  // ─── ORGANIZE ────────────────────────────────────────────────────────────
  {
    slug: "construct",
    href: "/",
    matrixName: "The Construct",
    subLabel: "Command Deck",
    icon: LayoutGrid,
    accent: "ion",
    matrixReference:
      "The Construct, Morpheus'un gerçeklikten önce Neo'ya 'aslında hiçbir şey gerçek değil' dediği whiteboard boşluğu. Burada her şey başlar.",
    oneLiner:
      "Matrix'in giriş salonu — günün nabzı, portföy rollup, Oracle özet.",
    what:
      "Home dashboard. KPI kartları (leverage saati, canlı ajanlar, aktif workflow, Oracle öneri), Organization Constellation, Goal Orbits, Activity Feed, Portfolio Rollup (tüm asset'ler tek tabloda).",
    why:
      "Bir bakışta 'bugün her şey nasıl?' cevabı. Hangi workspace'de aktif olursan ol, tüm portföyünün sağlığını görüp nereye müdahale etmen gerektiğini öğrenirsin.",
    howToUse: [
      "Sabah ilk buraya gel — Morpheus selam verir",
      "Portfolio Rollup'ta en düşük ROI'li asset'i gör",
      "Oracle önerileri listesinde yüksek öncelikleri incele",
      "Haftalık review üret butonuyla 7 gün özetini al",
    ],
    useCases: [
      "Günün başında portföy nabzı",
      "Hafta sonunda rollup sunumu",
      "Herhangi bir an 'Matrix şu an nasıl?' cevabı",
    ],
    relatesTo: ["Oracle", "Portfolio Rollup", "The Truth"],
    group: "organize",
  },
  {
    slug: "prime-program",
    href: "/vision",
    matrixName: "The Prime Program",
    subLabel: "Vision & Strategy",
    icon: Compass,
    accent: "nebula",
    matrixReference:
      "Matrix'in Prime Program'ı sistemin orijinal kodudur. Her workspace'in DNA'sı — mission/vision/temalar burada.",
    oneLiner:
      "Her asset'in stratejik DNA'sı — mission, vision, 3-5 stratejik tema, değer çıpaları.",
    what:
      "Workspace-bazında mission statement, vision statement, ağırlıklandırılmış stratejik temalar ve non-negotiable değer çıpaları. Oracle her gece bu DNA'ya göre organizasyonu denetler.",
    why:
      "Ajan + skill + workflow + OKR kararları bir stratejik çerçeveye bağlı olmalı. Oracle 'bu yeni skill şirket DNA'sıyla uyumlu mu?' sorusunu buradan yanıtlar.",
    howToUse: [
      "Her yeni asset için mission + vision yaz",
      "3-5 stratejik tema tanımla (her biri 0-100 ağırlıklı)",
      "Non-negotiable değer çıpalarını (örn. 'insan son onay verir') koy",
      "DNA'yı kaydet — Oracle bir sonraki taramada bu DNA'yı baz alır",
    ],
    useCases: [
      "Yeni asset eklendikten hemen sonra DNA kurulumu",
      "Quarterly strateji revizyonunda tema ağırlıkları güncelleme",
      "Oracle'ın 'tema hiçbir skill'de karşılık bulmuyor' önerisini çözme",
    ],
    relatesTo: ["Oracle", "The Prophecy (Captain's Log)"],
    group: "organize",
  },
  {
    slug: "architect",
    href: "/org",
    matrixName: "The Architect",
    subLabel: "Org Studio",
    icon: Network,
    accent: "ion",
    matrixReference:
      "The Architect Matrix'i tasarlayan programdır. Burası senin organizasyonun mimarı — React Flow ile görsel şema.",
    oneLiner:
      "Workspace'in organizasyon şeması — departman, ajan, skill, workflow düğümleri arası ilişkiler.",
    what:
      "React Flow canvas. Soldaki palette'ten departman/ajan/skill/workflow sürükle, canvas'a bırak. Düğümler arası bağlantıları çiz. Inspector'da her düğümün detayı açılır.",
    why:
      "Liste görünümü (The Archive) 'ne var?' der. The Architect 'nasıl bağlı?' der. Agent'ın hangi skill'leri kullandığı, skill'in hangi workflow'da koştuğu görsel olarak netleşir.",
    howToUse: [
      "Palette'ten yeni departman sürükle",
      "Departman'a tıkla, Inspector'da ajan ekle",
      "Ajana skill bağla (Archive'dan drag)",
      "Oracle'dan yapı öner butonu ile boşlukları gör",
      "Şemayı export et (JSON)",
    ],
    useCases: [
      "Yeni workspace için ilk org şemasını çizme",
      "Blueprint sonrası 'neyim var şimdi?' görünümü",
      "Partner'a org şemasını gösterme",
    ],
    relatesTo: ["The Keymaker", "The Archive", "Oracle"],
    group: "organize",
  },
  {
    slug: "archive",
    href: "/library",
    matrixName: "The Archive",
    subLabel: "Library",
    icon: LibraryIcon,
    accent: "nebula",
    matrixReference:
      "Zion'un arşivi — tüm bilgi ve parçaların toplandığı yer. Matrix'in skills + agents + workflows kataloğu.",
    oneLiner:
      "Tüm yeniden kullanılabilir Matrix parçalarının tek kat kataloğu — Skills · Agents · Workflows.",
    what:
      "Workspace'in tüm skill, agent ve workflow'larının liste görünümü. Her item canonical bir dosya (SKILL.md, AGENT.md, workflow.yaml) ve origin (seed / oracle / catalog / manual / import) taşır.",
    why:
      "Architect (canvas) görsel. Archive (liste) aranabilir. Arama + filtre + edit için Archive tercih edilir. Oracle boşluk önerileri de buradan tetiklenir.",
    howToUse: [
      "Sekmelerle türü seç (Skill / Agent / Workflow)",
      "Ara veya tag'lere göre filtrele",
      "Yeni item yarat (manuel veya Oracle Forge)",
      "Her item'ı aç, canonical dosya içeriğini gör/düzenle",
    ],
    useCases: [
      "Yeni bir skill kurmadan önce 'bu zaten var mı?' kontrolü",
      "Origin'ine göre filtreleme (örn. sadece oracle-generated olanları gör)",
      "Oracle boşluk önerisi ile yeni skill forge",
    ],
    relatesTo: ["The Architect", "Oracle", "The Loading Program"],
    group: "organize",
  },
  {
    slug: "loading-program",
    href: "/workflows",
    matrixName: "The Loading Program",
    subLabel: "Workflow Canvas",
    icon: Waypoints,
    accent: "quantum",
    matrixReference:
      "Loading Program, Nebuchadnezzar'ın Matrix'e entry öncesi crew'u hazırladığı simülasyon. Burada workflow'lar 'yüklenir' — canvas üstünde.",
    oneLiner:
      "React Flow ile workflow (otomasyon zinciri) tasarımı — trigger + adımlar + approval + notify.",
    what:
      "Workflow editor. Trigger (schedule/webhook/manual) + adımlar (skill/integration/approval/notify/condition) + step-level model pinning + approval gate'ler. The Source'tan model picker inline.",
    why:
      "Bir workflow tasarlamak kod yazmak olmamalı. Görsel, auditable, version-controllable.",
    howToUse: [
      "Sol listeden bir workflow seç veya yeni yarat",
      "Trigger seç (haftalık cron gibi)",
      "Adımları sırayla ekle — her biri bir skill veya integration",
      "External-send kapsamında olanlara approval gate koy",
      "Dry-run yap, golden test koş, kaydet",
    ],
    useCases: [
      "Haftalık L10 meeting cron'u",
      "Günlük Oracle scan workflow'u",
      "Content-writer → editor → Beehiiv publish zinciri",
    ],
    relatesTo: ["The Archive", "The Source", "Nebuchadnezzar"],
    group: "organize",
  },

  // ─── CONNECT ─────────────────────────────────────────────────────────────
  {
    slug: "trainstation",
    href: "/connectors",
    matrixName: "TrainStation",
    subLabel: "Connector Hub",
    icon: Plug,
    accent: "ion",
    matrixReference:
      "The Trainman Matrix ile Machine World arasındaki transit noktayı yönetir. TrainStation dış entegrasyonların limanı.",
    oneLiner:
      "Matrix'in dış dünyaya açılan 62 connector'ı — AI API, Engine (inference), Free Program, CRM, messaging, commerce, fiziksel köprüler.",
    what:
      "Tüm dış entegrasyonların kataloğu + Scout (yeni connector keşfi) paneli. Her connector: status, usage, rate-limit, pricing, dependency (hangi skill/workflow kullanıyor).",
    why:
      "Skill'ler çıplak değil — gerçek dünyada bir şey yapmak için HubSpot/Stripe/Notion/Claude gibi platformlara bağlanır. TrainStation bu bağlantıların merkez kontrolü.",
    howToUse: [
      "Scout panelinde 'ihtiyacım olan şey' yaz, öneri al",
      "Filter tab'larından kategori gez",
      "Bir connector'a tıkla, drawer'da model listesi + skill dependency gör",
      "Bağlantıyı kur (API key env'e ekle) veya test çağrısı yap",
    ],
    useCases: [
      "Juris workspace'i için Stripe + HubSpot bağlantısı",
      "G2 sinyalinden yeni CRM keşfi",
      "Rate-limit alan HubSpot'u paid tier'a upgrade",
    ],
    relatesTo: ["The Source", "The Tribute", "Scout"],
    group: "connect",
  },
  {
    slug: "source",
    href: "/models",
    matrixName: "The Source",
    subLabel: "Model Library",
    icon: Database,
    accent: "nebula",
    matrixReference:
      "The Source, Matrix'in tüm kodunun geldiği yer — Neo'nun ulaştığı merkez. Burası her yapay zihnin kütüphanesi.",
    oneLiner:
      "HuggingFace paradigmasında LLM + vision + audio model kataloğu — 19 model, 7 facet filter.",
    what:
      "Her model için: parameters · license · libraries · task types · precision · architecture · carbon footprint · hangi Engine üstünde serve edilebilir. Workflow step'inden inline picker ile pinlenebilir.",
    why:
      "Claude Opus 4.6 her iş için fazla. Bazen Llama 3.3 70B üstünde Groq yeterli. Cost optimization + task fit için doğru modeli seçmek lazım.",
    howToUse: [
      "Sol filter panelden task'a göre filtrele (text-gen / ASR / vision-qa)",
      "Engine-available toggle ile sadece serve edilebilirler",
      "Bir modele tıkla, drawer'da tam metadata gör",
      "Workflow step'inden 'model seç' butonuyla pinle",
    ],
    useCases: [
      "Pahalı bir workflow için ucuz alternatif model",
      "Ses transkripsiyon için Whisper v3 seçme",
      "Production için Claude Sonnet pin'i",
    ],
    relatesTo: ["TrainStation", "The Loading Program", "The Tribute"],
    group: "connect",
  },
  {
    slug: "tribute",
    href: "/spend",
    matrixName: "The Tribute",
    subLabel: "Spend & Budget",
    icon: Wallet,
    accent: "solar",
    matrixReference:
      "The Tribute — her Matrix kullanımının bedeli. Token, API call, platform fee. Kaldıraç ölçülmeli.",
    oneLiner:
      "30-gün harcama + gelir attribution + ROI tablosu — workspace bazında ve portfolio rollup.",
    what:
      "Cost entry log (her agent/skill/workflow'un her çağrısının USD karşılığı), budget limits + alert'ler, gelir attribution (Stripe / manuel), ROI hesabı (revenue / spend).",
    why:
      "Matrix hiç kimseye 'şu ajan ayda $X' demese, Oracle routing'i yapamaz. Her call'un maliyeti The Tribute'a düşer, The Truth retrospektifte bunu analiz eder.",
    howToUse: [
      "Top stats: 30g gelir / 30g harcama / ROI",
      "Sparkline ile trend gör",
      "Tablo görünümünde hangi connector en pahalı",
      "Bütçe limiti ekle (örn. Juris workspace ayda max $500)",
    ],
    useCases: [
      "Aylık portföy ROI özeti",
      "Hangi skill'in maliyeti kontrol dışı",
      "Model routing kararı (Opus → Haiku)",
    ],
    relatesTo: ["The Source", "TrainStation", "The Truth"],
    group: "connect",
  },

  // ─── OPERATE ─────────────────────────────────────────────────────────────
  {
    slug: "captains-log",
    href: "/traction",
    matrixName: "Captain's Log",
    subLabel: "Traction · Goals · EOS",
    icon: ScrollText,
    accent: "nebula",
    matrixReference:
      "Morpheus, Nebuchadnezzar'ın kaptanıdır. Kaptanın defterinde crew'un haftalık disiplini — Gino Wickman'ın EOS'u.",
    oneLiner:
      "EOS/Traction operating cadence + Goals (The Prophecy) — 6 tab.",
    what:
      "90-Day Rocks (çeyreklik taahhütler), Weekly Scorecard (13-hafta rolling), Issues List (IDS: Identify/Discuss/Solve), Accountability Chart (rol→sorumluluk), Level 10 Meeting agenda template, Goals · The Prophecy (OKR'ler).",
    why:
      "Bir şirket 'istikrarlı ritim' olmadan büyümez. EOS 500K+ şirketin kullandığı framework. Matrix bunu yerel disiplin olarak entegre etti.",
    howToUse: [
      "Her çeyrek 3-7 Rock tanımla (bitirme taahhüdü, öncelik değil)",
      "Her Pazartesi L10 meeting (90 dk, canonical agenda)",
      "Haftalık Scorecard doldur, off-track metrikler otomatik Issue olur",
      "Accountability Chart'ta her rol bir sahibi var mı?",
      "Goals tab'ında yıllık OKR'leri rock'lara bağla",
    ],
    useCases: [
      "Partner(lar)la haftalık sync için L10 workflow'u",
      "Quarterly rock review ritüeli",
      "Off-track scorecard metriğinden Issue yaratma",
    ],
    relatesTo: ["The Prime Program", "Oracle", "The Truth"],
    group: "operate",
  },
  {
    slug: "operator",
    href: "/operator",
    matrixName: "The Operator",
    subLabel: "Task Board",
    icon: ClipboardList,
    accent: "ion",
    matrixReference:
      "Tank, Dozer, Link — Nebuchadnezzar'ın Operator'ları. Crew'un Matrix içi (dijital) ve gemi içi (fiziksel) görevlerini koordine eder.",
    oneLiner:
      "Dijital + fiziksel tüm görevlerin tek ekrandan yönetildiği kanban board + iki yönlü dış entegrasyon.",
    what:
      "Kanban: todo → doing → review → done → blocked. Her task: realm (digital/physical), priority (p0-p3), owner (agent/human), external source (Linear/Notion/Asana/Trello/Jira/GitHub). Pull sync + push sync.",
    why:
      "Aynı anda 5+ asset yönetirken task'lar kaybolmasın. Bir kısmı agent'lar otomatik yapar, bir kısmı insan. Hepsi tek yerde.",
    howToUse: [
      "Realm filtresi (digital/physical) ile odaklan",
      "Owner filtresi (agent/human) — hangi task'lar senin elinde",
      "Dış sistemden Pull sync → Linear/Notion'daki task'lar Matrix'e gelir",
      "Matrix'te yaratılan task'ı Push sync ile dış sisteme yolla",
    ],
    useCases: [
      "Haftalık Monday task review",
      "Overdue task'ları yakala",
      "Approval-pending external-send'leri tek yerden gör",
    ],
    relatesTo: ["Captain's Log", "Nebuchadnezzar", "The Loading Program"],
    group: "operate",
  },
  {
    slug: "nebuchadnezzar",
    href: "/control",
    matrixName: "Nebuchadnezzar",
    subLabel: "Control Room",
    icon: Activity,
    accent: "solar",
    matrixReference:
      "Nebuchadnezzar Morpheus'un hovercraft gemisi. Matrix'in canlı kontrol odası — burada crew gerçek zamanlı müdahale eder.",
    oneLiner:
      "Canlı operasyon paneli — agent durumu, approval kuyruğu, audit log, kill switch.",
    what:
      "Real-time agent status (live/paused), pending approvals kuyruğu (external-send her zaman buradan geçer), audit log (her event), system pulse (MCP server'lar), kill switch (hepsini bir tık durdur).",
    why:
      "Bir ajan deli saçması outbound email yazmaya başladığında 5 saniyede durdurabilmek. Audit log'un olmadığı sistem prod-grade değil.",
    howToUse: [
      "Approval queue'daki external-send'leri Seraph gibi onayla/reddet",
      "Audit log'dan trace ID ile bir call'u geri at",
      "Agent hata patterninde Issue'a düşür",
      "Acil durumda kill switch → tüm ajanlar abort",
    ],
    useCases: [
      "Günlük morning 5-dk operation check",
      "Bir ajan test yaparken kill switch disiplini",
      "Incident post-mortem için audit log araması",
    ],
    relatesTo: ["The Operator", "Captain's Log (Issues)", "The Tribute"],
    group: "operate",
  },

  // ─── ANALYZE ─────────────────────────────────────────────────────────────
  {
    slug: "truth",
    href: "/insights",
    matrixName: "The Truth",
    subLabel: "Insights",
    icon: BarChart3,
    accent: "ion",
    matrixReference:
      "Morpheus: 'I can only show you the door — you're the one that has to walk through it.' Matrix sana gerçeği gösterir, karar senin.",
    oneLiner:
      "Haftalık kaldıraç skorcard — ajan/skill performansı, departman sağlığı, Oracle kabul oranı.",
    what:
      "Leverage ratio (delegasyon saati / yönetim saati — 5x+ hedef), agent-level performance tablo, departman sağlık grid, weekly retrospective card (ne çalıştı / ne çalışmadı / yeni öneri).",
    why:
      "Oracle öneriyor, Captain's Log ritim veriyor, Tribute $ söylüyor. The Truth bütün bunları 'bu hafta Matrix bana gerçekten ne kazandırdı?' sorusuna çevirir.",
    howToUse: [
      "Hafta sonu 5 dk The Truth'ta",
      "Leverage ratio düşüyorsa hangi ajanın blok olduğunu bul",
      "Weekly Retro'da kabul oranı/rejection pattern gör",
      "Departman grid'inde kırmızı olanı tespit et, Issue'a düşür",
    ],
    useCases: [
      "Cumartesi haftalık review sabah kahvesi",
      "Partner'a haftalık rollup gönderme",
      "Ay sonu performans ödüllendirme tartışması",
    ],
    relatesTo: ["Oracle", "Captain's Log", "The Tribute"],
    group: "analyze",
  },

  // ─── ORACLE (TopBar modal — routable fallback: /oracle) ──────────────────
  {
    slug: "oracle",
    href: "/oracle",
    matrixName: "Oracle",
    subLabel: "AI Suggestion Engine (TopBar modal)",
    icon: Sparkles,
    accent: "nebula",
    matrixReference:
      "The Oracle — 'Being The One is just like being in love. No one can tell you — you just know.' Sezgisel yönlendirici.",
    oneLiner:
      "Her sayfadan bir tık uzakta — workspace'inin boşluklarını, stratejik sapmalarını, operasyonel risklerini tarar.",
    what:
      "4 scanner (gap / strategy / ops / risk). Her biri kural tabanlı — workspace DNA'sına, connector durumuna, budget'a, audit log'a bakar. Öneri ya kabul edilir (skill/agent forge edilir) ya yoksayılır.",
    why:
      "Matrix 15+ modülde, 62+ connector'ün içinde ne olup bittiğini tek bir zihinde tutamazsın. Oracle bu yükü üstlenir — sen sadece kabul/yoksay kararını verirsin.",
    howToUse: [
      "TopBar'daki 'Oracle 17' butonuna tıkla — modal açılır",
      "Öncelikle yüksek olanları incele",
      "'Kabul et' → Oracle Forge ilgili skill/agent'ı yaratır",
      "'Yoksay' → learning signal, Oracle bu paternin ağırlığını düşürür",
    ],
    useCases: [
      "Sabah 15-dk Oracle review",
      "Kurulum önerisi kabul ederek hızlı department genişletme",
      "Boşluk tespiti — 'şu tema hiçbir skill'de yok'",
    ],
    relatesTo: ["The Prime Program", "The Archive", "The Truth"],
    group: "organize",
  },
];

export const groupMeta: Record<
  CodexEntry["group"],
  { label: string; description: string }
> = {
  bootstrap: {
    label: "Kurulum",
    description: "Yeni asset'i Matrix'e kurarken kullandığın modüller",
  },
  organize: {
    label: "Organizasyon",
    description: "Asset'in iç yapısını kurar, geliştirir, gözler",
  },
  connect: {
    label: "Bağlantı",
    description: "Dış dünya ile köprü — connector, model, para",
  },
  operate: {
    label: "Operasyon",
    description: "Günlük + haftalık çalıştırma disiplini",
  },
  analyze: {
    label: "Analiz",
    description: "Gerçek sonuçlar — kaldıraç, gelir, retrospektif",
  },
};
