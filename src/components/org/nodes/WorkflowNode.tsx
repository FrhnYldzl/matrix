"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/cn";
import type { Workflow } from "@/lib/types";
import { Waypoints } from "lucide-react";

export type WorkflowNodeData = { workflow: Workflow };

const statusTone: Record<Workflow["lastStatus"], string> = {
  success: "text-quantum",
  running: "text-ion",
  "pending-approval": "text-solar",
  failed: "text-crimson",
};

const statusLabel: Record<Workflow["lastStatus"], string> = {
  success: "Başarılı",
  running: "Çalışıyor",
  "pending-approval": "Onay bekliyor",
  failed: "Hata",
};

export function WorkflowNode({ data, selected }: NodeProps) {
  const wf = (data as WorkflowNodeData).workflow;
  return (
    <div
      className={cn(
        "group relative w-[220px] rounded-lg border border-border/70 bg-gradient-to-br from-elevated/90 to-surface/90 backdrop-blur-sm transition-all duration-200 hover:border-quantum/50",
        selected && "ring-2 ring-quantum/70 ring-offset-2 ring-offset-void"
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-border-strong !border-0" />
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-quantum-soft text-quantum">
            <Waypoints size={11} strokeWidth={2} />
          </div>
          <span className="font-mono text-[11px] font-medium text-text truncate">
            {wf.name}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="text-text-muted">{wf.cadence}</span>
          <span className={cn("font-medium", statusTone[wf.lastStatus])}>
            {statusLabel[wf.lastStatus]}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-text-faint font-mono">
          <span>{wf.steps} adım</span>
          <span>→ {wf.nextRun}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-border-strong !border-0" />
    </div>
  );
}
