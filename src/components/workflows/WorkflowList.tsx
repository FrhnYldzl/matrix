"use client";

import { cn } from "@/lib/cn";
import type { Workflow } from "@/lib/types";
import { StatusDot } from "../ui/StatusDot";
import { Waypoints } from "lucide-react";

export function WorkflowList({
  workflows,
  selectedId,
  onSelect,
}: {
  workflows: Workflow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border/60 bg-surface/40">
      <div className="border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Waypoints size={13} className="text-quantum" />
          <span className="text-[10px] uppercase tracking-[0.22em] text-text-faint">Workflows</span>
        </div>
        <div className="mt-1 text-xs text-text-muted">
          {workflows.length === 0 ? "Bu workspace'te workflow yok" : `${workflows.length} akış`}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {workflows.length === 0 && (
          <div className="mx-2 mt-2 rounded-lg border border-dashed border-border/60 bg-elevated/30 p-4 text-xs text-text-muted">
            Library'den yeni bir workflow oluştur veya Oracle'dan kabul et.
          </div>
        )}
        <ul className="space-y-1">
          {workflows.map((w) => {
            const active = w.id === selectedId;
            const tone =
              w.lastStatus === "success"
                ? "live"
                : w.lastStatus === "running"
                ? "waiting"
                : w.lastStatus === "pending-approval"
                ? "paused"
                : "error";
            return (
              <li key={w.id}>
                <button
                  onClick={() => onSelect(w.id)}
                  className={cn(
                    "group w-full rounded-md px-3 py-2.5 text-left transition-colors",
                    active ? "bg-elevated/80" : "hover:bg-elevated/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <StatusDot tone={tone} />
                    <span className="truncate font-mono text-[12px] font-medium text-text">
                      {w.name}
                    </span>
                  </div>
                  <div className="mt-1 ml-4 text-[11px] text-text-muted">{w.cadence}</div>
                  <div className="mt-0.5 ml-4 font-mono text-[10px] text-text-faint">
                    {w.steps} adım · {w.nextRun}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
