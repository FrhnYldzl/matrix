"use client";

import { useMemo } from "react";
import {
  agents as seedAgents,
  departments as seedDepartments,
  goals as seedGoals,
  skills as seedSkills,
  workflows as seedWorkflows,
} from "@/lib/mock-data";
import { scanWorkspace } from "@/lib/oracle";
import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Check, Sparkles, Target, TrendingDown, TrendingUp } from "lucide-react";

export function WeeklyRetroCard() {
  const {
    currentWorkspaceId,
    workspaces,
    acceptedSuggestionSources,
    createdSkills,
    createdAgents,
    createdWorkflows,
  } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  const live = useMemo(
    () =>
      scanWorkspace({
        workspace: ws,
        departments: seedDepartments.filter((d) => d.workspaceId === ws.id),
        agents: seedAgents.filter((a) => a.workspaceId === ws.id),
        skills: seedSkills.filter((s) => s.workspaceId === ws.id),
        workflows: seedWorkflows.filter((w) => w.workspaceId === ws.id),
        goals: seedGoals.filter((g) => g.workspaceId === ws.id),
      }),
    [ws]
  );

  const acceptanceRate =
    acceptedSuggestionSources.length + live.length > 0
      ? acceptedSuggestionSources.length /
        (acceptedSuggestionSources.length + live.length)
      : 0;

  const createdThisWeek =
    createdSkills.length + createdAgents.length + createdWorkflows.length;

  const wsGoals = seedGoals.filter((g) => g.workspaceId === ws.id);
  const ontrack = wsGoals.filter(
    (g) => g.trajectory === "on-track" || g.trajectory === "ahead"
  ).length;
  const risky = wsGoals.filter(
    (g) => g.trajectory === "at-risk" || g.trajectory === "off-track"
  ).length;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
      <CardHeader>
        <CardTitle>Haftalık Retro</CardTitle>
        <Badge tone="nebula">w17</Badge>
      </CardHeader>
      <CardBody className="space-y-4">
        <RetroRow
          icon={Sparkles}
          tone="nebula"
          label="Oracle kabul oranı"
          value={`%${Math.round(acceptanceRate * 100)}`}
          meta={`${acceptedSuggestionSources.length} kabul · ${live.length} bekleyen`}
        />
        <RetroRow
          icon={Check}
          tone="quantum"
          label="Envantere eklenenler"
          value={`${createdThisWeek}`}
          meta={`${createdSkills.length} skill · ${createdAgents.length} agent · ${createdWorkflows.length} workflow`}
        />
        <RetroRow
          icon={Target}
          tone={risky > 0 ? "solar" : "quantum"}
          label="Hedef yörüngeleri"
          value={`${ontrack}/${wsGoals.length}`}
          meta={risky > 0 ? `${risky} risk altında` : "Hepsi rotada"}
        />
        <RetroRow
          icon={acceptanceRate > 0.5 ? TrendingUp : TrendingDown}
          tone={acceptanceRate > 0.5 ? "quantum" : "solar"}
          label="Bu haftanın sinyali"
          value={acceptanceRate > 0.5 ? "Hızlanıyor" : "Tempo düşük"}
          meta={
            acceptanceRate > 0.5
              ? "Oracle önerileri kabul hızın yüksek"
              : "Oracle önerilerini hızlıca tarayıp aksiyona çevir"
          }
        />
      </CardBody>
    </Card>
  );
}

function RetroRow({
  icon: Icon,
  tone,
  label,
  value,
  meta,
}: {
  icon: typeof Check;
  tone: "quantum" | "ion" | "nebula" | "solar" | "crimson";
  label: string;
  value: string;
  meta?: string;
}) {
  const toneCls =
    tone === "quantum"
      ? "bg-quantum-soft text-quantum"
      : tone === "ion"
      ? "bg-ion-soft text-ion"
      : tone === "nebula"
      ? "bg-nebula-soft text-nebula"
      : tone === "solar"
      ? "bg-solar-soft text-solar"
      : "bg-crimson-soft text-crimson";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneCls}`}
      >
        <Icon size={14} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-text">{value}</div>
        {meta && <div className="mt-0.5 text-[11px] text-text-muted">{meta}</div>}
      </div>
    </div>
  );
}
