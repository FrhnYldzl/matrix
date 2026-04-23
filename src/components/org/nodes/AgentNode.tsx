"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/cn";
import { StatusDot } from "../../ui/StatusDot";
import type { Agent } from "@/lib/types";

export type AgentNodeData = {
  agent: Agent;
};

const modelRing: Record<Agent["model"], string> = {
  opus: "border-ion/60 shadow-[0_0_18px_rgba(77,184,255,0.28)]",
  sonnet: "border-nebula/50 shadow-[0_0_14px_rgba(155,123,255,0.2)]",
  haiku: "border-quantum/50 shadow-[0_0_12px_rgba(61,224,168,0.18)]",
};

const modelChip: Record<Agent["model"], string> = {
  opus: "bg-ion-soft text-ion",
  sonnet: "bg-nebula-soft text-nebula",
  haiku: "bg-quantum-soft text-quantum",
};

export function AgentNode({ data, selected }: NodeProps) {
  const agent = (data as AgentNodeData).agent;
  const initials = agent.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className={cn(
        "group relative w-[200px] rounded-xl border bg-surface/90 backdrop-blur-sm transition-all duration-200",
        modelRing[agent.model],
        selected && "ring-2 ring-ion/70 ring-offset-2 ring-offset-void"
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-border-strong !border-0" />

      <div className="flex items-center gap-3 p-3">
        <div
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold",
            modelRing[agent.model]
          )}
        >
          <StatusDot tone={agent.status} className="absolute -right-0.5 -top-0.5" />
          <span className="text-text">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-text truncate leading-tight">
            {agent.displayName}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
                modelChip[agent.model]
              )}
            >
              {agent.model}
            </span>
            <span className="text-[10px] text-text-faint truncate">
              {agent.callsToday} çağrı
            </span>
          </div>
        </div>
      </div>

      {/* Scope badges */}
      <div className="flex items-center gap-1 border-t border-border/50 px-3 py-1.5">
        {agent.scopes.map((s) => (
          <span
            key={s}
            className={cn(
              "rounded-sm border px-1.5 py-px font-mono text-[9px] uppercase tracking-wider",
              s === "read" && "border-border bg-elevated text-text-muted",
              s === "write" && "border-ion/30 bg-ion-soft text-ion",
              s === "external-send" && "border-crimson/30 bg-crimson-soft text-crimson"
            )}
          >
            {s === "external-send" ? "external" : s}
          </span>
        ))}
        <span className="ml-auto font-mono text-[9px] tabular-nums text-text-faint">
          %{Math.round(agent.successRate * 100)}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-border-strong !border-0" />
    </div>
  );
}
