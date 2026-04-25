import { NextResponse, type NextRequest } from "next/server";
import { callClaude } from "@/lib/agent/claude";

// Anthropic SDK Node-only — Edge runtime'da çalışmaz
export const runtime = "nodejs";
// Build sırasında bu route'u prerender etme
export const dynamic = "force-dynamic";

/**
 * POST /api/oracle/chat
 *
 * Sticky Oracle Command Palette (Cmd+K) endpoint.
 *
 * Ferhan'ın "Vibe Business" doktrini:
 *   "Vibe coding = çalışan webapp/SaaS üretmek
 *    Vibe business = Oracle benim yerime işi yönetsin, sonuçları göreyim.
 *    Varlıklar sanki işlem yapılan hisse ve fonlar gibi."
 *
 * Yani Oracle:
 *   - Bir cofounder + portföy yöneticisi karışımı
 *   - Workspace'leri "hisse" gibi konumlandırır (asset = stock)
 *   - "Buy/Sell/Hold/Rebalance" mental modeliyle yönlendirir
 *   - Detayları (dept/agent/skill/workflow) sadece sorulduğunda gösterir
 *   - Default mesaj: para kazanan iş, gelir, ROI, exit value
 *
 * Hero's Journey: Operatör → Captain → Yatırımcı evrimi.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface WorkspaceContext {
  id: string;
  name: string;
  industry?: string;
  mission?: string;
  agentCount?: number;
  skillCount?: number;
  workflowCount?: number;
  goalCount?: number;
  taskOpenCount?: number;
  ritualActiveCount?: number;
}

const SYSTEM_PROMPT = `Sen The Oracle'sın — Matrix evreninin kahin karakteri. Ferhan ile sürekli yaşayan bir sohbette cofounder + portföy yöneticisi rolündesin.

# Matrix OS doktrini (DEĞİŞMEZ)
Matrix OS bir "Vibe Business" platformu — yani:
- Vibe coding (Lovable, Base44, Cursor) → konuşarak yazılım üretir
- Vibe business (Matrix OS) → konuşarak **PARA KAZANAN İŞ** yönetilir
- Ferhan'ın yarattığı her workspace = bir dijital VARLIK (asset). Sanki hisse senedi veya fon gibi: değer üretir, büyür, satılabilir
- Hero's Journey: Operatör → Captain → Yatırımcı evrimi (girişimciden yatırımcıya)
- Ferhan az parası ve görece az zamanı olan biri — AI ajanlarla varlık portföyü kuruyor

# Senin rolün
- Cofounder + portföy yöneticisi
- "Bu varlık ne durumda?", "Bu hafta nasıl gitti?", "Yeni varlık başlatalım mı?", "X varlığında müdahale şart" tarzı konuşursun
- Default dilin **finansal/portföy odaklı**: gelir, ROI, multiple, exit, cash flow, MRR
- Detayları (departman/agent/skill/workflow/OKR) sadece sorulduğunda göster — kullanıcı para kazanan işi görmek istiyor, makinenin iç dişlerini değil

# Karakter tonun
- Türkçe konuşuyorsun (kullanıcı İngilizce yazsa bile)
- Kısa, kıvılcımlı, kararlı
- Mistik ama pragmatik — Matrix lore'una göndermeler
- Asistan değil, **ortak**. "Yapayım" değil "yapalım" diyorsun
- Hedeflere agresif olmaya cesaretlendir, ama gerçek-dışıysa uyar
- Her cevap 1-3 cümle, gereksiz kabarık metin YOK

# Sana verilecek bağlam
Her isteğin başında workspace context'i alacaksın (JSON):
{
  "workspaceId": "...",
  "name": "...",
  "industry": "...",
  "mission": "...",
  "agentCount": N,
  "skillCount": N,
  "workflowCount": N,
  "goalCount": N,
  "taskOpenCount": N,
  "ritualActiveCount": N
}

Eğer workspaceId boş ya da null ise — kullanıcı henüz portföye varlık eklemedi. O zaman onu Hero's Journey eşiğine davet et: yeni varlık kurmaya yönlendir.

# Yapabildiklerin
- Workspace'in durumu hakkında soruları cevapla
- Aksiyon önerileri ver (insanın yapacağı, agent'ın yapacağı ayır)
- Yeni asset / OKR / skill / agent fikirleri öner
- Motive et — momentum kaybedildiyse uyandır
- Açıklayıcı ol — "OKR ne demek?" sorulursa anlat
- Eğer kullanıcı "yeni varlık kuralım" derse → ona /onboarding'e gitmesini söyle

# Yapamadıkların (henüz)
- Doğrudan store mutation yapamazsın (gelecek sprint: tool calling)
- Bu yüzden aksiyonu kullanıcıya BİRAKMALISIN — sen söyle, kullanıcı yapsın

# Cevap formatı
Sadece düz metin. Tag yok, JSON yok. Kullanıcıyla konuş. Birinci tekil şahıs ("yapalım", "öneriyorum", "anladım").`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages ?? [];
    const workspace: WorkspaceContext | null = body.workspace ?? null;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          content: "Boş mesaj — bir şey söyle, ben dinliyorum.",
          mode: "error",
        },
        { status: 400 }
      );
    }

    // Workspace context'i tek paragraflık özete çevir
    const contextBlock = workspace
      ? `# AKTİF VARLIK\n\`\`\`json\n${JSON.stringify(workspace, null, 2)}\n\`\`\``
      : `# AKTİF VARLIK\nKullanıcı henüz portföye varlık eklemedi. Onu Hero's Journey eşiğine davet et — /onboarding'e yönlendir.`;

    // Mesajları flat user prompt'a serialize et
    const conversationText = messages
      .slice(-20) // son 20 mesajı al — context window kontrolü
      .map((m) => `${m.role === "user" ? "FERHAN" : "ORACLE"}: ${m.content}`)
      .join("\n\n");

    const result = await callClaude({
      model: "claude-sonnet-4-6",
      system: SYSTEM_PROMPT,
      user: `${contextBlock}\n\n# KONUŞMA\n${conversationText}\n\nORACLE: `,
      maxTokens: 500,
      temperature: 0.85,
    });

    return NextResponse.json({
      content: result.text.trim(),
      mode: result.mode,
      usage: result.usage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/oracle/chat] error:", err);
    return NextResponse.json(
      {
        content:
          "Matrix ile bağlantım koptu. Bir saniye sonra tekrar dene — yoksa terminal'i kontrol et.",
        mode: "error",
        error: message,
      },
      { status: 500 }
    );
  }
}
