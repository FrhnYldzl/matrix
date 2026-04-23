"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/cn";
import type { WorkflowStep, WorkflowTrigger } from "@/lib/types";
import {
  Bell,
  CheckCircle2,
  Clock,
  GitBranch,
  Plug,
  Webhook,
  Wrench,
  Zap,
} from "lucide-react";

// -----------------------------------------------------------------------------
// Trigger node — always at top
// -----------------------------------------------------------------------------

export type TriggerNodeData = { trigger: WorkflowTrigger };

export function TriggerNode({ data, selected }: NodeProps) {
  const t = (data as TriggerNodeData).trigger;
  const Icon = t.kind === "schedule" ? Clock : t.kind === "webhook" ? Webhook : Zap;
  const tone =
    t.kind === "schedule" ? "solar" : t.kind === "webhook" ? "ion" : "nebula";

  const title =
    t.kind === "schedule" ? "Cron tetikli" : t.kind === "webhook" ? "Webhook tetikli" : "Manuel tetikli";
  const sub =
    t.kind === "schedule"
      ? `${t.cron || "— cron —"} · ${t.timezone || "—"}`
      : t.kind === "webhook"
      ? t.webhookPath || "/hooks/…"
      : "Kullanıcı tetikler";

  return (
    <div
      className={cn(
        "relative w-[260px] rounded-xl border backdrop-blur-sm transition-all",
        tone === "solar" && "border-solar/50 bg-solar-soft/20 shadow-[0_0_24px_rgba(255,181,71,0.2)]",
        tone === "ion" && "border-ion/50 bg-ion-soft/20 shadow-[0_0_24px_rgba(77,184,255,0.2)]",
        tone === "nebula" && "border-nebula/50 bg-nebula-soft/20 shadow-[0_0_24px_rgba(155,123,255,0.2)]",
        selected && "ring-2 ring-ion/70 ring-offset-2 ring-offset-void"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            tone === "solar" && "bg-solar/20 text-solar",
            tone === "ion" && "bg-ion/20 text-ion",
            tone === "nebula" && "bg-nebula/20 text-nebula"
          )}
        >
          <Icon size={14} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            Trigger
          </div>
          <div className="mt-0.5 text-sm font-medium text-text">{title}</div>
          <div className="mt-1 truncate font-mono text-[11px] text-text-muted">{sub}</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !bg-border-strong !border-0"
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Step node (skill / integration / approval / notify / condition)
// -----------------------------------------------------------------------------

export type StepNodeData = { step: WorkflowStep; index: number };

const stepMeta: Record<
  WorkflowStep["kind"],
  { icon: typeof Wrench; tone: "nebula" | "ion" | "quantum" | "crimson" | "solar" | "neutral"; label: string }
> = {
  skill: { icon: Wrench, tone: "nebula", label: "Skill" },
  integration: { icon: Plug, tone: "ion", label: "Integration" },
  approval: { icon: CheckCircle2, tone: "crimson", label: "Approval" },
  notify: { icon: Bell, tone: "quantum", label: "Notify" },
  condition: { icon: GitBranch, tone: "solar", label: "Condition" },
  trigger: { icon: Zap, tone: "neutral", label: "Trigger" },
};

const toneWrap: Record<string, string> = {
  nebula: "border-nebula/40 bg-elevated/80",
  ion: "border-ion/40 bg-elevated/80",
  quantum: "border-quantum/40 bg-elevated/80",
  crimson: "border-crimson/40 bg-elevated/80",
  solar: "border-solar/40 bg-elevated/80",
  neutral: "border-border/60 bg-elevated/80",
};

const toneChip: Record<string, string> = {
  nebula: "bg-nebula-soft text-nebula",
  ion: "bg-ion-soft text-ion",
  quantum: "bg-quantum-soft text-quantum",
  crimson: "bg-crimson-soft text-crimson",
  solar: "bg-solar-soft text-solar",
  neutral: "bg-elevated text-text-muted",
};

export function StepNode({ data, selected }: NodeProps) {
  const { step, index } = data as StepNodeData;
  const meta = stepMeta[step.kind];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "relative w-[280px] rounded-xl border backdrop-blur-sm transition-all hover:border-border-strong",
        toneWrap[meta.tone],
        selected && "ring-2 ring-ion/70 ring-offset-2 ring-offset-void"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !bg-border-strong !border-0"
      />
      <div className="flex items-start gap-3 p-4">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-semibold",
            toneChip[meta.tone]
          )}
        >
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                toneChip[meta.tone]
              )}
            >
              <Icon size={10} strokeWidth={2} />
              {meta.label}
            </span>
          </div>
          <div className="mt-1.5 text-sm font-medium leading-snug text-text">{step.label}</div>
          {(step.skillRef || step.integration || step.target || step.note) && (
            <div className="mt-1 font-mono text-[11px] text-text-muted">
              {step.skillRef && `→ ${step.skillRef}`}
              {step.integration && `→ ${step.integration}`}
              {step.target && ` · ${step.target}`}
              {!step.skillRef && !step.integration && !step.target && step.note}
            </div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !bg-border-strong !border-0"
      />
    </div>
  );
}
