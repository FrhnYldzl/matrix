"use client";

import { cn } from "@/lib/cn";
import type { Blueprint } from "@/lib/blueprints";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  ArrowLeft,
  Bot,
  Rocket,
  Target,
  Waypoints,
  Wrench,
  Zap,
} from "lucide-react";

export function BlueprintDetail({
  blueprint,
  onBack,
  onInstall,
}: {
  blueprint: Blueprint;
  onBack: () => void;
  onInstall: () => void;
}) {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-8 pb-6">
        <div
          className={cn(
            "pointer-events-none absolute -top-20 left-1/3 h-56 w-[500px] rounded-full blur-3xl",
            blueprint.coverPalette === "ion" && "bg-ion/15",
            blueprint.coverPalette === "nebula" && "bg-nebula/15",
            blueprint.coverPalette === "quantum" && "bg-quantum/15",
            blueprint.coverPalette === "solar" && "bg-solar/15"
          )}
        />

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
        >
          <ArrowLeft size={12} />
          Tüm blueprint'ler
        </button>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
              Blueprint · {blueprint.author}
            </div>
            <h1 className="mt-2 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
              {blueprint.displayName}
            </h1>
            <p className="mt-3 text-base text-text-muted leading-relaxed">
              {blueprint.summary}
            </p>
            <p className="mt-2 rounded-lg border border-border/50 bg-elevated/40 px-3 py-2 font-mono text-[12px] text-text">
              → {blueprint.hero}
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <Button variant="primary" size="lg" className="gap-2" onClick={onInstall}>
              <Rocket size={16} />
              Bu workspace'e kur
            </Button>
            <span className="font-mono text-[10px] text-text-faint">
              {blueprint.estimatedSetupMinutes} dk kurulum · ~{blueprint.estimatedMonthlyHoursSaved}{" "}
              sa / ay kazanç
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Meta icon={Bot} n={blueprint.departments.length} l="Departman" tone="ion" />
          <Meta icon={Bot} n={blueprint.agents.length} l="Agent" tone="ion" />
          <Meta icon={Wrench} n={blueprint.skills.length} l="Skill" tone="nebula" />
          <Meta icon={Waypoints} n={blueprint.workflows.length} l="Workflow" tone="quantum" />
        </div>
      </section>

      <section className="space-y-6 px-8 py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle>Departmanlar</CardTitle>
              <Badge tone="ion">{blueprint.departments.length}</Badge>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {blueprint.departments.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                  >
                    <div className="text-sm font-medium text-text">{d.name}</div>
                    <div className="mt-0.5 text-xs text-text-muted">{d.description}</div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* Agents */}
          <Card>
            <CardHeader>
              <CardTitle>Ajanlar</CardTitle>
              <Badge tone="ion">{blueprint.agents.length}</Badge>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {blueprint.agents.map((a) => {
                  const dept = blueprint.departments.find((d) => d.id === a.deptId);
                  return (
                    <li
                      key={a.intent.name}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-elevated/40 p-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-text">
                            {a.intent.displayName}
                          </span>
                          <span className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                            {a.intent.model || "sonnet"}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-text-muted line-clamp-2">
                          {a.intent.purpose}
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-text-faint">
                        {dept?.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <Badge tone="nebula">{blueprint.skills.length}</Badge>
            </CardHeader>
            <CardBody>
              <ul className="space-y-1.5">
                {blueprint.skills.map((s) => (
                  <li
                    key={s.intent.name}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/50 bg-elevated/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-text">
                        {s.intent.displayName}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                        {s.intent.name}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-ion">
                      {s.ownerAgentName}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* Workflows */}
          <Card>
            <CardHeader>
              <CardTitle>Workflows</CardTitle>
              <Badge tone="quantum">{blueprint.workflows.length}</Badge>
            </CardHeader>
            <CardBody>
              <ul className="space-y-1.5">
                {blueprint.workflows.map((w) => {
                  const trig = w.intent.triggerKind;
                  return (
                    <li
                      key={w.intent.name}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/50 bg-elevated/30 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-mono text-sm text-text">
                          {w.intent.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-text-muted line-clamp-1">
                          {w.intent.purpose}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                          trig === "schedule" && "border-solar/30 bg-solar-soft text-solar",
                          trig === "webhook" && "border-ion/30 bg-ion-soft text-ion",
                          trig === "manual" && "border-border bg-elevated text-text-muted"
                        )}
                      >
                        {trig}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* OKRs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target size={14} className="text-quantum" />
              <CardTitle>Önerilen OKR'ler</CardTitle>
            </div>
            <Badge tone="quantum">{blueprint.okrs.length}</Badge>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {blueprint.okrs.map((o, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                >
                  <div className="text-sm font-medium text-text">{o.title}</div>
                  <div className="mt-1 flex items-baseline gap-2 font-mono text-[11px] text-text-muted">
                    <span>{o.metric}</span>
                    <span>·</span>
                    <span className="text-quantum">
                      hedef: {o.target} {o.unit}
                    </span>
                    {o.invert && (
                      <span className="rounded bg-elevated px-1 text-[9px] uppercase text-text-faint">
                        düşük iyi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Hybrid */}
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-nebula" />
              <CardTitle>Fiziksel Köprüler</CardTitle>
            </div>
            <Badge tone="nebula">%{blueprint.digitalCoverage} dijital</Badge>
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-relaxed text-text-muted">
              Dijital tarafı Matrix uçtan uca yapar; fiziksel dünyadaki ölçümler için bu
              blueprint aşağıdaki köprüleri önerir. Her köprü, saha verisini Matrix webhook'larına
              akıtır ve dijital hedeflere işler.
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {blueprint.physicalBridges.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-nebula/25 bg-nebula-soft/20 px-3 py-2"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-nebula" />
                  <span className="text-sm text-text">{b}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

function Meta({
  icon: Icon,
  n,
  l,
  tone,
}: {
  icon: typeof Bot;
  n: number;
  l: string;
  tone: "ion" | "nebula" | "quantum" | "solar";
}) {
  const toneCls =
    tone === "ion"
      ? "bg-ion-soft text-ion border-ion/30"
      : tone === "nebula"
      ? "bg-nebula-soft text-nebula border-nebula/30"
      : tone === "quantum"
      ? "bg-quantum-soft text-quantum border-quantum/30"
      : "bg-solar-soft text-solar border-solar/30";
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${toneCls}`}
    >
      <Icon size={14} />
      <div>
        <div className="font-mono text-lg font-semibold tabular-nums">{n}</div>
        <div className="font-mono text-[10px] uppercase tracking-wider opacity-80">{l}</div>
      </div>
    </div>
  );
}
