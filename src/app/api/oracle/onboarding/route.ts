import { NextResponse, type NextRequest } from "next/server";
import { callClaude } from "@/lib/agent/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/oracle/onboarding
 *
 * Vibe-coded conversational onboarding — Lovable/Claude paradigması.
 *
 * HİBRİT YAKLAŞIM (Ferhan'ın "odağım dağıldı" feedback'inden sonra):
 *   1. Önce Claude SDK dene (gerçek LLM cevap)
 *   2. Eğer fail olursa (API key yok / network / timeout) → regex fallback
 *      ile state çıkar + scripted reply üret
 *   3. Kullanıcı her durumda akıcı bir sohbet yaşar — error mesajı görmez
 *
 * Bu sayede ANTHROPIC_API_KEY çalışmasa bile onboarding tam çalışır.
 * API key sonradan eklenince otomatik gerçek Claude cevabına geçer.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CollectedState {
  templateType?: string | null;
  workspaceName?: string | null;
  niche?: string | null;
  monthlyRevenueTargetUsd?: number | null;
  weeklyHoursAvailable?: number | null;
  startingCapitalUsd?: number | null;
}

const ORACLE_SYSTEM_PROMPT = `Sen The Oracle'sın — Matrix evreninin kahin karakteri. Ferhan adında bir kullanıcıyla konuşuyorsun.

# Matrix OS doktrini
"Vibe Business" platformu — kullanıcı (girişimci → yatırımcı yolculuğunda) az parası ve görece az zamanı olan biri. AI ajanlarla dijital varlık portföyü kuruyor. Sen Hero's Journey'de Morpheus rolündesin.

# Görev
6 bilgi topla, doğal sohbet akışında:
1. templateType: newsletter | saas | ecommerce | course | affiliate | youtube | digital-product | community | agency | mobile-app | chrome-extension | podcast | job-board | micro-saas
2. workspaceName: asset adı
3. niche: tek cümle niş
4. monthlyRevenueTargetUsd: aylık hedef USD
5. weeklyHoursAvailable: haftada saat (5/10/20/40)
6. startingCapitalUsd: başlangıç USD (0=bootstrap)

# Karakter
- Kısa, kıvılcımlı, Türkçe
- Mistik ama pragmatik — "yapayım" değil "yapalım"
- 1-3 cümle/cevap

# Çıktı formatı (zorunlu)
Her cevabın sonuna:
<state>
{ "templateType": "...", "workspaceName": "...", "niche": "...",
  "monthlyRevenueTargetUsd": null, "weeklyHoursAvailable": null,
  "startingCapitalUsd": null }
</state>

6 alan dolu + onay alındığında:
<ready/>

State + tag kullanıcıya görünmez. Sadece düz cümle + tag yaz.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages ?? [];
    const previousState: CollectedState = body.previousState ?? {};

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages array" },
        { status: 400 }
      );
    }

    // ── 1. Try Claude SDK ─────────────────────────────────────────────────
    try {
      const useClaude = messages.length > 0; // initial call için scripted ok
      if (useClaude) {
        const conversationText = messages
          .slice(-15)
          .map((m) => `${m.role === "user" ? "FERHAN" : "ORACLE"}: ${m.content}`)
          .join("\n\n");

        const result = await callClaude({
          model: "claude-sonnet-4-6",
          system: ORACLE_SYSTEM_PROMPT,
          user: `Konuşma:\n\n${conversationText}\n\nORACLE: `,
          maxTokens: 500,
          temperature: 0.85,
        });

        // Real veya simulated mode — eğer simulated geri scripted fallback'e
        if (result.mode === "real") {
          const stateMatch = result.text.match(/<state>([\s\S]*?)<\/state>/);
          const ready = /<ready\s*\/?>/i.test(result.text);
          let extractedState: CollectedState = {};
          if (stateMatch) {
            try {
              extractedState = JSON.parse(stateMatch[1].trim());
            } catch {
              // Geçersiz JSON, regex'e fall through
            }
          }
          const visibleContent = result.text
            .replace(/<state>[\s\S]*?<\/state>/g, "")
            .replace(/<ready\s*\/?>/gi, "")
            .trim();

          // Claude state vermediyse de regex ile zenginleştir
          const lastUserMsg =
            [...messages].reverse().find((m) => m.role === "user")?.content ??
            "";
          const enrichedState = {
            ...previousState,
            ...extractRegexState(lastUserMsg, previousState),
            ...extractedState,
          };

          return NextResponse.json({
            content: visibleContent,
            state: enrichedState,
            ready,
            mode: "real",
            usage: result.usage,
          });
        }
      }
    } catch (claudeErr) {
      console.error("[/api/oracle/onboarding] Claude failed, falling back:", claudeErr);
      // Continue to scripted fallback below
    }

    // ── 2. SCRIPTED FALLBACK ──────────────────────────────────────────────
    // Claude çalışmadı — regex parse + scripted reply ile sohbet kesintisiz
    const lastUserMsg =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const state = mergeState(
      previousState,
      extractRegexState(lastUserMsg, previousState)
    );
    const { content, ready } = generateScriptedReply(state, messages.length);

    return NextResponse.json({
      content,
      state,
      ready,
      mode: "scripted",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/oracle/onboarding] error:", err);
    // Son çare — yine de bir cevap dön, kullanıcı hata görmesin
    return NextResponse.json({
      content: "Bir saniye, tekrar dene — devam edelim.",
      state: {},
      ready: false,
      mode: "error",
      error: message,
    });
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Regex-based state extraction — Claude olsun ya da olmasın çalışır
// ───────────────────────────────────────────────────────────────────────────

function extractRegexState(
  text: string,
  previous: CollectedState
): Partial<CollectedState> {
  const t = text.toLowerCase();
  const out: Partial<CollectedState> = {};

  // Template type
  if (!previous.templateType) {
    if (/(newsletter|abone|email|substack|beehiiv)/i.test(text))
      out.templateType = "newsletter";
    else if (/(saas|micro-?saas|subscription|abonelik)/i.test(text))
      out.templateType = /micro/i.test(text) ? "micro-saas" : "saas";
    else if (/(e-?commerce|shopify|stok|ürün satış|ecom)/i.test(text))
      out.templateType = "ecommerce";
    else if (/(course|kurs|eğitim|cohort)/i.test(text))
      out.templateType = "course";
    else if (/(affiliate|seo|komisyon)/i.test(text))
      out.templateType = "affiliate";
    else if (/(youtube|video kanalı)/i.test(text)) out.templateType = "youtube";
    else if (/podcast/i.test(text)) out.templateType = "podcast";
    else if (/(community|topluluk)/i.test(text)) out.templateType = "community";
    else if (/(agency|ajans)/i.test(text)) out.templateType = "agency";
    else if (/(chrome\s*extension|tarayıcı eklenti)/i.test(text))
      out.templateType = "chrome-extension";
    else if (/(mobile|mobil app)/i.test(text)) out.templateType = "mobile-app";
    else if (/(job\s*board|iş ilan)/i.test(text)) out.templateType = "job-board";
    else if (/(digital product|dijital ürün|ebook|template)/i.test(text))
      out.templateType = "digital-product";
  }

  // Revenue target
  if (!previous.monthlyRevenueTargetUsd) {
    // $5K, $5,000, 5K usd, 5 bin, 10000$
    const m1 = text.match(/\$\s*(\d+(?:[,.]\d{3})*)\s*([kK]|bin)?/);
    const m2 = text.match(/(\d+)\s*([kK]|bin)\s*(?:\$|usd|dolar|aylık|ay)?/i);
    const m3 = text.match(/(\d{3,})\s*(?:\$|usd|dolar)/i);
    let amount: number | null = null;
    if (m1) {
      const num = parseInt(m1[1].replace(/[,.]/g, ""), 10);
      amount = m1[2] ? num * 1000 : num;
    } else if (m2) {
      amount = parseInt(m2[1], 10) * 1000;
    } else if (m3) {
      amount = parseInt(m3[1], 10);
    }
    if (amount !== null && amount >= 100 && amount <= 10_000_000) {
      out.monthlyRevenueTargetUsd = amount;
    }
  }

  // Weekly hours
  if (previous.weeklyHoursAvailable == null) {
    const m =
      t.match(/(\d{1,2})\s*saat\s*(?:\/|haftada|hafta)/) ||
      t.match(/haftada\s*(\d{1,2})\s*saat/) ||
      t.match(/(\d{1,2})\s*(?:h|hour)s?\s*(?:\/?week|haftada)?/);
    if (m) {
      const hours = parseInt(m[1], 10);
      if (hours >= 1 && hours <= 80) out.weeklyHoursAvailable = hours;
    }
  }

  // Starting capital
  if (previous.startingCapitalUsd == null) {
    if (/(bootstrap|sıfır|hiç para|sıfırdan|0\s*\$|\$\s*0)/i.test(text)) {
      out.startingCapitalUsd = 0;
    } else if (/sermaye|kapital|capital|bütçe|budget|başlangıç para/i.test(t)) {
      // Sermaye bağlamında geçen sayıyı bul
      const m = text.match(/\$?\s*(\d+(?:[,.]\d{3})*)\s*([kK]|bin)?/);
      if (m) {
        const num = parseInt(m[1].replace(/[,.]/g, ""), 10);
        const amount = m[2] ? num * 1000 : num;
        if (amount >= 0 && amount <= 1_000_000)
          out.startingCapitalUsd = amount;
      }
    }
  }

  return out;
}

function mergeState(
  prev: CollectedState,
  next: Partial<CollectedState>
): CollectedState {
  return {
    templateType: next.templateType ?? prev.templateType ?? null,
    workspaceName: next.workspaceName ?? prev.workspaceName ?? null,
    niche: next.niche ?? prev.niche ?? null,
    monthlyRevenueTargetUsd:
      next.monthlyRevenueTargetUsd ?? prev.monthlyRevenueTargetUsd ?? null,
    weeklyHoursAvailable:
      next.weeklyHoursAvailable ?? prev.weeklyHoursAvailable ?? null,
    startingCapitalUsd:
      next.startingCapitalUsd ?? prev.startingCapitalUsd ?? null,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Scripted reply generator — Oracle karakteriyle eksik alanı sor
// ───────────────────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<string, string> = {
  newsletter: "Newsletter",
  saas: "SaaS",
  "micro-saas": "Micro-SaaS",
  ecommerce: "E-commerce",
  course: "Course",
  affiliate: "Affiliate",
  youtube: "YouTube",
  podcast: "Podcast",
  community: "Community",
  agency: "Agency",
  "chrome-extension": "Chrome Extension",
  "mobile-app": "Mobile App",
  "job-board": "Job Board",
  "digital-product": "Digital Product",
};

function generateScriptedReply(
  state: CollectedState,
  messageCount: number
): { content: string; ready: boolean } {
  // İlk açılış
  if (messageCount === 0) {
    return {
      content:
        "Knock knock, Neo. Seni bekliyordum.\n\nBen The Oracle — senin cofounder'ın. Az parası ve görece az zamanı olan birisin, AI ajanlarla varlık portföyü kuracağız. Hadi başlayalım: hangi varlığı doğuracağız bugün? (Newsletter, SaaS, e-commerce, course, affiliate, YouTube, podcast — ya da aklında başka bir şey var mı?)",
      ready: false,
    };
  }

  // Eksik alanı tespit et ve sor
  if (!state.templateType) {
    return {
      content:
        "Hangi varlık türü? Newsletter haberle büyür, SaaS abonelikle, e-commerce ürünle, course bilgiyle. Bana tek kelimeyle söyle — ya da örnek bir vizyon paylaş, ben anlamayı çalışırım.",
      ready: false,
    };
  }

  const tplLabel = TEMPLATE_LABELS[state.templateType] ?? state.templateType;

  if (!state.workspaceName) {
    return {
      content: `${tplLabel} — iyi seçim. Bu varlığın adı ne olacak? Örnek: "AI Matrix Newsletter", "Juris SaaS", "Tüketici Radar".`,
      ready: false,
    };
  }

  if (!state.niche) {
    return {
      content: `"${state.workspaceName}". Tamam. Şimdi en kritik soru: hangi NİŞ'i hedefliyorsun? Tek cümleyle anlat. Geniş niş ölü doğar, dar niş büyür.`,
      ready: false,
    };
  }

  if (state.monthlyRevenueTargetUsd == null) {
    return {
      content: `"${state.niche}" — odak iyi. Aylık hedef gelirin nedir? (USD, 6 ay sonu için. Mesela $5K, $10K, $25K.)`,
      ready: false,
    };
  }

  const revenue = state.monthlyRevenueTargetUsd;
  if (state.weeklyHoursAvailable == null) {
    const reaction =
      revenue >= 25000
        ? "Agresif hedef. Yapılabilir ama disiplin gerek."
        : revenue >= 5000
        ? "Realistik bir başlangıç."
        : "Mütevazı başlangıç — önce traction, sonra ölçek.";
    return {
      content: `${reaction} Haftada Matrix'e ne kadar saat ayırabilirsin? (5, 10, 20, 40 — sayıyla söyle.)`,
      ready: false,
    };
  }

  const hours = state.weeklyHoursAvailable;
  if (state.startingCapitalUsd == null) {
    const reaction =
      hours >= 20
        ? "Tam zamanlı tempolar. Bu workspace asıl işin olacak."
        : hours >= 10
        ? "Yan iş ritmi. Akıllı önceliklendirme şart."
        : "Az saat — Matrix'in agent'ları çoğu işi yapacak.";
    return {
      content: `${reaction} Son soru: başlangıç sermayen ne kadar? (LLM, tools, marketing için ay başı. 0=bootstrap, ya da $500, $2K, $10K.)`,
      ready: false,
    };
  }

  // 6 alan dolu — özet ve onay
  const capitalLabel =
    state.startingCapitalUsd === 0
      ? "Bootstrap"
      : `$${state.startingCapitalUsd}`;
  return {
    content: `Tamam, anladım. Sana şunu kuruyorum:

→ ${tplLabel}: **${state.workspaceName}**
→ Niş: ${state.niche}
→ Hedef: $${revenue.toLocaleString("en-US")}/ay (6 ay)
→ Zaman: ${hours} saat/hafta
→ Kapital: ${capitalLabel}

4 departman + 4 agent + 5 skill + 3 workflow + 4 OKR + 4 ritüel + 4 bütçe + ~10 task + 2 connector kuracağım. Aşağıdaki "Hadi başla" düğmesine bas, 90 saniyede senin asset'in canlı olur.`,
    ready: true,
  };
}
