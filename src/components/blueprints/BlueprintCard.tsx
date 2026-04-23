"use client";

import { cn } from "@/lib/cn";
import type { Blueprint } from "@/lib/blueprints";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ArrowRight, Clock, Layers, TrendingUp } from "lucide-react";

export function BlueprintCard({
  blueprint,
  onOpen,
}: {
  blueprint: Blueprint;
  onOpen: () => void;
}) {
  const p = blueprint.coverPalette;
  const ring =
    p === "ion"
      ? "shadow-[0_0_30px_rgba(77,184,255,0.2)]"
      : p === "nebula"
      ? "shadow-[0_0_30px_rgba(155,123,255,0.2)]"
      : p === "quantum"
      ? "shadow-[0_0_30px_rgba(61,224,168,0.2)]"
      : "shadow-[0_0_30px_rgba(255,181,71,0.2)]";

  return (
    <Card className={cn("relative overflow-hidden transition-all hover:border-border-strong", ring)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          p === "ion" && "bg-ion/70",
          p === "nebula" && "bg-nebula/70",
          p === "quantum" && "bg-quantum/70",
          p === "solar" && "bg-solar/70"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -top-8 right-0 h-32 w-64 rounded-full blur-3xl",
          p === "ion" && "bg-ion/10",
          p === "nebula" && "bg-nebula/10",
          p === "quantum" && "bg-quantum/10",
          p === "solar" && "bg-solar/10"
        )}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              <Layers size={10} />
              Blueprint · {blueprint.author}
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text">
              {blueprint.displayName}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{blueprint.summary}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg border border-border/60 bg-elevated/40 p-3">
          <Stat n={blueprint.departments.length} l="Departman" />
          <Stat n={blueprint.agents.length} l="Agent" />
          <Stat n={blueprint.skills.length} l="Skill" />
          <Stat n={blueprint.workflows.length} l="Workflow" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone={p}>
            <TrendingUp size={10} className="mr-1" />
            ~{blueprint.estimatedMonthlyHoursSaved} sa / ay
          </Badge>
          <Badge tone="neutral">
            <Clock size={10} className="mr-1" />
            {blueprint.estimatedSetupMinutes} dk kurulum
          </Badge>
          <Badge tone={blueprint.digitalCoverage >= 85 ? "quantum" : "solar"}>
            %{blueprint.digitalCoverage} dijital
          </Badge>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {blueprint.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded border border-border/50 bg-elevated/50 px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
              >
                {t}
              </span>
            ))}
          </div>
          <Button variant="primary" size="sm" className="gap-1.5 shrink-0" onClick={onOpen}>
            İncele
            <ArrowRight size={13} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="text-center">
      <div className="font-sans text-xl font-semibold tabular-nums text-text">{n}</div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-text-faint">{l}</div>
    </div>
  );
}
