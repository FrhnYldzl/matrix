"use client";

/**
 * OracleConversation — full-screen conversational onboarding.
 *
 * Felsefe: OpenClaw "do work for me" diyorsa Matrix "make me succeed" diyor.
 * The Oracle bir cofounder gibi karşılar, sohbet ederek 5 cevap toplar,
 * 30+ entity'lik canlı asset kurar. Mevcut 6-soruluk wizard yerine bu.
 *
 * Sohbet akışı:
 *   1. Hoşgeldin (Matrix quote, atmosfer)
 *   2. Asset türü? (Newsletter/SaaS/E-commerce/Course/Affiliate chip seçimi)
 *   3. İsim? (text)
 *   4. Niş + unique angle? (text)
 *   5. Aylık hedef? (numeric chip)
 *   6. Haftalık zaman? (chip)
 *   7. Başlangıç sermayesi? (chip)
 *   8. Özet + "Hadi başla" → seed + /dashboard'a yönlen
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { seedAssetFromAnswers, type OnboardingAnswers } from "@/lib/demo-asset";
import { ASSET_TEMPLATES, type AssetTemplate } from "@/lib/asset-templates";
import { MatrixCodeRain } from "../brand/MatrixCodeRain";
import { cn } from "@/lib/cn";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";

// Chat step kinds
type Step =
  | "intro"
  | "ask-template"
  | "ask-name"
  | "ask-niche"
  | "ask-revenue"
  | "ask-hours"
  | "ask-capital"
  | "summary"
  | "seeding"
  | "done";

interface Message {
  who: "oracle" | "user";
  text: string;
  /** Choices that user picked (rendered as bubble badges) */
  picks?: string[];
}

const TEMPLATE_CHOICES: Array<{
  type: AssetTemplate["type"];
  label: string;
  emoji: string;
  hint: string;
}> = [
  { type: "newsletter", label: "Newsletter", emoji: "📧", hint: "Beehiiv/Substack · sponsor + paid tier" },
  { type: "saas", label: "SaaS", emoji: "⚙️", hint: "B2B subscription · MRR" },
  { type: "ecommerce", label: "E-commerce", emoji: "🛍️", hint: "Shopify · physical/digital" },
  { type: "course", label: "Course", emoji: "🎓", hint: "Cohort/self-paced · digital product" },
  { type: "affiliate", label: "Affiliate", emoji: "🔗", hint: "SEO/comparison content · komisyon" },
  { type: "youtube", label: "YouTube", emoji: "📺", hint: "Video · sponsor + AdSense" },
];

const REVENUE_CHOICES = [1000, 5000, 10000, 25000, 50000];
const HOUR_CHOICES = [5, 10, 20, 40];
const CAPITAL_CHOICES = [0, 500, 2000, 10000];

export function OracleConversation() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [oracleTyping, setOracleTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Collected answers
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, step]);

  // Intro auto-trigger
  useEffect(() => {
    if (step === "intro") {
      pushOracleSequence([
        { delay: 600, text: "Knock knock, Neo." },
        { delay: 1400, text: "Seni bekliyordum." },
        {
          delay: 1400,
          text: "Ben The Oracle. Senin cofounder'ın. Para kazanan dijital varlıklar kuracaksın, ben yanındayım.",
        },
        {
          delay: 1600,
          text: "Sana 5 soru soracağım. Sonra 90 saniyede sana eksiksiz bir asset kuracağım — departman, agent, skill, workflow, OKR, ritüel, bütçe. Hadi başlayalım.",
          afterStep: "ask-template",
        },
      ]);
    }
  }, [step]);

  // Helper: oracle bubble queue with typing animation
  const pushOracleSequence = (
    seq: { delay: number; text: string; afterStep?: Step }[]
  ) => {
    let acc = 0;
    seq.forEach(({ delay, text, afterStep }) => {
      acc += delay;
      setTimeout(() => {
        setOracleTyping(true);
        setTimeout(() => {
          setOracleTyping(false);
          setMessages((m) => [...m, { who: "oracle", text }]);
          if (afterStep) setStep(afterStep);
        }, 700);
      }, acc);
    });
  };

  const pushOracle = (text: string, afterStep?: Step) => {
    setOracleTyping(true);
    setTimeout(() => {
      setOracleTyping(false);
      setMessages((m) => [...m, { who: "oracle", text }]);
      if (afterStep) setStep(afterStep);
    }, 700);
  };

  // ─── Handlers ──────────────────────────────────────────────────────────

  const onPickTemplate = (t: (typeof TEMPLATE_CHOICES)[number]) => {
    setAnswers((a) => ({ ...a, templateType: t.type }));
    setMessages((m) => [
      ...m,
      { who: "user", text: `${t.emoji} ${t.label}`, picks: [t.label] },
    ]);
    setTimeout(() => {
      pushOracle(
        `${t.label} — güzel seçim. ${t.hint}.`
      );
      setTimeout(() => {
        pushOracle(
          "Bu asset'in adı ne olacak? (örn. 'AI Matrix Newsletter', 'Juris SaaS')",
          "ask-name"
        );
      }, 1200);
    }, 400);
  };

  const onSubmitName = (name: string) => {
    if (!name.trim()) return;
    setAnswers((a) => ({ ...a, workspaceName: name.trim() }));
    setMessages((m) => [...m, { who: "user", text: name.trim() }]);
    setTimeout(() => {
      pushOracle(`"${name.trim()}". Kayıt aldım.`);
      setTimeout(() => {
        pushOracle(
          "Şimdi en kritik soru: hangi NİŞ'i hedefliyorsun? Tek cümle. Örn. 'AI tools haberleri', 'B2B SaaS founder'lar için CRM', 'Türk yemek tarifleri'.",
          "ask-niche"
        );
      }, 1200);
    }, 400);
  };

  const onSubmitNiche = (niche: string) => {
    if (!niche.trim()) return;
    setAnswers((a) => ({ ...a, niche: niche.trim() }));
    setMessages((m) => [...m, { who: "user", text: niche.trim() }]);
    setTimeout(() => {
      pushOracle(`"${niche.trim()}" — odak için iyi. Geniş niş ölü doğar, dar niş büyür.`);
      setTimeout(() => {
        pushOracle("Aylık hedef gelirin nedir? (USD, 6 ay sonu için)", "ask-revenue");
      }, 1200);
    }, 400);
  };

  const onPickRevenue = (amount: number) => {
    setAnswers((a) => ({ ...a, monthlyRevenueTargetUsd: amount, timelineMonths: 6 }));
    setMessages((m) => [
      ...m,
      { who: "user", text: `$${amount.toLocaleString("en-US")}/ay`, picks: [`$${amount}`] },
    ]);
    const reaction =
      amount >= 25000
        ? "Agresif hedef. Yapılabilir ama disiplin gerek — Matrix bunu fark eder."
        : amount >= 5000
        ? "Realistik bir başlangıç. 6 ay yetmezse 9'a uzatırız."
        : "Mütevazı başlangıç. Önce traction, sonra ölçek.";
    setTimeout(() => {
      pushOracle(reaction);
      setTimeout(() => {
        pushOracle("Haftada Matrix'e ne kadar saat ayırabilirsin?", "ask-hours");
      }, 1300);
    }, 400);
  };

  const onPickHours = (h: number) => {
    setAnswers((a) => ({ ...a, weeklyHoursAvailable: h }));
    setMessages((m) => [
      ...m,
      { who: "user", text: `${h} saat/hafta`, picks: [`${h}h`] },
    ]);
    setTimeout(() => {
      pushOracle(
        h >= 20
          ? "Tam zamanlı. Bu workspace asıl işin olacak."
          : h >= 10
          ? "Yan iş ritmi. Akıllı önceliklendirme şart."
          : "Az saat — Matrix'in agent'ları çoğu işi yapacak. Senin görevin sadece son onayları vermek."
      );
      setTimeout(() => {
        pushOracle(
          "Son soru — başlangıç sermayen ne kadar? (LLM, tools, marketing için ay başı)",
          "ask-capital"
        );
      }, 1300);
    }, 400);
  };

  const onPickCapital = (c: number) => {
    setAnswers((a) => ({ ...a, startingCapitalUsd: c }));
    setMessages((m) => [
      ...m,
      { who: "user", text: c === 0 ? "Sıfır — bootstrap" : `$${c}/ay`, picks: [`$${c}`] },
    ]);
    setTimeout(() => {
      pushOracle(
        c === 0
          ? "Bootstrap mode. The Source ucuz model'leri seçer (Haiku), Matrix kendi kendine ödeyene kadar dikkatli."
          : c >= 2000
          ? "Yeterli yakıt. Marketing + premium model + tools'a yer var."
          : "Tipik solo founder bütçesi. Hemen ROI'yi takip ediyoruz."
      );
      setTimeout(() => setStep("summary"), 1500);
    }, 400);
  };

  // ─── Render helpers ────────────────────────────────────────────────────

  const summary = useMemo(() => {
    if (!answers.templateType) return null;
    const tpl = ASSET_TEMPLATES.find((t) => t.type === answers.templateType);
    return {
      template: tpl,
      name: answers.workspaceName,
      niche: answers.niche,
      revenue: answers.monthlyRevenueTargetUsd,
      hours: answers.weeklyHoursAvailable,
      capital: answers.startingCapitalUsd,
    };
  }, [answers]);

  const seed = async () => {
    if (
      !answers.templateType ||
      !answers.workspaceName ||
      !answers.niche ||
      answers.monthlyRevenueTargetUsd == null ||
      answers.weeklyHoursAvailable == null ||
      answers.startingCapitalUsd == null
    )
      return;
    setStep("seeding");
    pushOracle("Tamam. Senin için kuruyorum…");
    setTimeout(() => {
      const result = seedAssetFromAnswers(useWorkspaceStore.getState(), {
        templateType: answers.templateType!,
        workspaceName: answers.workspaceName!,
        niche: answers.niche!,
        monthlyRevenueTargetUsd: answers.monthlyRevenueTargetUsd!,
        timelineMonths: 6,
        weeklyHoursAvailable: answers.weeklyHoursAvailable!,
        startingCapitalUsd: answers.startingCapitalUsd!,
        isDemo: false,
      });
      if (!result) {
        pushOracle("Bir şey ters gitti. Geliştirici loga bak.");
        return;
      }
      setStep("done");
      // 2 saniye sonra dashboard'a yönlen
      setTimeout(() => router.push("/dashboard"), 2200);
    }, 1500);
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <main className="relative flex min-h-screen flex-col bg-void text-text">
      <MatrixCodeRain tone="quantum" opacity={0.14} columns={22} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/30 via-void/10 to-void/70" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-[800px] rounded-full bg-nebula/10 blur-3xl" />

      {/* Top thin bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-border/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-nebula/40 bg-nebula-soft text-nebula">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              The Oracle · Onboarding
            </div>
            <div className="text-sm font-medium text-text">Cofounder konuşması</div>
          </div>
        </div>
        <div className="font-mono text-[10px] text-text-faint">
          {step === "intro" || step === "ask-template" ? "0/5" :
           step === "ask-name" ? "1/5" :
           step === "ask-niche" ? "2/5" :
           step === "ask-revenue" ? "3/5" :
           step === "ask-hours" ? "4/5" :
           step === "ask-capital" ? "5/5" :
           "✓"}
        </div>
      </header>

      {/* Conversation area */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-8 sm:px-6"
      >
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((m, i) => (
            <Bubble key={i} who={m.who} text={m.text} />
          ))}
          {oracleTyping && <TypingBubble />}
        </div>
      </div>

      {/* Input dock — değişken mode */}
      <footer className="relative z-10 border-t border-border/40 bg-surface/60 px-4 py-5 backdrop-blur-md sm:px-6">
        <div className="mx-auto max-w-2xl">
          {step === "ask-template" && <TemplatePicker onPick={onPickTemplate} />}
          {step === "ask-name" && (
            <TextInput
              placeholder="Asset adı… (Enter ile gönder)"
              onSubmit={onSubmitName}
              autoFocus
            />
          )}
          {step === "ask-niche" && (
            <TextInput
              placeholder="Niş — tek cümle… (Enter ile gönder)"
              onSubmit={onSubmitNiche}
              autoFocus
            />
          )}
          {step === "ask-revenue" && (
            <ChipPicker
              choices={REVENUE_CHOICES.map((v) => ({
                value: v,
                label: `$${v.toLocaleString("en-US")}`,
              }))}
              onPick={onPickRevenue}
            />
          )}
          {step === "ask-hours" && (
            <ChipPicker
              choices={HOUR_CHOICES.map((v) => ({ value: v, label: `${v} saat` }))}
              onPick={onPickHours}
            />
          )}
          {step === "ask-capital" && (
            <ChipPicker
              choices={CAPITAL_CHOICES.map((v) => ({
                value: v,
                label: v === 0 ? "Bootstrap" : `$${v}`,
              }))}
              onPick={onPickCapital}
            />
          )}
          {step === "summary" && summary && (
            <SummaryCard summary={summary} onSeed={seed} />
          )}
          {step === "seeding" && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-nebula">
              <Zap size={14} className="animate-pulse" />
              30+ entity yazılıyor…
            </div>
          )}
          {step === "done" && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-quantum">
              <Check size={14} />
              Hazır. Dashboard&apos;a alıyorum…
            </div>
          )}
          {(step === "intro" || messages.length < 4) && step !== "ask-template" && (
            <div className="flex items-center justify-center text-[11px] text-text-faint">
              Oracle yazıyor…
            </div>
          )}
        </div>
      </footer>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Bubble + typing indicator
// ───────────────────────────────────────────────────────────────────────────

function Bubble({ who, text }: { who: "oracle" | "user"; text: string }) {
  return (
    <div className={cn("flex", who === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          who === "oracle"
            ? "border border-nebula/30 bg-nebula-soft/30 text-text"
            : "bg-ion text-void"
        )}
      >
        {who === "oracle" && (
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
// Input dock variants
// ───────────────────────────────────────────────────────────────────────────

function TemplatePicker({
  onPick,
}: {
  onPick: (t: (typeof TEMPLATE_CHOICES)[number]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {TEMPLATE_CHOICES.map((t) => (
        <button
          key={t.type}
          onClick={() => onPick(t)}
          className="group flex items-start gap-3 rounded-xl border border-border/60 bg-elevated/30 p-3 text-left transition-all hover:border-nebula/40 hover:bg-nebula-soft/20"
        >
          <span className="text-2xl leading-none">{t.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-text">{t.label}</div>
            <div className="mt-0.5 line-clamp-1 text-[11px] text-text-muted">{t.hint}</div>
          </div>
          <ArrowRight
            size={12}
            className="mt-1 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-nebula"
          />
        </button>
      ))}
    </div>
  );
}

function TextInput({
  placeholder,
  onSubmit,
  autoFocus,
}: {
  placeholder: string;
  onSubmit: (value: string) => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
        setValue("");
      }}
      className="flex items-center gap-2 rounded-xl border border-border/60 bg-elevated/40 px-3 py-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-faint"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-nebula px-3 py-1.5 text-xs font-medium text-void transition-all hover:bg-nebula/90 disabled:opacity-40"
      >
        Gönder
        <ArrowRight size={12} />
      </button>
    </form>
  );
}

function ChipPicker({
  choices,
  onPick,
}: {
  choices: { value: number; label: string }[];
  onPick: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {choices.map((c) => (
        <button
          key={c.value}
          onClick={() => onPick(c.value)}
          className="rounded-full border border-border/60 bg-elevated/40 px-4 py-1.5 text-sm text-text-muted transition-all hover:border-nebula/40 hover:bg-nebula-soft/30 hover:text-text"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

interface SummaryShape {
  template: AssetTemplate | undefined;
  name?: string;
  niche?: string;
  revenue?: number;
  hours?: number;
  capital?: number;
}

function SummaryCard({
  summary,
  onSeed,
}: {
  summary: SummaryShape;
  onSeed: () => void;
}) {
  return (
    <div className="rounded-xl border border-quantum/30 bg-quantum-soft/15 p-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-quantum">
        <Sparkles size={11} />
        Oracle&apos;ın özeti
      </div>
      <h3 className="mt-2 text-base font-medium text-text">
        {summary.template?.label} · {summary.name}
      </h3>
      <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
        Niş: <b className="text-text">{summary.niche}</b> · Hedef:{" "}
        <b className="text-text">${summary.revenue?.toLocaleString("en-US")}/ay (6 ay)</b>{" "}
        · Zaman: <b className="text-text">{summary.hours} saat/hafta</b> · Kapital:{" "}
        <b className="text-text">{summary.capital === 0 ? "Bootstrap" : `$${summary.capital}`}</b>
      </p>
      <p className="mt-3 text-[12px] leading-relaxed text-text">
        Sana şunu kuruyorum: <b>4 departman</b>, <b>~4 agent</b>, <b>~5 skill</b>,{" "}
        <b>3 workflow</b>, <b>4 OKR</b>, <b>4 ritüel</b>, <b>4 bütçe</b>, <b>~10 task</b>{" "}
        + 2 connector. 90 saniye sürer.
      </p>
      <div className="mt-3 flex justify-end">
        <button
          onClick={onSeed}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-quantum to-quantum/80 px-5 py-2 text-sm font-medium text-void shadow-[0_0_20px_rgba(61,224,168,0.3)] transition-all hover:shadow-[0_0_40px_rgba(61,224,168,0.5)] hover:scale-105"
        >
          <Zap size={13} />
          Hadi başla
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
