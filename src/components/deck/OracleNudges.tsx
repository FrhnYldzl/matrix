"use client";

import { useMemo, useState } from "react";
import {
  agents as allAgents,
  departments as allDepartments,
  goals as allGoals,
  skills as allSkills,
  workflows as allWorkflows,
} from "@/lib/mock-data";
import { scanWorkspace, type Suggestion } from "@/lib/oracle";
import { connectors as allConnectors } from "@/lib/connectors";
import { getBudgetsWithSpend } from "@/lib/costs";
import {
  forgeAgent,
  forgeSkill,
  forgeWorkflow,
  inferForgeTarget,
  type AgentIntent,
  type SkillIntent,
  type WorkflowIntent,
} from "@/lib/forge";
import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  AlertTriangle,
  Compass,
  Layers,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import type { OracleKind } from "@/lib/types";
import Link from "next/link";

const kindMeta: Record<
  OracleKind,
  { icon: typeof Sparkles; tone: "ion" | "nebula" | "quantum" | "solar" | "crimson"; label: string }
> = {
  gap: { icon: Layers, tone: "ion", label: "Boşluk" },
  strategy: { icon: Compass, tone: "nebula", label: "Hiza" },
  ops: { icon: Wrench, tone: "quantum", label: "Operasyonel" },
  risk: { icon: AlertTriangle, tone: "crimson", label: "Risk" },
};

export function OracleNudges() {
  const { currentWorkspaceId, workspaces, createSkill, createAgent, createWorkflow } =
    useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const suggestions = useMemo(() => {
    return scanWorkspace({
      workspace: ws,
      departments: allDepartments.filter((d) => d.workspaceId === ws.id),
      agents: allAgents.filter((a) => a.workspaceId === ws.id),
      skills: allSkills.filter((s) => s.workspaceId === ws.id),
      workflows: allWorkflows.filter((w) => w.workspaceId === ws.id),
      goals: allGoals.filter((g) => g.workspaceId === ws.id),
      connectors: allConnectors,
      budgets: getBudgetsWithSpend(ws.id),
    })
      .filter((s) => !accepted.has(s.source) && !dismissed.has(s.source))
      .slice(0, 3);
  }, [ws, accepted, dismissed]);

  const accept = (s: Suggestion) => {
    const ctx = {
      workspaceId: ws.id,
      agents: allAgents
        .filter((a) => a.workspaceId === ws.id)
        .map((a) => ({
          id: a.id,
          name: a.name,
          displayName: a.displayName,
          departmentId: a.departmentId,
        })),
      departments: allDepartments
        .filter((d) => d.workspaceId === ws.id)
        .map((d) => ({ id: d.id, name: d.name })),
    };
    const target = inferForgeTarget(s, ctx);
    if (!target) {
      setDismissed((p) => new Set(p).add(s.source));
      return;
    }
    const createdAt = new Date().toISOString();
    if (target.kind === "skill") {
      const f = forgeSkill(target.intent as SkillIntent, ws.id);
      createSkill(
        {
          entity: f.skill,
          origin: "oracle",
          createdAt,
          file: { path: f.relativePath, language: "markdown", content: f.markdown },
        },
        s.source
      );
    } else if (target.kind === "agent") {
      const f = forgeAgent(target.intent as AgentIntent, ws.id);
      createAgent(
        {
          entity: f.agent,
          origin: "oracle",
          createdAt,
          file: { path: f.relativePath, language: "markdown", content: f.markdown },
        },
        s.source
      );
    } else {
      const f = forgeWorkflow(target.intent as WorkflowIntent, ws.id);
      createWorkflow(
        {
          entity: f.workflow,
          origin: "oracle",
          createdAt,
          file: { path: f.relativePath, language: "yaml", content: f.yaml },
        },
        s.source
      );
    }
    setAccepted((p) => new Set(p).add(s.source));
  };

  const dismiss = (s: Suggestion) =>
    setDismissed((p) => new Set(p).add(s.source));

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-nebula" />
          <CardTitle className="text-nebula">Oracle · Senin için bugün</CardTitle>
        </div>
        <Link href="/oracle" className="text-xs text-text-muted hover:text-text">
          Tümünü gör →
        </Link>
      </CardHeader>
      <CardBody className="space-y-3">
        {suggestions.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-4 text-center text-sm text-text-muted">
            Şu an bir sinyal yok. Her şey yolunda görünüyor.
          </div>
        )}
        {suggestions.map((s) => {
          const meta = kindMeta[s.kind];
          const Icon = meta.icon;
          return (
            <div
              key={s.id}
              className="group relative rounded-lg border border-border/70 bg-elevated/40 p-4 transition-all hover:border-nebula/40 hover:bg-elevated/70"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                    meta.tone === "ion"
                      ? "bg-ion-soft text-ion"
                      : meta.tone === "nebula"
                      ? "bg-nebula-soft text-nebula"
                      : meta.tone === "quantum"
                      ? "bg-quantum-soft text-quantum"
                      : "bg-crimson-soft text-crimson"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {s.priority === "high" && <Badge tone="crimson">Yüksek</Badge>}
                  </div>
                  <h4 className="mt-2 text-sm font-medium text-text leading-snug">
                    {s.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-text-muted leading-relaxed line-clamp-2">
                    {s.rationale}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-[11px] text-text-faint">
                      {s.target}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-text-faint"
                        onClick={() => dismiss(s)}
                      >
                        <X size={12} />
                      </Button>
                      <Link href="/oracle">
                        <Button size="sm" variant="secondary" className="h-7">
                          İncele
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="primary"
                        className="h-7"
                        onClick={() => accept(s)}
                      >
                        Kabul et
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
