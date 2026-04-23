"use client";

import { cn } from "@/lib/cn";
import { Bot, Users, Waypoints, Wrench } from "lucide-react";

const items = [
  {
    kind: "department",
    label: "Departman",
    hint: "Ops, Sales, İçerik…",
    icon: Users,
    accent: "ion",
  },
  {
    kind: "agent",
    label: "Ajan",
    hint: "Claude Agent SDK rolü",
    icon: Bot,
    accent: "nebula",
  },
  {
    kind: "skill",
    label: "Skill",
    hint: "Tetikleyicili prosedür",
    icon: Wrench,
    accent: "nebula",
  },
  {
    kind: "workflow",
    label: "Workflow",
    hint: "Cron / webhook / manuel",
    icon: Waypoints,
    accent: "quantum",
  },
] as const;

const accentCls: Record<string, string> = {
  ion: "bg-ion-soft text-ion border-ion/30",
  nebula: "bg-nebula-soft text-nebula border-nebula/30",
  quantum: "bg-quantum-soft text-quantum border-quantum/30",
};

export function Palette() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/60 bg-surface/40">
      <div className="border-b border-border/60 px-4 py-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-text-faint">Palet</div>
        <div className="mt-1 text-sm text-text-muted">Canvas'a sürükle veya tıkla</div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.kind}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/matrix-node", it.kind);
                e.dataTransfer.effectAllowed = "move";
              }}
              className={cn(
                "group flex w-full items-start gap-3 rounded-lg border border-border/60 bg-elevated/50 p-3 text-left transition-all hover:border-border-strong hover:bg-raised cursor-grab active:cursor-grabbing"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                  accentCls[it.accent]
                )}
              >
                <Icon size={14} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text">{it.label}</div>
                <div className="mt-0.5 text-[11px] text-text-muted leading-snug">
                  {it.hint}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="border-t border-border/60 p-3">
        <p className="text-[11px] leading-relaxed text-text-faint">
          <span className="text-text-muted">İpucu:</span> Bir öğeyi canvas'a bırakıp adını girdiğinde
          Matrix, ilgili AGENT.md / SKILL.md / YAML iskeletini otomatik oluşturur.
        </p>
      </div>
    </aside>
  );
}
