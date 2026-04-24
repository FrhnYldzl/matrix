"use client";

/**
 * The Codex — Matrix'in canonical knowledge compendium'u.
 *
 * Her modül için: ne · niçin · nasıl · tipik kullanım · crossover.
 * User Guide olarak /codex route'unda. Sol'da module navigator,
 * sağ'da seçili modülün detayı. Arama + grup filter.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  CODEX,
  groupMeta,
  MATRIX_FLOW,
  flowPhaseMeta,
  type CodexEntry,
  type FlowStep,
} from "@/lib/codex";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote } from "../brand/MatrixQuote";
import {
  ArrowRight,
  BookOpenCheck,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  HelpCircle,
  Layers,
  Link as LinkIcon,
  Search,
  Sparkles,
} from "lucide-react";

type CodexView = "flow" | "modules";

export function CodexPage() {
  const [view, setView] = useState<CodexView>("flow");
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string>("construct");

  const filtered = useMemo(() => {
    if (!query.trim()) return CODEX;
    const q = query.toLowerCase();
    return CODEX.filter(
      (e) =>
        e.matrixName.toLowerCase().includes(q) ||
        e.subLabel.toLowerCase().includes(q) ||
        e.oneLiner.toLowerCase().includes(q) ||
        e.useCases.some((uc) => uc.toLowerCase().includes(q))
    );
  }, [query]);

  const selected = CODEX.find((e) => e.slug === selectedSlug) ?? CODEX[0];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="nebula" opacity={0.09} />
        <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-[500px] rounded-full bg-nebula/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-ion/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <BookOpenCheck size={12} className="text-nebula" />
            The Codex · User Guide · Matrix Manual
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            Her modül · ne, niçin, nasıl kullanılır.
          </h1>
          <p className="mt-3 max-w-3xl text-base text-text-muted leading-relaxed">
            Matrix'in {CODEX.length} modülünün canonical kılavuzu. Her kart bir
            modülü açıklar — <b className="text-text">Matrix universe referansı</b>,{" "}
            <b className="text-text">tek-cümle özet</b>,{" "}
            <b className="text-text">adım adım kullanım</b>,{" "}
            <b className="text-text">tipik senaryolar</b> ve{" "}
            <b className="text-text">crossover modüller</b>.
          </p>

          <div className="relative mt-6 max-w-2xl">
            <MatrixQuote speaker="Morpheus" tone="nebula">
              I can only show you the door. You're the one that has to walk through it.
            </MatrixQuote>
          </div>
        </div>
      </section>

      {/* View switcher */}
      <div className="sticky top-14 z-10 flex items-center gap-2 border-b border-border/60 bg-void/70 px-8 py-3 backdrop-blur-md">
        <button
          onClick={() => setView("flow")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-all",
            view === "flow"
              ? "border-nebula/40 bg-nebula-soft text-nebula shadow-inner"
              : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
          )}
        >
          <Compass size={13} />
          Matrix Flow · uçtan uca akış
        </button>
        <button
          onClick={() => setView("modules")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-all",
            view === "modules"
              ? "border-ion/40 bg-ion-soft text-ion shadow-inner"
              : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
          )}
        >
          <Layers size={13} />
          Modüller · detay rehber ({CODEX.length})
        </button>
      </div>

      {/* Flow view */}
      {view === "flow" && <FlowView />}

      {/* Modules view */}
      {view === "modules" && (
      <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-[320px_1fr]">
        {/* ──── LEFT · Navigator ──── */}
        <aside className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface/70 px-3 py-2 backdrop-blur-md">
              <Search size={13} className="text-text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Modül ara (ne yapar, nasıl…)"
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-surface/70 backdrop-blur-md">
              {(Object.keys(groupMeta) as CodexEntry["group"][]).map((g) => {
                const items = filtered.filter((e) => e.group === g);
                if (items.length === 0) return null;
                return (
                  <div
                    key={g}
                    className="border-b border-border/40 last:border-b-0"
                  >
                    <div className="px-4 py-2.5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                        {groupMeta[g].label}
                      </div>
                    </div>
                    <ul className="pb-2">
                      {items.map((entry) => (
                        <li key={entry.slug}>
                          <button
                            onClick={() => setSelectedSlug(entry.slug)}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                              entry.slug === selectedSlug
                                ? "bg-elevated/60"
                                : "hover:bg-elevated/30"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                                accentTone(entry.accent)
                              )}
                            >
                              <entry.icon size={12} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-text">
                                {entry.matrixName}
                              </div>
                              <div className="truncate font-mono text-[10px] text-text-faint">
                                {entry.subLabel}
                              </div>
                            </div>
                            {entry.slug === selectedSlug && (
                              <ChevronRight
                                size={12}
                                className={cn("shrink-0", accentText(entry.accent))}
                              />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-6 text-center">
                  <div className="font-mono text-[10px] text-text-faint">
                    sonuç yok — farklı bir arama dene
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ──── RIGHT · Detail ──── */}
        <section>
          <DetailView entry={selected} />
        </section>
      </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOW VIEW — uçtan uca Matrix kullanım akışı
// ═══════════════════════════════════════════════════════════════════════════

function FlowView() {
  const phases: FlowStep["phase"][] = ["zero", "setup", "operate", "analyze", "repeat"];

  return (
    <div className="space-y-8 px-8 py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm leading-relaxed text-text-muted">
          Matrix'i uçtan uca nasıl kullanırsın? Aşağıdaki 13 adım yeni bir
          workspace (asset) eklemekten haftalık disipline + portföy büyütmeye
          kadar tüm yolculuk. Her adım ilgili modülü açar — takılı kaldığın
          yerde o modülün tam detayı için <b className="text-text">Modüller</b> sekmesine geç.
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-10">
        {phases.map((phase) => {
          const phaseSteps = MATRIX_FLOW.filter((s) => s.phase === phase);
          if (phaseSteps.length === 0) return null;
          const meta = flowPhaseMeta[phase];
          return (
            <section key={phase} className="relative">
              <PhaseHeader label={meta.label} tone={meta.tone} />
              <ol className="mt-4 space-y-3">
                {phaseSteps.map((step, idx) => (
                  <FlowStepCard
                    key={step.order}
                    step={step}
                    tone={meta.tone}
                    isLast={idx === phaseSteps.length - 1}
                  />
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function PhaseHeader({
  label,
  tone,
}: {
  label: string;
  tone: "nebula" | "solar" | "ion" | "quantum" | "crimson";
}) {
  const cls = accentText(tone);
  const borderCls = accentBorder(tone);
  return (
    <div className={cn("flex items-center gap-3 border-b pb-2", borderCls)}>
      <span className={cn("font-mono text-[11px] uppercase tracking-[0.22em] font-semibold", cls)}>
        {label}
      </span>
      <span className="h-px flex-1 bg-border/40" />
    </div>
  );
}

function FlowStepCard({
  step,
  tone,
  isLast,
}: {
  step: FlowStep;
  tone: "nebula" | "solar" | "ion" | "quantum" | "crimson";
  isLast: boolean;
}) {
  const primaryModule = CODEX.find((e) => e.slug === step.modules[0]);

  return (
    <li className="flex gap-4">
      {/* Rail */}
      <div className="flex shrink-0 flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[11px] font-semibold",
            accentTone(tone)
          )}
        >
          {step.order}
        </div>
        {!isLast && <div className="mt-1 h-full w-px bg-border/40" />}
      </div>

      {/* Card */}
      <article
        className={cn(
          "mb-3 flex-1 overflow-hidden rounded-lg border bg-surface/70 backdrop-blur-md transition-colors hover:border-border-strong",
          "border-border/60"
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-text">
                {step.title}
              </h3>
              <div className={cn("mt-0.5 font-mono text-[10px] uppercase tracking-wider", accentText(tone))}>
                {step.subtitle}
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border/60 bg-elevated/40 px-2 py-0.5 font-mono text-[10px] text-text-muted">
              <Clock size={9} />
              {step.durationLabel}
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
            {step.description}
          </p>

          {/* Related modules */}
          {step.modules.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
                modüller
              </span>
              {step.modules.map((slug) => {
                const mod = CODEX.find((e) => e.slug === slug);
                if (!mod) return null;
                return (
                  <Link
                    key={slug}
                    href={mod.href ?? "#"}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] transition-colors hover:bg-elevated/40",
                      accentBorder(mod.accent),
                      accentText(mod.accent)
                    )}
                  >
                    <mod.icon size={9} />
                    {mod.matrixName}
                  </Link>
                );
              })}
              {primaryModule?.href && (
                <Link
                  href={primaryModule.href}
                  className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-text-muted hover:text-text"
                >
                  Hemen git
                  <ArrowRight size={10} />
                </Link>
              )}
            </div>
          )}
        </div>
      </article>
    </li>
  );
}

function DetailView({ entry }: { entry: CodexEntry }) {
  return (
    <article className="rounded-2xl border border-border/60 bg-surface/70 backdrop-blur-md">
      {/* Header */}
      <div
        className={cn(
          "relative overflow-hidden border-b border-border/50 p-6",
          `bg-gradient-to-br ${gradientBg(entry.accent)}`
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px",
            `bg-gradient-to-r from-transparent via-${entry.accent}/60 to-transparent`
          )}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border",
                accentTone(entry.accent)
              )}
            >
              <entry.icon size={22} />
            </div>
            <div>
              <div
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.22em]",
                  accentText(entry.accent)
                )}
              >
                {entry.subLabel}
              </div>
              <h2 className="mt-1 text-2xl font-semibold text-text">
                {entry.matrixName}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
                {entry.oneLiner}
              </p>
            </div>
          </div>
          {entry.href && (
            <Link
              href={entry.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                accentBorder(entry.accent),
                accentText(entry.accent),
                "hover:bg-elevated/40"
              )}
            >
              <ExternalLink size={11} />
              modülü aç
            </Link>
          )}
        </div>

        {/* Matrix reference quote */}
        <div className="mt-4 rounded-lg border border-border/40 bg-void/40 p-3 font-mono text-[11px] italic leading-relaxed text-text-muted">
          <Sparkles
            size={10}
            className={cn("mr-1.5 inline", accentText(entry.accent))}
          />
          {entry.matrixReference}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6 p-6">
        <Section title="Ne?" accent={entry.accent}>
          <p className="text-sm leading-relaxed text-text">{entry.what}</p>
        </Section>

        <Section title="Niçin var?" accent={entry.accent}>
          <p className="text-sm leading-relaxed text-text">{entry.why}</p>
        </Section>

        <Section title="Nasıl kullanılır?" accent={entry.accent}>
          <ol className="space-y-2 text-sm">
            {entry.howToUse.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-semibold",
                    accentTone(entry.accent)
                  )}
                >
                  {idx + 1}
                </span>
                <span className="leading-relaxed text-text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Tipik kullanım senaryoları" accent={entry.accent}>
          <ul className="space-y-1.5 text-sm">
            {entry.useCases.map((uc, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-text-muted leading-relaxed"
              >
                <ArrowRight
                  size={12}
                  className={cn("mt-1 shrink-0", accentText(entry.accent))}
                />
                <span>{uc}</span>
              </li>
            ))}
          </ul>
        </Section>

        {entry.relatesTo.length > 0 && (
          <Section title="Crossover modüller" accent={entry.accent}>
            <div className="flex flex-wrap gap-1.5">
              {entry.relatesTo.map((rel) => (
                <span
                  key={rel}
                  className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-elevated/50 px-2 py-1 font-mono text-[11px] text-text-muted"
                >
                  <LinkIcon size={9} />
                  {rel}
                </span>
              ))}
            </div>
          </Section>
        )}

        {entry.slug === "oracle" && (
          <div className="rounded-lg border border-nebula/30 bg-nebula-soft/20 p-3 text-[11px] leading-relaxed text-text">
            <HelpCircle
              size={11}
              className="mr-1.5 inline text-nebula"
            />
            <b className="text-text">İpucu:</b> Oracle sidebar'da değil — sağ
            üst köşedeki <span className="font-mono text-nebula">"Oracle · 17"</span>{" "}
            butonuna tıkla, full-screen drawer açılır. ESC ile kapat.
          </div>
        )}
      </div>
    </article>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: CodexEntry["accent"];
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-2 font-mono text-[10px] uppercase tracking-[0.22em]",
          accentText(accent)
        )}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Styling helpers ──────────────────────────────────────────────────────

function accentTone(accent: CodexEntry["accent"]): string {
  switch (accent) {
    case "ion":
      return "border-ion/40 bg-ion-soft text-ion";
    case "nebula":
      return "border-nebula/40 bg-nebula-soft text-nebula";
    case "quantum":
      return "border-quantum/40 bg-quantum-soft text-quantum";
    case "solar":
      return "border-solar/40 bg-solar-soft text-solar";
    case "crimson":
      return "border-crimson/40 bg-crimson-soft text-crimson";
  }
}

function accentText(accent: CodexEntry["accent"]): string {
  switch (accent) {
    case "ion":
      return "text-ion";
    case "nebula":
      return "text-nebula";
    case "quantum":
      return "text-quantum";
    case "solar":
      return "text-solar";
    case "crimson":
      return "text-crimson";
  }
}

function accentBorder(accent: CodexEntry["accent"]): string {
  switch (accent) {
    case "ion":
      return "border-ion/40";
    case "nebula":
      return "border-nebula/40";
    case "quantum":
      return "border-quantum/40";
    case "solar":
      return "border-solar/40";
    case "crimson":
      return "border-crimson/40";
  }
}

function gradientBg(accent: CodexEntry["accent"]): string {
  switch (accent) {
    case "ion":
      return "from-ion-soft/20 to-transparent";
    case "nebula":
      return "from-nebula-soft/20 to-transparent";
    case "quantum":
      return "from-quantum-soft/20 to-transparent";
    case "solar":
      return "from-solar-soft/20 to-transparent";
    case "crimson":
      return "from-crimson-soft/20 to-transparent";
  }
}
