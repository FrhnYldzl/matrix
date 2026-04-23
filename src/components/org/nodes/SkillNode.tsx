"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/cn";
import type { Skill } from "@/lib/types";
import { Wrench } from "lucide-react";

export type SkillNodeData = { skill: Skill };

export function SkillNode({ data, selected }: NodeProps) {
  const skill = (data as SkillNodeData).skill;
  return (
    <div
      className={cn(
        "group relative w-[180px] rounded-lg border border-border/70 bg-elevated/80 backdrop-blur-sm transition-all duration-200 hover:border-nebula/50",
        selected && "ring-2 ring-nebula/70 ring-offset-2 ring-offset-void"
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-border-strong !border-0" />
      <div className="flex items-start gap-2 p-2.5">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-nebula-soft text-nebula">
          <Wrench size={11} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium text-text leading-tight truncate">
            {skill.displayName}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-muted">
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                skill.goldenTestPassing ? "bg-quantum" : "bg-crimson"
              )}
            />
            <span className="font-mono">
              {skill.runsThisWeek} /hafta
            </span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-border-strong !border-0" />
    </div>
  );
}
