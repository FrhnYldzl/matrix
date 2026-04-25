"use client";

/**
 * OracleConversation — Vibe-coded conversational onboarding.
 *
 * Ferhan'ın direktifi:
 *   "Vibe Business olsun, lovable base44 chat gpt claude gibi olmalı,
 *    güven vermeli, akıllı gelmeli."
 *
 * Vizyon notu (Hero's Journey):
 *   Matrix = girişimciden yatırımcıya dönüşme yolculuğu. Az parası ve
 *   az zamanı olan kullanıcı AI ajanlarla varlık üretiyor. Oracle =
 *   Morpheus rolünde. Bu sohbet, kullanıcıyı Operator → Captain → Neo
 *   yolunun ilk eşiğine taşır.
 *
 * Önceki versiyon: 5-soruluk scripted state machine (kalıp, robotik).
 * Bu versiyon: Free-form textarea + Claude SDK gerçek conversation.
 *
 * Akış:
 *   1. Mount → ilk Oracle mesajı /api/oracle/onboarding'den çekilir
 *   2. Kullanıcı yazar, gönderir → mesaj geçmişine eklenir, endpoint'e gönderilir
 *   3. Claude cevap verir + state JSON çıkarır (templateType, niche, vb.)
 *   4. State 6 alan dolu + Claude <ready/> dediğinde "Hadi başla" butonu çıkar
 *   5. Tıklayınca seedAssetFromAnswers + /dashboard'a yönlen
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { seedAssetFromAnswers, type OnboardingAnswers } from "@/lib/demo-asset";
import { ASSET_TEMPLATES, type AssetTemplate } from "@/lib/asset-templates";
import { MatrixCodeRain } from "../brand/MatrixCodeRain";
import { cn } from "@/lib/cn";
import { ArrowRight, Check, RefreshCw, Sparkles, Zap } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CollectedState {
  templateType?: AssetTemplate["type"] | null;
  workspaceName?: string | null;
  niche?: string | null;
  monthlyRevenueTargetUsd?: number | null;
  weeklyHoursAvailable?: number | null;
  startingCapitalUsd?: number | null;
}

export function OracleConversation() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [oracleTyping, setOracleTyping] = useState(false);
  const [collected, setCollected] = useState<CollectedState>({});
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"real" | "simulated" | "error" | "init">("init");
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initRef = useRef(false);

  // İlk Oracle mesajı — mount'ta endpoint'e boş history gönder
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void sendToOracle([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, oracleTyping, ready]);

  async function sendToOracle(history: ChatMessage[]) {
    setOracleTyping(true);
    try {
      const res = await fetch("/api/oracle/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (data.mode) setMode(data.mode);
      if (data.state) setCollected((c) => ({ ...c, ...data.state }));
      if (data.ready) setReady(true);
      if (data.content) {
        setMessages((m) => [...m, { role: "assistant", content: data.content }]);
      }
    } catch {
      setMode("error");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Matrix ile bağlantı kuramadım. Tekrar dene veya scripted onboarding'e dön.",
        },
      ]);
    } finally {
      setOracleTyping(false);
    }
  }

  async function handleSubmit() {
    const text = input.trim();
    if (!text || oracleTyping) return;
    const newHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(newHistory);
    setInput("");
    await sendToOracle(newHistory);
  }

  function reset() {
    setMessages([]);
    setCollected({});
    setReady(false);
    initRef.current = false;
    // useEffect tekrar tetiklenmez — manuel
    void sendToOracle([]);
    initRef.current = true;
  }

  async function startSeeding() {
    if (!ready || seeding) return;
    if (
      !collected.templateType ||
      !collected.workspaceName ||
      !collected.niche ||
      collected.monthlyRevenueTargetUsd == null ||
      collected.weeklyHoursAvailable == null ||
      collected.startingCapitalUsd == null
    ) {
      return;
    }
    setSeeding(true);
    const answers: OnboardingAnswers = {
      templateType: collected.templateType,
      workspaceName: collected.workspaceName,
      niche: collected.niche,
      monthlyRevenueTargetUsd: collected.monthlyRevenueTargetUsd,
      timelineMonths: 6,
      weeklyHoursAvailable: collected.weeklyHoursAvailable,
      startingCapitalUsd: collected.startingCapitalUsd,
      isDemo: false,
    };
    const result = seedAssetFromAnswers(useWorkspaceStore.getState(), answers);
    if (!result) {
      setSeeding(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Hata — template bulunamadı. Sohbeti yenile (Reset) veya `/dashboard`'a manuel git.",
        },
      ]);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  // 6 alan tam dolu mu? (frontend de kontrol — Claude <ready/> demese de güvenlik)
  const allFieldsFilled =
    !!collected.templateType &&
    !!collected.workspaceName &&
    !!collected.niche &&
    collected.monthlyRevenueTargetUsd != null &&
    collected.weeklyHoursAvailable != null &&
    collected.startingCapitalUsd != null;

  const canStart = ready && allFieldsFilled && !seeding && !done;

  return (
    <main className="relative flex min-h-screen flex-col bg-void text-text">
      <MatrixCodeRain tone="quantum" opacity={0.14} columns={22} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/30 via-void/10 to-void/70" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-[800px] rounded-full bg-nebula/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-nebula/40 bg-nebula-soft text-nebula shadow-[0_0_20px_rgba(155,123,255,0.3)]">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              The Oracle · cofounder
            </div>
            <div className="text-sm font-medium text-text">
              Hero&apos;s Journey · Eşik
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === "simulated" && (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-solar/30 bg-solar-soft/30 px-2 py-1 font-mono text-[9px] text-solar"
              title="ANTHROPIC_API_KEY tanımlı değil — simulated cevaplar"
            >
              ⚠ simulated
            </span>
          )}
          {mode === "real" && (
            <span className="inline-flex items-center gap-1 rounded-md border border-quantum/30 bg-quantum-soft/30 px-2 py-1 font-mono text-[9px] text-quantum">
              ✓ live · sonnet
            </span>
          )}
          <button
            onClick={reset}
            disabled={oracleTyping || seeding}
            className="inline-flex items-center gap-1 rounded-md p-1.5 text-text-faint transition-colors hover:bg-elevated/40 hover:text-text-muted disabled:opacity-40"
            aria-label="Sohbeti sıfırla"
            title="Yeniden başla"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </header>

      {/* Conversation area */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-8 sm:px-6"
      >
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 && oracleTyping && (
            <div className="text-center font-mono text-[11px] text-text-faint">
              Oracle bağlanıyor…
            </div>
          )}
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}
          {oracleTyping && messages.length > 0 && <TypingBubble />}

          {/* State preview — hangi alanlar dolu */}
          {Object.values(collected).some((v) => v != null && v !== "") && (
            <StatePreview state={collected} />
          )}

          {/* Done state */}
          {done && (
            <div className="rounded-2xl border border-quantum/40 bg-quantum-soft/30 p-5 text-center">
              <Check size={24} className="mx-auto text-quantum" />
              <p className="mt-2 text-sm font-medium text-quantum">
                Asset kuruldu. Dashboard&apos;a alıyorum…
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input dock */}
      <footer className="relative z-10 border-t border-border/40 bg-surface/60 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto max-w-2xl space-y-2">
          {canStart && (
            <button
              onClick={startSeeding}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-quantum to-quantum/80 px-5 py-3 text-sm font-semibold text-void shadow-[0_0_30px_rgba(61,224,168,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(61,224,168,0.6)]"
            >
              <Zap size={14} />
              Hadi başla — varlığı doğur
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          )}

          {seeding && !done && (
            <div className="flex items-center justify-center gap-3 rounded-lg border border-nebula/30 bg-nebula-soft/30 py-3 text-sm text-nebula">
              <Zap size={14} className="animate-pulse" />
              30+ entity yazılıyor…
            </div>
          )}

          {!seeding && !done && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              className="flex items-end gap-2 rounded-xl border border-border/60 bg-elevated/40 px-3 py-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder={
                  oracleTyping
                    ? "Oracle yazıyor…"
                    : ready
                    ? "Devam et veya 'hadi başla' de…"
                    : "Serbest yaz — 'newsletter kuracam, $5K hedef, 10 saat haftada' gibi…"
                }
                rows={1}
                disabled={oracleTyping}
                className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-text-faint disabled:opacity-50 max-h-32"
              />
              <button
                type="submit"
                disabled={!input.trim() || oracleTyping}
                className="inline-flex items-center gap-1.5 rounded-lg bg-nebula px-3 py-2 text-xs font-medium text-void transition-all hover:bg-nebula/90 disabled:opacity-40"
              >
                Gönder
                <ArrowRight size={12} />
              </button>
            </form>
          )}

          <div className="text-center font-mono text-[10px] text-text-faint">
            Vibe konuşma · doğal dil · Claude Sonnet · Hero&apos;s Journey
          </div>
        </div>
      </footer>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Bubbles
// ───────────────────────────────────────────────────────────────────────────

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isOracle = role === "assistant";
  return (
    <div className={cn("flex", isOracle ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isOracle
            ? "border border-nebula/30 bg-nebula-soft/30 text-text"
            : "bg-ion text-void"
        )}
      >
        {isOracle && (
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-nebula">
            <Sparkles size={9} />
            Oracle
          </div>
        )}
        <p>{text}</p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl border border-nebula/30 bg-nebula-soft/20 px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nebula [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nebula [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nebula [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// State preview — Oracle topladığı bilgileri canlı gösterir
// ───────────────────────────────────────────────────────────────────────────

function StatePreview({ state }: { state: CollectedState }) {
  const tpl = state.templateType
    ? ASSET_TEMPLATES.find((t) => t.type === state.templateType)
    : null;
  const filled = Object.values(state).filter((v) => v != null && v !== "").length;
  const total = 6;
  const pct = (filled / total) * 100;

  return (
    <div className="rounded-xl border border-quantum/30 bg-quantum-soft/15 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-quantum">
          <Sparkles size={10} />
          Topladığım bilgiler
        </div>
        <span className="font-mono text-[10px] text-quantum">
          {filled}/{total}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated/60">
        <div
          className="h-full bg-quantum transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <Field label="Tür" value={tpl?.label || state.templateType} />
        <Field label="İsim" value={state.workspaceName} />
        <Field label="Niş" value={state.niche} />
        <Field
          label="Hedef"
          value={
            state.monthlyRevenueTargetUsd != null
              ? `$${state.monthlyRevenueTargetUsd.toLocaleString("en-US")}/ay`
              : null
          }
        />
        <Field
          label="Saat"
          value={
            state.weeklyHoursAvailable != null
              ? `${state.weeklyHoursAvailable}h/hafta`
              : null
          }
        />
        <Field
          label="Kapital"
          value={
            state.startingCapitalUsd != null
              ? state.startingCapitalUsd === 0
                ? "Bootstrap"
                : `$${state.startingCapitalUsd}`
              : null
          }
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
        {label}
      </span>
      <span
        className={cn(
          "truncate text-[11px]",
          value ? "text-text" : "text-text-faint italic"
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
