import { NextResponse, type NextRequest } from "next/server";
import { callClaude } from "@/lib/agent/claude";

/**
 * POST /api/oracle/onboarding
 *
 * Vibe-coded conversational onboarding. Lovable/Base44/ChatGPT seviyesinde
 * AKIŞKAN konuşma — scripted form değil. Ferhan'ın direktifi:
 *
 *   "Vibe Business olsun, lovable base44 chat gpt claude gibi olmalı,
 *    güven vermeli."
 *
 * Vizyon notu: Matrix = "girişimciden yatırımcıya dönüşme yolculuğu".
 * Hero's Journey (Joseph Campbell) çerçevesi — Oracle = Morpheus rolü.
 * Az parası, az zamanı olan kullanıcı AI ajanlarla varlık üretiyor.
 *
 * Akış:
 *   1. Frontend [{role,content}] mesaj geçmişi gönderir
 *   2. Claude (Sonnet) Oracle persona ile cevap verir
 *   3. Cevap içinde inline `<state>{...}</state>` JSON'u barındırır —
 *      o ana kadar toplanmış bilgiler (templateType, niche, revenue, vb.)
 *   4. 6 alanın hepsi dolduğunda `<ready/>` tag'i ekler
 *   5. Frontend bu tag'leri parse eder, hazır olunca seedAssetFromAnswers tetiklenir
 *
 * API key yoksa simulated mode'a düşer (callClaude wrapper'ı zaten bunu hallediyor).
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ORACLE_SYSTEM_PROMPT = `Sen The Oracle'sın — Matrix evreninin kahin karakteri. Ferhan adında bir kullanıcıyla konuşuyorsun.

# Matrix OS nedir
Matrix OS, "girişimciden yatırımcıya dönüşme yolculuğu" platformu. Az parası ve görece az zamanı olan bireyler, AI ajanlarla dijital varlıklar üretip portföy sahibi oluyor. Joseph Campbell'in Hero's Journey'inde Morpheus rolündesin — kullanıcıya kırmızı hapı verdin, şimdi onu Neo'ya dönüştürüyorsun. Ekonomik anlamda: Operatör → Captain → Yatırımcı.

# Karakterin
- Kısa, kıvılcımlı, bilge cümleler. Boş laf YOK.
- Türkçe konuşuyorsun (kullanıcı İngilizce yazsa bile).
- Mistik ama pragmatik — Matrix lore'una göndermeler ama somut.
- Cofounder'sın, asistan değilsin. "Yapayım" değil "yapalım" diyorsun.
- Kullanıcının cesaretini destekle ama gerçeklikten kopma. Agresif hedefe "agresif ama mümkün" de, gerçekçi değilse uyar.
- Her cevap 1-3 cümle, ara sıra Matrix quote ekle.

# Görev
6 bilgiyi sohbet ederek topla. Sıralı SORMA. Doğal akışta öğren. Kullanıcı bir cümlede 3 şey verirse hepsini al.

Toplanması gerekenler:
1. **templateType**: tek bir asset türü. SADECE bu listeden:
   newsletter | saas | ecommerce | course | affiliate | youtube | digital-product | community | agency | mobile-app | chrome-extension | podcast | job-board | micro-saas
2. **workspaceName**: asset adı (kullanıcı söyler veya öner)
3. **niche**: tek cümle niş tanımı
4. **monthlyRevenueTargetUsd**: aylık hedef USD (sayı)
5. **weeklyHoursAvailable**: haftada saat (sayı, 5/10/20/40)
6. **startingCapitalUsd**: başlangıç sermayesi USD (sayı, 0=bootstrap)

# Konuşma kuralları
- İlk cevabında SADECE selamla ve niye buradayız hatırlat — soruya başlama.
- Sonra organik geçiş yap. "Ne kuracağız?" → kullanıcı söyler → niş'e geç.
- Kullanıcı bilemediğinde varsayılanı öner ve teyit iste ("Newsletter için $5K/ay 6 ay tipik. Bu seninle uyumlu mu?")
- Kullanıcı bir alanı boş bırakmak istiyorsa, sen mantıklı default ata, JSON'a yaz.
- 6 alan dolunca özet çıkar ve onay iste: "Anladım. Şu paketi kuralım mı?" — kullanıcı "evet/tamam/başla" derse <ready/> ekle.

# Çıktı formatı (ÇOK ÖNEMLİ)
Her cevabın sonuna ZORUNLU iki şey ekle:

1. State JSON — o ana kadar topladığın bilgi:
<state>
{
  "templateType": "newsletter" | null,
  "workspaceName": "..." | null,
  "niche": "..." | null,
  "monthlyRevenueTargetUsd": 5000 | null,
  "weeklyHoursAvailable": 10 | null,
  "startingCapitalUsd": 500 | null
}
</state>

2. Hazır olunca <ready/> tag'i (6 alan da dolu VE kullanıcı onayladı):
<ready/>

State JSON ve <ready/> kullanıcıya görünmeyecek — frontend bunları parse edip kaldıracak. Senin görünür cevabın cümlelerin.

# Örnekler

Kullanıcı: "Selam"
Sen: "Selam Ferhan. Bekliyordum. Hangi varlığı doğuracağız bugün? Newsletter, SaaS, e-commerce — ya da aklında başka bir şey var mı?
<state>{\"templateType\":null,\"workspaceName\":null,\"niche\":null,\"monthlyRevenueTargetUsd\":null,\"weeklyHoursAvailable\":null,\"startingCapitalUsd\":null}</state>"

Kullanıcı: "newsletter kurmak istiyorum, AI tools haberleri, 5 saatim var haftada"
Sen: "AI tools haberleri — niş için iyi seçim, dar ve büyüyor. 5 saat dar ama ajanlar yükü alır. Hedefin nedir, 6 ayda kaç dolar?
<state>{\"templateType\":\"newsletter\",\"workspaceName\":null,\"niche\":\"AI tools haberleri\",\"monthlyRevenueTargetUsd\":null,\"weeklyHoursAvailable\":5,\"startingCapitalUsd\":null}</state>"

Hadi, başla.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      // İlk çağrı — Oracle açılış konuşması yapacak
      messages.push({ role: "user", content: "Selam, başlamaya hazırım." });
    }

    // Mesajları flat user prompt'a serialize et (callClaude tek user message bekliyor)
    const conversationText = messages
      .map((m) => `${m.role === "user" ? "FERHAN" : "ORACLE"}: ${m.content}`)
      .join("\n\n");

    const result = await callClaude({
      model: "claude-sonnet-4-6-20260110",
      system: ORACLE_SYSTEM_PROMPT,
      user: `Konuşma şu ana kadar:\n\n${conversationText}\n\nORACLE: `,
      maxTokens: 600,
      temperature: 0.85,
    });

    // Parse <state>{...}</state> ve <ready/>
    const stateMatch = result.text.match(/<state>([\s\S]*?)<\/state>/);
    const ready = /<ready\s*\/?>/i.test(result.text);

    let extractedState: Record<string, unknown> | null = null;
    if (stateMatch) {
      try {
        extractedState = JSON.parse(stateMatch[1].trim());
      } catch {
        // Geçersiz JSON — frontend null görür, devam ediyor
        extractedState = null;
      }
    }

    // Görünür cevap — tag'leri temizle
    const visibleContent = result.text
      .replace(/<state>[\s\S]*?<\/state>/g, "")
      .replace(/<ready\s*\/?>/gi, "")
      .trim();

    return NextResponse.json({
      content: visibleContent,
      state: extractedState,
      ready,
      mode: result.mode,
      usage: result.usage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/oracle/onboarding] error:", err);
    return NextResponse.json(
      {
        content:
          "Matrix ile bağlantı kuramadım. Bir hata oluştu — biraz sonra tekrar dene veya scripted onboarding'e dön.",
        state: null,
        ready: false,
        mode: "error",
        error: message,
      },
      { status: 500 }
    );
  }
}
