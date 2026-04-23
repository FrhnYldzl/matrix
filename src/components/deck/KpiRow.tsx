"use client";

import { useMemo } from "react";
import { useWorkspaceStore } from "@/lib/store";
import { agents, departments, goals, skills, workflows } from "@/lib/mock-data";
import { connectors as allConnectors } from "@/lib/connectors";
import { getBudgetsWithSpend } from "@/lib/costs";
import { scanWorkspace, summarize } from "@/lib/oracle";
import { KpiCard } from "../ui/KpiCard";
import { Activity, Gauge, Sparkles, Target } from "lucide-react";

export function KpiRow() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const wsId = currentWorkspaceId;
  const ws = workspaces.find((w) => w.id === wsId) ?? workspaces[0];

  const wsAgents = agents.filter((a) => a.workspaceId === wsId);
  const liveAgents = wsAgents.filter((a) => a.status === "live").length;
  const runningWorkflows = workflows.filter(
    (w) => w.workspaceId === wsId && (w.lastStatus === "running" || w.lastStatus === "success")
  ).length;
  const leverageGoal = goals.find((g) => g.id === "goal-leverage" && g.workspaceId === wsId);
  const leverageValue = leverageGoal?.current ?? 0;
  const leverageDelta = leverageGoal ? (leverageGoal.current / leverageGoal.target) * 100 : 0;

  const oracleSummary = useMemo(() => {
    const all = scanWorkspace({
      workspace: ws,
      departments: departments.filter((d) => d.workspaceId === wsId),
      agents: wsAgents,
      skills: skills.filter((s) => s.workspaceId === wsId),
      workflows: workflows.filter((w) => w.workspaceId === wsId),
      goals: goals.filter((g) => g.workspaceId === wsId),
      connectors: allConnectors,
      budgets: getBudgetsWithSpend(wsId),
    });
    return summarize(all);
  }, [ws, wsId, wsAgents]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Kazanılmış İnsan Saati"
        value={leverageValue.toFixed(1)}
        unit="sa / hafta"
        delta={`%${Math.round(leverageDelta)} hedefin`}
        trend="up"
        hint="Hedef: 10 sa"
        icon={<Target size={14} />}
        tone="quantum"
      />
      <KpiCard
        label="Canlı Ajanlar"
        value={liveAgents}
        unit={`/ ${wsAgents.length}`}
        delta="2 yeni bu hafta"
        trend="up"
        hint="Orchestrator + 2 domain"
        icon={<Activity size={14} />}
        tone="ion"
      />
      <KpiCard
        label="Aktif Workflow"
        value={runningWorkflows}
        unit="akış"
        delta="1 onay bekliyor"
        trend="flat"
        hint="Next run: yarın 08:30"
        icon={<Gauge size={14} />}
        tone="nebula"
      />
      <KpiCard
        label="Oracle Önerisi"
        value={oracleSummary.total}
        unit="yeni"
        delta={`${oracleSummary.byPrio.high} yüksek öncelik`}
        trend={oracleSummary.byPrio.high > 0 ? "up" : "flat"}
        hint={`${oracleSummary.byKind.gap} boşluk · ${oracleSummary.byKind.strategy} hiza · ${oracleSummary.byKind.ops} ops · ${oracleSummary.byKind.risk} risk`}
        icon={<Sparkles size={14} />}
        tone="solar"
      />
    </div>
  );
}
