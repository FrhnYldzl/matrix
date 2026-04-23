"use client";

import { type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/cn";
import type { Department } from "@/lib/types";
import { Users } from "lucide-react";

export type DepartmentNodeData = { department: Department };

function healthTone(h: number) {
  if (h >= 85) return { bar: "bg-quantum", text: "text-quantum" };
  if (h >= 70) return { bar: "bg-ion", text: "text-ion" };
  if (h >= 55) return { bar: "bg-solar", text: "text-solar" };
  return { bar: "bg-crimson", text: "text-crimson" };
}

export function DepartmentNode({ data, selected, width, height }: NodeProps) {
  const dept = (data as DepartmentNodeData).department;
  const tone = healthTone(dept.health);

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-dashed border-border/70 bg-surface/20 backdrop-blur-[2px] transition-all duration-200",
        selected && "border-ion/60"
      )}
      style={{ width, height }}
    >
      {/* Header — positioned top-left inside the group */}
      <div className="absolute -top-3.5 left-4 flex items-center gap-2 rounded-md border border-border/80 bg-void/95 px-3 py-1 shadow-md">
        <Users size={12} className="text-text-muted" />
        <span className="text-[12px] font-medium tracking-tight text-text">{dept.name}</span>
        <span className="ml-1 font-mono text-[10px] text-text-faint">· {dept.owner}</span>
      </div>

      {/* Health pill — top-right */}
      <div className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-md border border-border/80 bg-void/95 px-2 py-1">
        <span className={cn("font-mono text-[10px] font-semibold tabular-nums", tone.text)}>
          %{dept.health}
        </span>
        <div className="h-1 w-10 overflow-hidden rounded-full bg-elevated">
          <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${dept.health}%` }} />
        </div>
      </div>
    </div>
  );
}
