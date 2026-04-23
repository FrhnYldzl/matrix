"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  businessModels,
  opportunities,
  revenuePlaybooks,
  type Accent,
  type BusinessModel,
  type BusinessOpportunity,
  type RevenuePlaybook,
} from "@/lib/business-library";
import { getBlueprint } from "@/lib/blueprints";
import { useWorkspaceStore } from "@/lib/store";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ExecutionBadge } from "./ExecutionBadge";
import { ResourceProfileCard } from "./ResourceProfileCard";
import { HunterAgentPanel } from "./HunterAgentPanel";
import { IdeaAnalyzer } from "./IdeaAnalyzer";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Coins,
  Compass,
  Flame,
  Lightbulb,
  Rocket,
  Search,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";

type Tab = "models" | "opportunities" | "playbooks";

export function BusinessLibraryPage() {
  const [tab, setTab] = useState<Tab>("models");
  const [q, setQ] = useState("");
  const [selectedModel, setSelectedModel] = useState<BusinessModel | null>(null);
  const [selectedOp, setSelectedOp] = useState<BusinessOpportunity | null>(null);

  // All hooks must be called unconditionally
  const filteredModels = useMemo(
    () =>
      businessModels.filter((m) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          m.name.toLowerCase().includes(s) ||
          m.tagline.toLowerCase().includes(s) ||
          m.tags.some((t) => t.includes(s))
        );
      }),
    [q]
  );

  const filteredOps = useMemo(
    () =>
      opportunities.filter((o) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          o.title.toLowerCase().includes(s) ||
          o.thesis.toLowerCase().includes(s) ||
          o.tags.some((t) => t.includes(s))
        );
      }),
    [q]
  );

  const filteredPlaybooks = useMemo(
    () =>
      revenuePlaybooks.filter((p) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          p.name.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.pattern.includes(s)
        );
      }),
    [q]
  );


  if (selectedModel) {
    return <BusinessModelDetail model={selectedModel} onBack={() => setSelectedModel(null)} />;
  }
  if (selectedOp) {
    return (
      <OpportunityDetail
        opportunity={selectedOp}
        onBack={() => setSelectedOp(null)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="solar" opacity={0.08} />
        <div className="pointer-events-none absolute -top-20 left-1/4 h-48 w-[500px] rounded-full bg-solar/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/3 h-40 w-[400px] rounded-full bg-nebula/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <BookOpenCheck size={12} className="text-solar" />
            Zion's Council · Business Library
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            Ne iş yapayım? Nasıl para kazanayım?
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-muted leading-relaxed">
            Blueprint'lerin bir adım öncesi. Burada <b className="text-text">iş modelleri</b>,{" "}
            <b className="text-text">pazar fırsatları</b> ve{" "}
            <b className="text-text">gelir playbook'ları</b> var. Bir fikri seç — Matrix sana
            hangi Blueprint'leri kurman gerektiğini söyler ve Vision & Strategy sayfana
            şablonları otomatik düşürür.
          </p>

          <div className="mt-5 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-solar/30 bg-solar-soft px-2.5 py-1 text-solar">
              <Sparkles size={11} />
              {businessModels.length} model · {opportunities.length} fırsat ·{" "}
              {revenuePlaybooks.length} playbook
            </span>
          </div>
        </div>

        <div className="relative mt-6 max-w-3xl">
          <MatrixQuote speaker={MODULE_QUOTES["/business"].speaker} tone={MODULE_QUOTES["/business"].tone}>
            {MODULE_QUOTES["/business"].line}
          </MatrixQuote>
        </div>
      </section>

      {/* Tabs + search */}
      <div className="sticky top-14 z-10 border-b border-border/60 bg-void/70 px-8 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            <TabBtn
              active={tab === "models"}
              onClick={() => setTab("models")}
              icon={Target}
              tone="ion"
            >
              Business Models ({businessModels.length})
            </TabBtn>
            <TabBtn
              active={tab === "opportunities"}
              onClick={() => setTab("opportunities")}
              icon={Flame}
              tone="solar"
            >
              Opportunities ({opportunities.length})
            </TabBtn>
            <TabBtn
              active={tab === "playbooks"}
              onClick={() => setTab("playbooks")}
              icon={Coins}
              tone="quantum"
            >
              Revenue Playbooks ({revenuePlaybooks.length})
            </TabBtn>
          </div>

          <div className="ml-auto flex items-center gap-2 rounded-md border border-border/60 bg-elevated/40 px-3 py-1.5 text-sm md:w-80">
            <Search size={13} className="text-text-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: niş, model, trend, playbook…"
              className="w-full bg-transparent outline-none placeholder:text-text-faint"
            />
          </div>
        </div>
      </div>

      <section className="space-y-6 px-8 py-8">
        <IdeaAnalyzer />
        <HunterAgentPanel />

        {tab === "models" && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredModels.map((m) => (
              <BusinessModelCard key={m.id} model={m} onOpen={() => setSelectedModel(m)} />
            ))}
          </div>
        )}
        {tab === "opportunities" && (
          <div className="grid grid-cols-1 gap-4">
            {filteredOps.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} onOpen={() => setSelectedOp(o)} />
            ))}
          </div>
        )}
        {tab === "playbooks" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredPlaybooks.map((p) => (
              <PlaybookCard key={p.id} playbook={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// =============================================================================
// Cards
// =============================================================================

function accentRing(a: Accent) {
  return a === "ion"
    ? "shadow-[0_0_30px_rgba(77,184,255,0.2)]"
    : a === "nebula"
    ? "shadow-[0_0_30px_rgba(155,123,255,0.2)]"
    : a === "quantum"
    ? "shadow-[0_0_30px_rgba(61,224,168,0.2)]"
    : "shadow-[0_0_30px_rgba(255,181,71,0.2)]";
}

function accentBar(a: Accent) {
  return a === "ion"
    ? "bg-ion/70"
    : a === "nebula"
    ? "bg-nebula/70"
    : a === "quantum"
    ? "bg-quantum/70"
    : "bg-solar/70";
}

function accentGlow(a: Accent) {
  return a === "ion"
    ? "bg-ion/10"
    : a === "nebula"
    ? "bg-nebula/10"
    : a === "quantum"
    ? "bg-quantum/10"
    : "bg-solar/10";
}

function BusinessModelCard({
  model,
  onOpen,
}: {
  model: BusinessModel;
  onOpen: () => void;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:border-border-strong",
        accentRing(model.accent)
      )}
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-1", accentBar(model.accent))} />
      <div
        className={cn(
          "pointer-events-none absolute -top-8 right-0 h-32 w-64 rounded-full blur-3xl",
          accentGlow(model.accent)
        )}
      />
      <div className="relative p-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
          <Target size={10} />
          Business Model
          {model.executionType && (
            <ExecutionBadge type={model.executionType} digitalShare={model.digitalRevenueShare} compact />
          )}
        </div>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text">{model.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{model.tagline}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-elevated/40 p-3">
          <Stat label="Revenue" value={model.revenuePattern} mono />
          <Stat label="Capital" value={model.capitalIntensity} mono />
          <Stat label="Time to $" value={model.timeToFirstDollar} mono />
        </div>

        <div className="mt-4 text-xs leading-relaxed text-text-muted">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            North Star
          </div>
          <div className="mt-0.5 font-medium text-text">{model.northStar}</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {model.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded border border-border/50 bg-elevated/50 px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-faint">
            Örnek: {model.examples.slice(0, 2).join(" · ")}
          </span>
          <Button variant="primary" size="sm" className="gap-1.5" onClick={onOpen}>
            İncele
            <ArrowRight size={12} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function OpportunityCard({
  opportunity,
  onOpen,
}: {
  opportunity: BusinessOpportunity;
  onOpen: () => void;
}) {
  const timingTone: "quantum" | "solar" | "nebula" | "neutral" =
    opportunity.timing === "hot"
      ? "solar"
      : opportunity.timing === "emerging"
      ? "nebula"
      : opportunity.timing === "reviving"
      ? "quantum"
      : "neutral";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:border-border-strong",
        accentRing(opportunity.accent)
      )}
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-0.5", accentBar(opportunity.accent))} />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
          <Flame size={10} className="text-solar" />
          <span className="text-text-faint">Opportunity</span>
          <Badge tone={timingTone}>{opportunity.timing}</Badge>
          <Badge tone="neutral">{opportunity.startupFit}</Badge>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-text">
          {opportunity.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-3">
          {opportunity.thesis}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-3">
          <MetaLine label="Trend" value={opportunity.trend} />
          <MetaLine label="Pazar" value={opportunity.marketSize} />
          <MetaLine label="Modeller" value={opportunity.relatedModelIds.length + " bağlı"} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {opportunity.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded border border-border/50 bg-elevated/50 px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
              >
                {t}
              </span>
            ))}
          </div>
          <Button variant="primary" size="sm" className="gap-1.5" onClick={onOpen}>
            Fırsatı aç
            <ArrowRight size={12} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PlaybookCard({ playbook }: { playbook: RevenuePlaybook }) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:border-border-strong",
        accentRing(playbook.accent)
      )}
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-0.5", accentBar(playbook.accent))} />
      <div className="p-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
          <Coins size={10} />
          Revenue Playbook · {playbook.pattern}
        </div>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-text">{playbook.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{playbook.description}</p>

        <div className="mt-3 rounded-md border border-border/50 bg-elevated/40 p-3 font-mono text-[11px] text-text">
          <span className="text-text-faint">North Star:</span> {playbook.northStar}
          <br />
          <span className="text-text-faint">Formül:</span>{" "}
          <span className="text-ion">{playbook.formula}</span>
        </div>

        <div className="mt-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Test planı
          </div>
          <ul className="mt-1 space-y-1">
            {playbook.testPlan.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-text-muted">
                <span className="shrink-0 font-mono text-text-faint">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Dikkat
          </div>
          <ul className="mt-1 space-y-1">
            {playbook.gotchas.map((g, i) => (
              <li key={i} className="flex gap-2 text-xs text-solar">
                <span>⚠</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 text-[11px] text-text-faint">
          <span className="text-text-muted">İdeal için:</span> {playbook.bestFor}
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// Detail views
// =============================================================================

function BusinessModelDetail({
  model,
  onBack,
}: {
  model: BusinessModel;
  onBack: () => void;
}) {
  const { updateWorkspace, currentWorkspaceId } = useWorkspaceStore();
  const rec = model.recommendedBlueprints
    .map((id) => getBlueprint(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getBlueprint>>[];

  const applyVisionTemplate = () => {
    updateWorkspace(currentWorkspaceId, {
      mission: model.visionTemplate.mission,
      vision: model.visionTemplate.vision,
      strategicThemes: model.visionTemplate.themes.map((t, i) => ({
        id: `st-${model.id}-${i}`,
        label: t.label,
        description: t.description,
        weight: t.weight,
      })),
    });
  };

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-8 pb-6">
        <div
          className={cn(
            "pointer-events-none absolute -top-20 left-1/4 h-56 w-[500px] rounded-full blur-3xl",
            accentGlow(model.accent)
          )}
        />
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
        >
          <ArrowLeft size={12} /> Business Library
        </button>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              Business Model
              {model.executionType && (
                <ExecutionBadge
                  type={model.executionType}
                  digitalShare={model.digitalRevenueShare}
                />
              )}
            </div>
            <h1 className="mt-2 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
              {model.name}
            </h1>
            <p className="mt-2 text-base text-text-muted leading-relaxed">{model.tagline}</p>
            <p className="mt-3 text-sm text-text leading-relaxed">{model.description}</p>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <Button
              variant="primary"
              size="md"
              className="gap-1.5"
              onClick={applyVisionTemplate}
            >
              <Lightbulb size={14} />
              Vision şablonunu uygula
            </Button>
            <span className="font-mono text-[10px] text-text-faint">
              Mission + Vision + {model.visionTemplate.themes.length} tema otomatik
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-6 px-8 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <KvCard label="Revenue Pattern" value={model.revenuePattern} />
          <KvCard label="North Star" value={model.northStar} />
          <KvCard label="Capital Intensity" value={model.capitalIntensity} />
          <KvCard label="Time to First $" value={model.timeToFirstDollar} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                Ölçek & Savunma
              </h3>
            </div>
            <div className="space-y-5 p-5">
              <Field label="Ölçek davranışı" value={model.scaleBehavior} />
              <Field label="Savunulabilirlik (moat)" value={model.defensibility} />
              <Field label="Takım büyüklüğü" value={model.idealTeamSize} />
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  Secondary KPIs
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {model.secondaryKpis.map((k) => (
                    <span
                      key={k}
                      className="rounded border border-border/50 bg-elevated/50 px-2 py-1 font-mono text-[11px] text-text-muted"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  Riskler
                </div>
                <ul className="mt-2 space-y-1">
                  {model.risks.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-text-muted">
                      <span className="text-solar">⚠</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                Örnek Şirketler
              </h3>
            </div>
            <ul className="space-y-2 p-5">
              {model.examples.map((e) => (
                <li
                  key={e}
                  className="rounded-md border border-border/60 bg-elevated/40 px-3 py-2 text-sm text-text"
                >
                  {e}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {model.resourceProfile && <ResourceProfileCard profile={model.resourceProfile} />}

        {rec.length > 0 && (
          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Rocket size={14} className="text-ion" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                  Önerilen Blueprint'ler
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                Bu iş modeli için ideal kurulum
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:grid-cols-3">
              {rec.map((bp) => (
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
                  <div className="mt-1 text-xs text-text-muted">{bp.summary}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-text-faint">
                    <span>{bp.agents.length} agent</span>·
                    <span>{bp.skills.length} skill</span>·
                    <span>{bp.workflows.length} workflow</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-ion">
                    Aç
                    <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

function OpportunityDetail({
  opportunity,
  onBack,
}: {
  opportunity: BusinessOpportunity;
  onBack: () => void;
}) {
  const rec = opportunity.relatedBlueprintIds
    .map((id) => getBlueprint(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getBlueprint>>[];
  const related = opportunity.relatedModelIds
    .map((id) => businessModels.find((m) => m.id === id))
    .filter(Boolean) as BusinessModel[];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-8 pb-6">
        <div
          className={cn(
            "pointer-events-none absolute -top-20 left-1/3 h-56 w-[500px] rounded-full blur-3xl",
            accentGlow(opportunity.accent)
          )}
        />
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
        >
          <ArrowLeft size={12} /> Business Library
        </button>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              <Flame size={10} className="text-solar" />
              Opportunity
              <Badge tone="solar">{opportunity.timing}</Badge>
              <Badge tone="neutral">{opportunity.startupFit}</Badge>
            </div>
            <h1 className="mt-2 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
              {opportunity.title}
            </h1>
            <p className="mt-3 text-base text-text-muted leading-relaxed">{opportunity.thesis}</p>
          </div>

          {opportunity.outlook && (
            <div className="w-full shrink-0 rounded-xl border border-nebula/30 bg-nebula-soft/20 p-4 backdrop-blur-sm lg:max-w-sm">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
                <Sparkles size={11} />
                Oracle öngörüsü · {opportunity.outlook.horizonMonths} ay
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text line-clamp-5">
                {opportunity.outlook.forecast}
              </p>
              <div className="mt-2 text-[11px] text-text-muted">
                <span className="font-mono">Güven:</span>{" "}
                <span
                  className={cn(
                    opportunity.outlook.confidence === "high" && "text-quantum",
                    opportunity.outlook.confidence === "medium" && "text-ion",
                    opportunity.outlook.confidence === "low" && "text-solar"
                  )}
                >
                  {opportunity.outlook.confidence}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6 px-8 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KvCard label="Trend" value={opportunity.trend} />
          <KvCard label="Pazar büyüklüğü" value={opportunity.marketSize} />
          <KvCard label="Timing" value={opportunity.timing} />
          {opportunity.northStar && <KvCard label="North Star" value={opportunity.northStar} />}
        </div>

        {/* Market research deep dive */}
        {opportunity.market && (
          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-nebula" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                  Pazar Araştırması
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
              <Field label="Toplam Pazar (TAM)" value={opportunity.market.tam} />
              <Field label="Büyüme Oranı" value={opportunity.market.growth} />
              <div className="lg:col-span-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  Mevcut Oyuncular
                </div>
                <ul className="mt-2 space-y-1">
                  {opportunity.market.incumbents.map((inc, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-border/50 bg-elevated/40 px-3 py-1.5 font-mono text-xs text-text-muted"
                    >
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-solar">
                  Pazardaki Boşluk (Whitespace)
                </div>
                <p className="mt-1.5 rounded-md border border-solar/30 bg-solar-soft/20 px-3 py-2 text-sm text-text leading-relaxed">
                  {opportunity.market.whitespace}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Oracle's wedge */}
        {opportunity.outlook && (
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-nebula" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-nebula">
                  Oracle'ın Önerdiği Giriş Noktası
                </h3>
              </div>
            </div>
            <div className="p-5">
              <p className="rounded-md border border-nebula/30 bg-nebula-soft/20 px-4 py-3 text-sm text-text leading-relaxed">
                {opportunity.outlook.wedge}
              </p>
            </div>
          </Card>
        )}

        {/* Roadmap */}
        {opportunity.roadmap && opportunity.roadmap.length > 0 && (
          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Rocket size={14} className="text-ion" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                  Yol Haritası
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                {opportunity.roadmap.length} faz
              </span>
            </div>
            <ol className="space-y-3 p-5">
              {opportunity.roadmap.map((step, i) => {
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
                    className="flex items-start gap-4 rounded-lg border border-border/60 bg-elevated/40 p-4"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold",
                        phaseTone === "solar" && "bg-solar-soft text-solar",
                        phaseTone === "ion" && "bg-ion-soft text-ion",
                        phaseTone === "nebula" && "bg-nebula-soft text-nebula",
                        phaseTone === "quantum" && "bg-quantum-soft text-quantum"
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={phaseTone}>{step.phase}</Badge>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                          {step.month}
                        </span>
                      </div>
                      <div className="mt-1.5 text-sm font-medium text-text">{step.action}</div>
                      <div className="mt-0.5 text-xs text-text-muted">
                        <span className="font-mono">Çıktı:</span> {step.deliverable}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        )}

        {/* Investment profile */}
        {opportunity.investment && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <KvCard
              label="Süre"
              value={`${opportunity.investment.timeMonths.min}-${opportunity.investment.timeMonths.max} ay`}
            />
            <KvCard
              label="Sermaye (USD)"
              value={`${(opportunity.investment.capitalUsd.min / 1000).toFixed(0)}K–${(
                opportunity.investment.capitalUsd.max / 1000
              ).toFixed(0)}K`}
            />
            <KvCard label="Takım" value={opportunity.investment.teamSize} />
            <KvCard label="Burn Riski" value={opportunity.investment.burnRiskLevel} />
          </div>
        )}

        {/* Go / No-Go */}
        {opportunity.goNoGo && opportunity.goNoGo.length > 0 && (
          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Lightbulb size={14} className="text-solar" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                  Başlamadan Önce Cevapla
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                Go / No-Go check
              </span>
            </div>
            <ul className="space-y-2 p-5">
              {opportunity.goNoGo.map((q, i) => (
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
        )}

        <Card>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-solar" />
              <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                Kanıt & Sinyaller
              </h3>
            </div>
          </div>
          <ul className="space-y-2 p-5">
            {opportunity.evidence.map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-md border border-border/50 bg-elevated/40 px-3 py-2 text-sm text-text"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-solar" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </Card>

        {related.length > 0 && (
          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-ion" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                  Uyumlu Business Model'ler
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
              {related.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                >
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
                    Business Model
                  </div>
                  <div className="mt-1 text-sm font-medium text-text">{m.name}</div>
                  <div className="mt-0.5 text-xs text-text-muted line-clamp-2">{m.tagline}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {rec.length > 0 && (
          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Rocket size={14} className="text-ion" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                  Önerilen Blueprint'ler
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:grid-cols-3">
              {rec.map((bp) => (
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
                </Link>
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

// =============================================================================
// Small pieces
// =============================================================================

function TabBtn({
  active,
  onClick,
  icon: Icon,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Target;
  tone: "ion" | "nebula" | "quantum" | "solar";
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "ion"
      ? "text-ion bg-ion-soft border-ion/40"
      : tone === "nebula"
      ? "text-nebula bg-nebula-soft border-nebula/40"
      : tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/40"
      : "text-solar bg-solar-soft border-solar/40";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-all",
        active
          ? toneCls + " shadow-inner"
          : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
      )}
    >
      <Icon size={13} />
      {children}
    </button>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-text-faint">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""} text-sm text-text capitalize`}>
        {value}
      </div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-text-faint">{label}</div>
      <div className="mt-0.5 text-text line-clamp-1">{value}</div>
    </div>
  );
}

function KvCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          {label}
        </div>
        <div className="mt-1 text-base font-medium text-text capitalize">{value}</div>
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">{label}</div>
      <div className="mt-1 text-sm text-text leading-relaxed">{value}</div>
    </div>
  );
}
