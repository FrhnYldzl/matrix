"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { analyzeIdea, type IdeaAnalysis } from "@/lib/idea-analyzer";
import { useWorkspaceStore } from "@/lib/store";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ExecutionBadge } from "./ExecutionBadge";
import { ResourceProfileCard } from "./ResourceProfileCard";
import {
  Brain,
  ChevronDown,
  Lightbulb,
  Rocket,
  Send,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";

const samples = [
  "Apartman yöneticileri için toplantı + aidat + bakım takip SaaS'ı",
  "Etsy için düğün davetiye şablonu mağazası",
  "Küçük ajanslara AI-destekli toplantı özetleme eklentisi",
  "Köpek sahipleri için aylık abonelik ödül kutusu",
  "Shopify brand: clean skincare DTC",
];

export function IdeaAnalyzer() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [result, setResult] = useState<IdeaAnalysis | null>(null);
  const { updateWorkspace, currentWorkspaceId } = useWorkspaceStore();

  const run = () => {
    if (!title.trim() && !desc.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      const r = analyzeIdea({ title: title.trim() || "İsimsiz fikir", description: desc.trim() });
      setResult(r);
      setAnalyzing(false);
    }, 900);
  };

  const applyVision = () => {
    if (!result) return;
    updateWorkspace(currentWorkspaceId, {
      mission: result.visionSuggestion.mission,
      vision: result.visionSuggestion.vision,
      strategicThemes: result.visionSuggestion.themes.map((t, i) => ({
        id: `st-idea-${i}-${Math.random().toString(36).slice(2, 5)}`,
        label: t.label,
        description: t.description,
        weight: t.weight,
      })),
    });
  };

  const reset = () => {
    setTitle("");
    setDesc("");
    setResult(null);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
      <div className="pointer-events-none absolute -top-10 right-1/3 h-40 w-[400px] rounded-full bg-nebula/15 blur-3xl" />
      <div className="pointer-events-none absolute -top-5 left-1/4 h-32 w-[320px] rounded-full bg-ion/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 border-b border-border/50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-nebula/40 bg-nebula-soft text-nebula shadow-[0_0_24px_rgba(155,123,255,0.3)]">
            <Brain size={20} strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              <Sparkles size={11} className="text-nebula" />
              Oracle Fikir Analizörü
            </div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-text">
              {result ? "Proje dosyan hazır" : "Ham fikrini yapıştır, Matrix proje dosyası çıkarsın"}
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              En yakın iş modeli + execution type + kaynak raporu + yol haritası + health score,
              tek ekranda.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="rounded-md border border-border/60 p-2 text-text-muted transition-colors hover:text-text self-start lg:self-auto"
        >
          <ChevronDown
            size={14}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>

      {expanded && (
        <div className="relative p-5">
          {/* Input row */}
          {!result && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  Fikir başlığı
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ör. Apartman yöneticileri için SaaS"
                  className="mt-1 w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm text-text outline-none focus:border-nebula/50"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  Kısa açıklama
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="2-3 cümle: kim için, hangi problemi, nasıl çözüyor, nereden para geliyor?"
                  className="mt-1 w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm text-text outline-none focus:border-nebula/50 resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-text-faint">
                  <Lightbulb size={11} />
                  <span>Örnek:</span>
                  {samples.slice(0, 2).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTitle(s)}
                      className="rounded-md border border-border/50 bg-elevated/40 px-2 py-0.5 text-[11px] text-text-muted hover:border-border-strong hover:text-text"
                    >
                      {s.slice(0, 36)}…
                    </button>
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="gap-1.5"
                  onClick={run}
                  disabled={analyzing || (!title.trim() && !desc.trim())}
                >
                  {analyzing ? (
                    <>
                      <Wand2 size={14} className="animate-spin" />
                      Analiz ediliyor…
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Oracle'a gönder
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <IdeaReport
              result={result}
              onReset={reset}
              onApplyVision={applyVision}
            />
          )}
        </div>
      )}
    </Card>
  );
}

// =============================================================================
// Report
// =============================================================================

function verdictMeta(v: IdeaAnalysis["verdict"]) {
  switch (v) {
    case "go":
      return {
        label: "Başla",
        cls: "text-quantum border-quantum/40 bg-quantum-soft",
        accent: "quantum" as const,
      };
    case "promising":
      return {
        label: "Umut Verici",
        cls: "text-ion border-ion/40 bg-ion-soft",
        accent: "ion" as const,
      };
    case "needs-work":
      return {
        label: "Geliştir",
        cls: "text-solar border-solar/40 bg-solar-soft",
        accent: "solar" as const,
      };
    case "skip":
      return {
        label: "Atla",
        cls: "text-crimson border-crimson/40 bg-crimson-soft",
        accent: "crimson" as const,
      };
  }
}

function IdeaReport({
  result,
  onReset,
  onApplyVision,
}: {
  result: IdeaAnalysis;
  onReset: () => void;
  onApplyVision: () => void;
}) {
  const v = verdictMeta(result.verdict);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-elevated/30 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            <Sparkles size={10} className="text-nebula" />
            Oracle özeti
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-text">{result.summary}</p>
          <div className="mt-2 text-xs text-text-muted">
            <span className="font-mono text-text-faint">Fikir:</span>{" "}
            <b className="text-text">"{result.input.title}"</b>
            {result.input.description && (
              <span className="text-text-muted">
                {" — "}
                {result.input.description.slice(0, 120)}
                {result.input.description.length > 120 ? "…" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-text-muted hover:text-text"
          >
            <X size={11} />
            Yeni fikir
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBlock
          label="Matrix Skoru"
          value={`%${result.healthScore}`}
          tone={v.accent}
          tag={v.label}
        />
        <StatBlock
          label="Eşleşme Güveni"
          value={`%${result.matchConfidence}`}
          tone="ion"
          tag={result.matchedModel.name}
        />
        <StatBlock
          label="Execution"
          value={execLabel(result.executionType)}
          tone={
            result.executionType === "digital-only"
              ? "ion"
              : result.executionType === "hybrid"
              ? "nebula"
              : "solar"
          }
          tag={`%${result.digitalRevenueShare} dijital`}
        />
        <StatBlock
          label="Sermaye"
          value={result.resourceProfile.capital.level}
          tone={
            result.resourceProfile.capital.level === "none"
              ? "quantum"
              : result.resourceProfile.capital.level === "low"
              ? "ion"
              : result.resourceProfile.capital.level === "medium"
              ? "solar"
              : "crimson"
          }
          tag={
            result.resourceProfile.capital.minUsd != null
              ? `$${result.resourceProfile.capital.minUsd.toLocaleString()}-$${(
                  result.resourceProfile.capital.maxUsd ?? 0
                ).toLocaleString()}`
              : ""
          }
        />
      </div>

      {/* Matched model */}
      <Card className="relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-ion" />
            <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
              En Yakın Model
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <ExecutionBadge
              type={result.executionType}
              digitalShare={result.digitalRevenueShare}
              compact
            />
            <Badge tone="ion">%{result.matchConfidence} güven</Badge>
          </div>
        </div>
        <div className="p-5">
          <div className="text-lg font-semibold text-text">{result.matchedModel.name}</div>
          <p className="mt-1 text-sm text-text-muted">{result.matchedModel.tagline}</p>
          <div className="mt-2 text-xs text-text-muted">
            <span className="font-mono text-text-faint">North Star:</span>{" "}
            <span className="text-text">{result.matchedModel.northStar}</span>
          </div>
          {result.alternativeModels.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-text-faint">
              <span className="font-mono uppercase tracking-wider">Alternatifler:</span>
              {result.alternativeModels.map((a) => (
                <span
                  key={a.model.id}
                  className="rounded border border-border/50 bg-elevated/50 px-2 py-0.5 text-text-muted"
                >
                  {a.model.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Health axes */}
      <Card>
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-nebula" />
            <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
              Fikir Sağlığı · 6 Eksen
            </h3>
          </div>
          <span className={cn("font-mono text-sm font-semibold", v.cls.split(" ")[0])}>
            %{result.healthScore} · {v.label}
          </span>
        </div>
        <div className="space-y-3 p-5">
          {result.healthAxes.map((a) => {
            const tone =
              a.score >= 75
                ? "quantum"
                : a.score >= 60
                ? "ion"
                : a.score >= 45
                ? "solar"
                : "crimson";
            return (
              <div key={a.key}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-text font-medium">{a.label}</span>
                  <span
                    className={cn(
                      "font-mono tabular-nums",
                      tone === "quantum" && "text-quantum",
                      tone === "ion" && "text-ion",
                      tone === "solar" && "text-solar",
                      tone === "crimson" && "text-crimson"
                    )}
                  >
                    %{a.score}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      tone === "quantum" && "bg-quantum",
                      tone === "ion" && "bg-ion",
                      tone === "solar" && "bg-solar",
                      tone === "crimson" && "bg-crimson"
                    )}
                    style={{ width: `${a.score}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-text-muted">{a.rationale}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Resource profile */}
      <ResourceProfileCard profile={result.resourceProfile} />

      {/* Roadmap */}
      <Card>
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Rocket size={14} className="text-ion" />
            <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
              Yol Haritası
            </h3>
          </div>
        </div>
        <ol className="space-y-3 p-5">
          {result.roadmap.map((step, i) => {
            const phaseTone =
              step.phase === "validate"
                ? "solar"
                : step.phase === "build"
                ? "ion"
                : step.phase === "launch"
                ? "nebula"
                : "quantum";
            return (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md border border-border/60 bg-elevated/40 px-4 py-3"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold",
                    phaseTone === "solar" && "bg-solar-soft text-solar",
                    phaseTone === "ion" && "bg-ion-soft text-ion",
                    phaseTone === "nebula" && "bg-nebula-soft text-nebula",
                    phaseTone === "quantum" && "bg-quantum-soft text-quantum"
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={phaseTone}>{step.phase}</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                      {step.month}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-text">{step.action}</div>
                  <div className="mt-0.5 text-[11px] text-text-muted">
                    <span className="font-mono">Çıktı:</span> {step.deliverable}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Go / No-Go */}
      <Card>
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-solar" />
            <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
              Başlamadan Önce Cevapla
            </h3>
          </div>
        </div>
        <ul className="space-y-2 p-5">
          {result.goNoGo.map((q, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-md border border-border/60 bg-elevated/40 px-3 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-solar-soft font-mono text-[11px] font-semibold text-solar">
                {i + 1}
              </span>
              <span className="text-sm text-text leading-relaxed">{q}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Related blueprints */}
      {result.relatedBlueprints.length > 0 && (
        <Card>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Rocket size={14} className="text-ion" />
              <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                Bu Fikir İçin Önerilen Blueprint'ler
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
            {result.relatedBlueprints.map((bp) => (
              <Link
                key={bp.id}
                href="/blueprints"
                className="group rounded-lg border border-border/60 bg-elevated/40 p-4 transition-all hover:border-ion/40 hover:bg-elevated/70"
              >
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
                  <Rocket size={10} />
                  Blueprint
                </div>
                <div className="mt-2 text-sm font-medium text-text">{bp.displayName}</div>
                <div className="mt-1 text-xs text-text-muted line-clamp-2">{bp.summary}</div>
                <div className="mt-2 font-mono text-[10px] text-text-faint">
                  {bp.agents.length} agent · {bp.skills.length} skill · {bp.workflows.length} workflow
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Vision apply CTA */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
        <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              <Lightbulb size={10} className="text-nebula" />
              Vision şablonu hazır
            </div>
            <div className="mt-2 text-sm text-text leading-relaxed">
              <b className="text-text">Misyon:</b> {result.visionSuggestion.mission}
            </div>
            <div className="mt-1 text-sm text-text leading-relaxed">
              <b className="text-text">Vizyon:</b> {result.visionSuggestion.vision}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {result.visionSuggestion.themes.map((t) => (
                <span
                  key={t.label}
                  className="rounded border border-nebula/30 bg-nebula-soft/40 px-2 py-0.5 font-mono text-[10px] text-nebula"
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="primary" size="md" className="gap-1.5" onClick={onApplyVision}>
              <Lightbulb size={14} />
              Vision'a uygula
            </Button>
            <Link href="/vision">
              <Button variant="secondary" size="md">
                Vision aç
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone,
  tag,
}: {
  label: string;
  value: string | number;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  tag?: string;
}) {
  const cls =
    tone === "ion"
      ? "border-ion/30 bg-ion-soft text-ion"
      : tone === "nebula"
      ? "border-nebula/30 bg-nebula-soft text-nebula"
      : tone === "quantum"
      ? "border-quantum/30 bg-quantum-soft text-quantum"
      : tone === "solar"
      ? "border-solar/30 bg-solar-soft text-solar"
      : "border-crimson/30 bg-crimson-soft text-crimson";
  return (
    <div className={cn("rounded-lg border px-3 py-3", cls)}>
      <div className="font-mono text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-1 text-lg font-semibold capitalize tabular-nums">{value}</div>
      {tag && <div className="mt-0.5 text-[10px] opacity-75 truncate">{tag}</div>}
    </div>
  );
}

function execLabel(t: IdeaAnalysis["executionType"]) {
  return t === "digital-only" ? "Dijital" : t === "hybrid" ? "Hibrit" : "Fiziksel";
}
