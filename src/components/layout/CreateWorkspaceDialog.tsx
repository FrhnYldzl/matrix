"use client";

/**
 * CreateWorkspaceDialog — "Yeni şirket / proje ekle" wizard.
 *
 * 3-step flow:
 *   1. Oracle's Picks — portföyündeki boşluğa göre 2-3 contextual öneri
 *   2. Kategori + template seçimi (13 asset türü, 5 kategori)
 *   3. Detay formu (isim, kısa kod, sektör, accent)
 *
 * TopBar'ın `backdrop-blur-xl`'si fixed positioning'i kırıyordu —
 * createPortal ile document.body'ye render edilir.
 */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import { Button } from "../ui/Button";
import { toast } from "@/lib/toast";
import type { Workspace } from "@/lib/types";
import {
  ASSET_TEMPLATES,
  categoryLabels,
  oraclePicksForPortfolio,
  type AssetCategory,
  type AssetTemplate,
} from "@/lib/asset-templates";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  Rocket,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

const ACCENT_OPTIONS: Array<{ value: "ion" | "nebula" | "quantum" | "solar"; label: string }> = [
  { value: "ion", label: "Ion · Mavi" },
  { value: "nebula", label: "Nebula · Mor" },
  { value: "quantum", label: "Quantum · Yeşil" },
  { value: "solar", label: "Solar · Turuncu" },
];

type Step = "picks" | "browse" | "detail";

export function CreateWorkspaceDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  /** Workspace yaratıldıktan sonra parent'a workspace + template verilir — Oracle onboarding için */
  onSuccess?: (workspace: Workspace, template: AssetTemplate) => void;
}) {
  const { createWorkspace, setWorkspace, workspaces } = useWorkspaceStore();
  const [step, setStep] = useState<Step>("picks");
  const [template, setTemplate] = useState<AssetTemplate | null>(null);
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [mounted, setMounted] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [industry, setIndustry] = useState("");
  const [accent, setAccent] = useState<"ion" | "nebula" | "quantum" | "solar">("ion");
  const [submitting, setSubmitting] = useState(false);

  // Oracle's Picks — contextual recommendations based on current portfolio
  const oraclePicks = useMemo(
    () => oraclePicksForPortfolio(workspaces.map((w) => w.industry)),
    [workspaces]
  );

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const reset = () => {
    setStep("picks");
    setTemplate(null);
    setCategory("all");
    setName("");
    setShortName("");
    setIndustry("");
    setAccent("ion");
    setSubmitting(false);
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const selectTemplate = (t: AssetTemplate) => {
    setTemplate(t);
    setIndustry(t.defaultIndustry);
    setAccent(t.accent);
    setStep("detail");
  };

  const deriveShortName = (full: string): string => {
    const parts = full.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return full.trim().slice(0, 2).toUpperCase();
  };

  const submit = () => {
    if (!template || !name.trim()) return;
    setSubmitting(true);
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const sn = shortName.trim() || deriveShortName(name);

    const workspace: Workspace = {
      id: `ws-${slug}-${Date.now().toString(36)}`,
      name: name.trim(),
      shortName: sn,
      industry: industry.trim() || template.defaultIndustry,
      mission: template.mission,
      vision: template.vision,
      strategicThemes: template.themes.map((t, i) => ({
        id: `st-${slug}-${i}`,
        label: t.label,
        description: t.description,
        weight: t.weight,
      })),
      valueAnchors: [
        {
          id: `va-${slug}-1`,
          label: "İnsan son kararı verir",
          description: "External-send scope'u her zaman onay gerektirir.",
        },
      ],
      accent,
      createdAt: new Date().toISOString(),
    };

    createWorkspace(
      { entity: workspace, origin: "manual", createdAt: workspace.createdAt },
      `create-workspace:${template.type}`
    );
    setWorkspace(workspace.id);

    // Gamification — celebrate XP milestones
    const isFirst = workspaces.length === 0;
    const isSecond = workspaces.length === 1;
    const isThird = workspaces.length === 2;

    toast({
      tone: "quantum",
      title: isFirst
        ? "İlk workspace · Operator rank!"
        : isSecond
        ? "Portföy başladı · +250 XP"
        : isThird
        ? "Freeborn! 3. workspace · +400 XP"
        : `${workspace.name} eklendi`,
      description: isFirst
        ? `"Every key is a door." — The Keymaker. Oracle hemen birkaç soru sorup kişisel kurulumunu yapacak.`
        : `${template.label} template'iyle kuruldu. Oracle hemen onboarding interview'ına başlıyor.`,
    });

    setSubmitting(false);

    // Parent'a handoff — Oracle onboarding flow'una geçiş için workspace + template
    if (onSuccess) {
      onSuccess(workspace, template);
    }
    closeAndReset();
  };

  if (!open || !mounted) return null;

  const filtered =
    category === "all"
      ? ASSET_TEMPLATES
      : ASSET_TEMPLATES.filter((t) => t.category === category);

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        onClick={closeAndReset}
        aria-label="Kapat"
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
      />
      <div className="relative flex max-h-[92vh] w-[min(880px,96vw)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface/95 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-border/60 p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
                <Sparkles size={11} className="text-nebula" />
                Yeni dijital varlık · holdco portföyü
              </div>
              <h2 className="mt-1 text-xl font-semibold text-text">
                {step === "picks"
                  ? "Oracle'ın sana önerdiği asset'ler"
                  : step === "browse"
                  ? "Tüm template'ler"
                  : `${template?.label} — detaylar`}
              </h2>
            </div>
            <button
              onClick={closeAndReset}
              className="rounded-md p-1.5 text-text-muted hover:bg-elevated hover:text-text"
              aria-label="Kapat"
            >
              <X size={14} />
            </button>
          </div>

          {/* Step pills */}
          <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
            <StepPill
              active={step === "picks"}
              done={step !== "picks"}
              label="1 · Oracle"
              onClick={() => setStep("picks")}
            />
            <span className="text-text-faint">·</span>
            <StepPill
              active={step === "browse"}
              done={step === "detail"}
              label="2 · Template"
              onClick={() => setStep("browse")}
            />
            <span className="text-text-faint">·</span>
            <StepPill active={step === "detail"} done={false} label="3 · Detay" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "picks" && (
            <PicksStep
              picks={oraclePicks}
              onSelect={selectTemplate}
              onBrowseAll={() => setStep("browse")}
            />
          )}

          {step === "browse" && (
            <BrowseStep
              category={category}
              setCategory={setCategory}
              templates={filtered}
              onSelect={selectTemplate}
              onBackToPicks={() => setStep("picks")}
            />
          )}

          {step === "detail" && template && (
            <DetailStep
              template={template}
              name={name}
              setName={setName}
              shortName={shortName}
              setShortName={setShortName}
              industry={industry}
              setIndustry={setIndustry}
              accent={accent}
              setAccent={setAccent}
              submitting={submitting}
              onSubmit={submit}
              onBack={() => setStep("browse")}
              onCancel={closeAndReset}
              deriveShortName={deriveShortName}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

// ───────────────────────────────────────────────────────────────────────────
// Step 1 — Oracle's Picks
// ───────────────────────────────────────────────────────────────────────────

function PicksStep({
  picks,
  onSelect,
  onBrowseAll,
}: {
  picks: ReturnType<typeof oraclePicksForPortfolio>;
  onSelect: (t: AssetTemplate) => void;
  onBrowseAll: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-nebula/30 bg-nebula-soft/20 p-3">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-nebula" />
        <p className="text-[12px] leading-relaxed text-text-muted">
          Oracle mevcut portföyüne bakarak <b className="text-text">{picks.length} asset</b> önerdi.
          Seçersen direkt seed DNA + template ile kurulur. Veya{" "}
          <button
            onClick={onBrowseAll}
            className="font-mono text-nebula hover:text-text underline underline-offset-2"
          >
            tüm {ASSET_TEMPLATES.length} template'i
          </button>{" "}
          tek tek gezebilirsin.
        </p>
      </div>

      <div className="space-y-3">
        {picks.map((pick, idx) => (
          <OraclePickCard
            key={pick.template.type}
            pick={pick}
            rank={idx + 1}
            onSelect={() => onSelect(pick.template)}
          />
        ))}
      </div>

      <div className="flex items-center justify-center border-t border-border/40 pt-4">
        <button
          onClick={onBrowseAll}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted hover:text-text"
        >
          Tüm template'leri gez
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

function OraclePickCard({
  pick,
  rank,
  onSelect,
}: {
  pick: { template: AssetTemplate; reason: string; priority: "high" | "medium" | "low" };
  rank: number;
  onSelect: () => void;
}) {
  const { template: t, reason, priority } = pick;
  const Icon = t.icon;
  const priorityCls =
    priority === "high"
      ? "border-crimson/30 bg-crimson-soft/30 text-crimson"
      : priority === "medium"
      ? "border-solar/30 bg-solar-soft/30 text-solar"
      : "border-border/50 bg-elevated/50 text-text-muted";

  return (
    <button
      onClick={onSelect}
      className="group flex w-full items-start gap-3 rounded-xl border border-border/60 bg-surface/60 p-4 text-left transition-all hover:border-nebula/40 hover:bg-nebula-soft/10"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
          accentBorder(t.accent),
          accentBg(t.accent),
          accentText(t.accent)
        )}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-nebula">
            Oracle · {rank}
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-px font-mono text-[9px] uppercase tracking-wider",
              priorityCls
            )}
          >
            {priority}
          </span>
        </div>
        <h3 className="mt-1 text-sm font-semibold text-text">{t.label}</h3>
        <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">
          {t.tagline}
        </p>
        <div className="mt-2 rounded-md border border-nebula/20 bg-nebula-soft/15 px-2.5 py-1.5 text-[11px] leading-relaxed text-text">
          <Sparkles size={9} className="mr-1 inline text-nebula" />
          <b className="text-nebula">Oracle:</b> {reason}
        </div>
        <EncourageStrip template={t} />
      </div>
      <ArrowRight
        size={14}
        className="mt-1 shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-text"
      />
    </button>
  );
}

function EncourageStrip({ template: t }: { template: AssetTemplate }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-text-faint">
      {t.typicalMrrBand !== "—" && (
        <span className="inline-flex items-center gap-1">
          <Coins size={9} className="text-solar" />
          {t.typicalMrrBand}
        </span>
      )}
      {t.typicalMultiple !== "—" && (
        <span className="inline-flex items-center gap-1">
          <TrendingUp size={9} className="text-quantum" />
          {t.typicalMultiple}
        </span>
      )}
      {t.timeToFirstDollar !== "—" && (
        <span>ilk $: {t.timeToFirstDollar}</span>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Step 2 — Browse all templates
// ───────────────────────────────────────────────────────────────────────────

function BrowseStep({
  category,
  setCategory,
  templates,
  onSelect,
  onBackToPicks,
}: {
  category: AssetCategory | "all";
  setCategory: (c: AssetCategory | "all") => void;
  templates: AssetTemplate[];
  onSelect: (t: AssetTemplate) => void;
  onBackToPicks: () => void;
}) {
  const categories: Array<AssetCategory | "all"> = [
    "all",
    "software",
    "content",
    "commerce",
    "service",
    "custom",
  ];

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={onBackToPicks}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-text-muted hover:text-text"
        >
          <ArrowLeft size={11} />
          Oracle
        </button>
        <span className="text-text-faint">·</span>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
              category === c
                ? "border-nebula/40 bg-nebula-soft text-nebula"
                : "border-border/60 bg-transparent text-text-muted hover:text-text"
            )}
          >
            {c === "all" ? `Hepsi (${ASSET_TEMPLATES.length})` : categoryLabels[c]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {templates.map((t) => (
          <TemplateCard key={t.type} template={t} onSelect={() => onSelect(t)} />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template: t,
  onSelect,
}: {
  template: AssetTemplate;
  onSelect: () => void;
}) {
  const Icon = t.icon;
  return (
    <button
      onClick={onSelect}
      className="group flex items-start gap-3 rounded-lg border border-border/60 bg-elevated/30 p-3.5 text-left transition-colors hover:border-border-strong hover:bg-elevated/60"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
          accentBorder(t.accent),
          accentBg(t.accent),
          accentText(t.accent)
        )}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-text">{t.label}</div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted line-clamp-2">
          {t.tagline}
        </p>
        {t.typicalMrrBand !== "—" && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[9px] text-text-faint">
            <span className="text-text-muted">{t.typicalMrrBand}</span>
            <span>·</span>
            <span>{t.typicalMultiple}</span>
          </div>
        )}
      </div>
      <ArrowRight
        size={13}
        className="mt-1 shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-text"
      />
    </button>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Step 3 — Detail
// ───────────────────────────────────────────────────────────────────────────

function DetailStep({
  template,
  name,
  setName,
  shortName,
  setShortName,
  industry,
  setIndustry,
  accent,
  setAccent,
  submitting,
  onSubmit,
  onBack,
  onCancel,
  deriveShortName,
}: {
  template: AssetTemplate;
  name: string;
  setName: (v: string) => void;
  shortName: string;
  setShortName: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  accent: "ion" | "nebula" | "quantum" | "solar";
  setAccent: (v: "ion" | "nebula" | "quantum" | "solar") => void;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onCancel: () => void;
  deriveShortName: (s: string) => string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      {/* Chosen template summary */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border p-3",
          accentBorder(template.accent),
          accentBg(template.accent)
        )}
      >
        <template.icon size={16} className={cn("mt-0.5 shrink-0", accentText(template.accent))} />
        <div className="flex-1">
          <div className="text-sm font-medium text-text">{template.label}</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
            <b className="text-text">{template.encouragement}</b>
          </p>
          <div className="mt-1.5 font-mono text-[10px] text-text-faint">
            {template.marketplaceEvidence}
          </div>
        </div>
      </div>

      <FormField label="İsim" hint="Örn: Juris · SaaS, AI Matrix Newsletter">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workspace'in tam adı"
          required
          autoFocus
          className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kısa kod" hint={`Otomatik: ${deriveShortName(name || "XX")}`}>
          <input
            value={shortName}
            onChange={(e) => setShortName(e.target.value.toUpperCase())}
            maxLength={3}
            placeholder="Auto"
            className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-nebula/50"
          />
        </FormField>

        <FormField label="Accent rengi">
          <select
            value={accent}
            onChange={(e) =>
              setAccent(e.target.value as "ion" | "nebula" | "quantum" | "solar")
            }
            className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
          >
            {ACCENT_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Sektör / kategori" hint={`Default: ${template.defaultIndustry}`}>
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder={template.defaultIndustry}
          className="w-full rounded-md border border-border/60 bg-elevated/50 px-3 py-2 text-sm outline-none focus:border-nebula/50"
        />
      </FormField>

      {/* Preview */}
      <div className="rounded-lg border border-nebula/30 bg-nebula-soft/15 p-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-nebula">
          <Sparkles size={10} />
          Kurulacak olan
        </div>
        <div className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-text">
          {template.mission && (
            <div>
              <b className="text-text-muted">Mission:</b>{" "}
              <span className="text-text-muted">{template.mission}</span>
            </div>
          )}
          {template.themes.length > 0 && (
            <div>
              <b className="text-text-muted">{template.themes.length} stratejik tema:</b>{" "}
              <span className="text-text-muted">
                {template.themes.map((t) => t.label).join(" · ")}
              </span>
            </div>
          )}
          {template.recommendedBlueprints.length > 0 && (
            <div>
              <b className="text-text-muted">Önerilen blueprint'ler:</b>{" "}
              <span className="text-ion">
                {template.recommendedBlueprints.join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-text-muted hover:text-text"
        >
          <ArrowLeft size={11} />
          template değiştir
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onCancel}>
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="gap-1.5"
            disabled={!name.trim() || submitting}
          >
            {submitting ? "Kuruluyor…" : "Workspace'i oluştur"}
            <Rocket size={13} />
          </Button>
        </div>
      </div>
    </form>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Shared — StepPill, FormField, styling helpers
// ───────────────────────────────────────────────────────────────────────────

function StepPill({
  active,
  done,
  label,
  onClick,
}: {
  active: boolean;
  done: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 transition-colors",
        active && "border-nebula/50 bg-nebula-soft text-nebula",
        done && "border-quantum/40 bg-quantum-soft/50 text-quantum hover:bg-quantum-soft/70",
        !active && !done && "border-border/60 bg-elevated/40 text-text-faint",
        !onClick && "cursor-default"
      )}
    >
      {done && <Check size={9} />}
      {label}
    </button>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 font-mono text-[10px] text-text-faint">{hint}</p>}
    </div>
  );
}

function accentBorder(a: "ion" | "nebula" | "quantum" | "solar"): string {
  switch (a) {
    case "ion":
      return "border-ion/40";
    case "nebula":
      return "border-nebula/40";
    case "quantum":
      return "border-quantum/40";
    case "solar":
      return "border-solar/40";
  }
}

function accentBg(a: "ion" | "nebula" | "quantum" | "solar"): string {
  switch (a) {
    case "ion":
      return "bg-ion-soft";
    case "nebula":
      return "bg-nebula-soft";
    case "quantum":
      return "bg-quantum-soft";
    case "solar":
      return "bg-solar-soft";
  }
}

function accentText(a: "ion" | "nebula" | "quantum" | "solar"): string {
  switch (a) {
    case "ion":
      return "text-ion";
    case "nebula":
      return "text-nebula";
    case "quantum":
      return "text-quantum";
    case "solar":
      return "text-solar";
  }
}
