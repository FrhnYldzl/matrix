"use client";

import { cn } from "@/lib/cn";
import { agents as allAgents } from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import type { Agent } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { StatusDot } from "../ui/StatusDot";
import { Activity, Pause } from "lucide-react";

export function LiveAgentsGrid() {
  const { currentWorkspaceId, killSwitchArmed } = useWorkspaceStore();
  const wsAgents = allAgents.filter((a) => a.workspaceId === currentWorkspaceId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-ion" />
          <CardTitle>Canlı Ajanlar</CardTitle>
        </div>
        {killSwitchArmed ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-crimson/40 bg-crimson-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-crimson">
            <Pause size={10} /> KillSwitch
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            {wsAgents.filter((a) => a.status === "live").length} / {wsAgents.length} canlı
          </span>
        )}
      </CardHeader>
      <CardBody>
        {wsAgents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-6 text-center text-sm text-text-muted">
            Bu workspace'te henüz ajan yok.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {wsAgents.map((a) => (
              <AgentRow key={a.id} agent={a} overridden={killSwitchArmed} />
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function AgentRow({ agent, overridden }: { agent: Agent; overridden: boolean }) {
  const effStatus = overridden ? "paused" : agent.status;
  const healthy = agent.successRate >= 0.9;
  const warn = agent.successRate >= 0.7 && agent.successRate < 0.9;

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border/60 bg-elevated/40 p-3 transition-all",
        overridden && "opacity-50",
        !overridden && "hover:border-border-strong"
      )}
    >
      <div
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold",
          agent.model === "opus" && "border-ion/50 text-ion",
          agent.model === "sonnet" && "border-nebula/40 text-nebula",
          agent.model === "haiku" && "border-quantum/40 text-quantum"
        )}
      >
        <StatusDot tone={effStatus} className="absolute -right-0.5 -top-0.5" />
        {agent.displayName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-text">
            {agent.displayName}
          </span>
          <span className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
            {agent.model}
          </span>
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-text-muted">
          {agent.callsToday} çağrı bugün · son: az önce
        </div>
      </div>

      <div className="text-right">
        <div
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            healthy ? "text-quantum" : warn ? "text-solar" : "text-crimson"
          )}
        >
          %{Math.round(agent.successRate * 100)}
        </div>
        <div className="font-mono text-[10px] text-text-faint">başarı</div>
      </div>
    </li>
  );
}
