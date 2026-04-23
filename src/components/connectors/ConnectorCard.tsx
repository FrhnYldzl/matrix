"use client";

import { cn } from "@/lib/cn";
import {
  priceLabel,
  statusLabels,
  statusTone,
  type Connector,
} from "@/lib/connectors";
import { Card } from "../ui/Card";
import { StatusDot } from "../ui/StatusDot";
import { Cpu, MapPin, Package, Zap } from "lucide-react";

const toneClass = {
  quantum: "border-quantum/30 bg-quantum-soft/30 text-quantum",
  solar: "border-solar/30 bg-solar-soft/30 text-solar",
  crimson: "border-crimson/30 bg-crimson-soft/30 text-crimson",
  ion: "border-ion/30 bg-ion-soft/30 text-ion",
  neutral: "border-border/60 bg-elevated/50 text-text-muted",
} as const;

export function ConnectorCard({
  connector,
  onOpen,
}: {
  connector: Connector;
  onOpen: () => void;
}) {
  const tone = statusTone(connector.status);
  const isPhysical = connector.category === "physical-world" || connector.physical;
  const isEngine = connector.category === "engines";
  const isProgram = connector.category === "free-programs";
  const usedCount =
    (connector.usedBySkillNames?.length || 0) +
    (connector.usedByWorkflowNames?.length || 0);

  return (
    <button
      onClick={onOpen}
      className={cn(
        "group relative flex min-w-0 flex-col rounded-xl border bg-surface/70 p-4 text-left backdrop-blur-sm transition-all hover:border-border-strong",
        isPhysical
          ? "border-solar/30 shadow-[0_0_24px_rgba(255,181,71,0.1)]"
          : isEngine
          ? "border-ion/30 shadow-[0_0_24px_rgba(77,184,255,0.08)]"
          : isProgram
          ? "border-quantum/30 shadow-[0_0_24px_rgba(61,224,168,0.08)]"
          : "border-border/60"
      )}
    >
      {isPhysical && (
        <span className="absolute -top-px left-5 right-5 h-px bg-gradient-to-r from-transparent via-solar/60 to-transparent" />
      )}
      {isEngine && (
        <span className="absolute -top-px left-5 right-5 h-px bg-gradient-to-r from-transparent via-ion/60 to-transparent" />
      )}
      {isProgram && (
        <span className="absolute -top-px left-5 right-5 h-px bg-gradient-to-r from-transparent via-quantum/60 to-transparent" />
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold uppercase",
            isPhysical
              ? "border-solar/40 bg-solar-soft text-solar"
              : isEngine
              ? "border-ion/40 bg-ion-soft text-ion"
              : isProgram
              ? "border-quantum/40 bg-quantum-soft text-quantum"
              : "border-border/60 bg-elevated text-text"
          )}
        >
          {connector.shortCode}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-text">{connector.name}</span>
            {isPhysical && (
              <span className="inline-flex items-center gap-0.5 rounded border border-solar/30 bg-solar-soft px-1 py-px font-mono text-[8px] uppercase tracking-wider text-solar">
                <MapPin size={8} />
                fiziksel
              </span>
            )}
            {isEngine && (
              <span className="inline-flex items-center gap-0.5 rounded border border-ion/40 bg-ion-soft px-1 py-px font-mono text-[8px] uppercase tracking-wider text-ion">
                <Cpu size={8} />
                engine
              </span>
            )}
            {isProgram && (
              <span className="inline-flex items-center gap-0.5 rounded border border-quantum/40 bg-quantum-soft px-1 py-px font-mono text-[8px] uppercase tracking-wider text-quantum">
                <Package size={8} />
                program
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-text-faint truncate">
            {connector.vendor}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusDot
            tone={
              connector.status === "connected"
                ? "live"
                : connector.status === "error"
                ? "error"
                : connector.status === "needs-auth" || connector.status === "rate-limited"
                ? "paused"
                : "idle"
            }
          />
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
              toneClass[tone]
            )}
          >
            {statusLabels[connector.status]}
          </span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-text-muted">
        {connector.tagline}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-2.5 font-mono text-[10px]">
        <span className="flex items-center gap-1.5 text-text-muted">
          <Zap size={10} />
          {connector.callsToday.toLocaleString("tr-TR")} çağrı
        </span>
        <span className="text-text">{priceLabel(connector.pricing)}</span>
      </div>

      {usedCount > 0 && (
        <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[9px] text-text-faint">
          {connector.usedBySkillNames && connector.usedBySkillNames.length > 0 && (
            <span>
              {connector.usedBySkillNames.length} skill
            </span>
          )}
          {connector.usedBySkillNames?.length &&
            connector.usedByWorkflowNames?.length && <span>·</span>}
          {connector.usedByWorkflowNames && connector.usedByWorkflowNames.length > 0 && (
            <span>{connector.usedByWorkflowNames.length} workflow</span>
          )}
        </div>
      )}
    </button>
  );
}
