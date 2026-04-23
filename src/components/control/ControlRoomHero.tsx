"use client";

import { useMemo } from "react";
import { agents, approvals, auditLog } from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { Activity, Radio, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";

export function ControlRoomHero() {
  const { currentWorkspaceId, workspaces, killSwitchArmed, dismissedApprovals } =
    useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  const mounted = useMounted();

  const data = useMemo(() => {
    const wsAgents = agents.filter((a) => a.workspaceId === currentWorkspaceId);
    const wsApprovals = approvals.filter(
      (a) => a.workspaceId === currentWorkspaceId && !dismissedApprovals.has(a.id)
    );
    const wsEvents = auditLog.filter((e) => e.workspaceId === currentWorkspaceId);
    const live = wsAgents.filter((a) => a.status === "live").length;
    // Count all fail events workspace-wide (stable between SSR/client)
    const failsTotal = wsEvents.filter((e) => e.result === "fail").length;
    return {
      total: wsAgents.length,
      live,
      approvals: wsApprovals.length,
      fails24h: failsTotal,
    };
  }, [currentWorkspaceId, dismissedApprovals]);
  void mounted;

  return (
    <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
      <MatrixHexGrid tone="solar" opacity={0.09} />
      <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-[500px] rounded-full bg-solar/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-crimson/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <Radio size={12} className={cn("text-solar", !killSwitchArmed && "animate-breathe")} />
            Nebuchadnezzar · {ws.name}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {killSwitchArmed
              ? "Sistem duraklatıldı."
              : data.fails24h === 0
              ? "Her şey yolunda akıyor."
              : `${data.fails24h} hata audit log'unda.`}
          </h1>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            Canlı ajan durumu, onay kuyruğu, hata paternleri ve tam audit log'u burada.
            Bir şey ters gittiğinde panik butonu bir tık uzakta.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatPill
              count={`${data.live}/${data.total}`}
              label="Canlı ajan"
              tone="ion"
            />
            <StatPill count={data.approvals} label="Onay bekliyor" tone="solar" />
            <StatPill count={data.fails24h} label="Fail (son 30g)" tone={data.fails24h > 0 ? "crimson" : "neutral"} />
            {killSwitchArmed && (
              <span className="inline-flex items-center gap-2 rounded-full border border-crimson/50 bg-crimson-soft px-3 py-1 text-xs text-crimson animate-pulse">
                <ShieldAlert size={12} />
                KILL SWITCH ARMED
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-surface/70 p-4 backdrop-blur-sm lg:min-w-[280px]">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-quantum" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-faint">
              Sistem nabzı
            </span>
          </div>
          <div className="mt-2 space-y-1.5 text-xs">
            <PulseRow label="Orchestrator" ok />
            <PulseRow label="MCP Slack" ok />
            <PulseRow label="MCP Notion" ok />
            <PulseRow label="Golden test CI" warn />
          </div>
        </div>
      </div>

      <div className="relative mt-6 max-w-3xl">
        <MatrixQuote speaker={MODULE_QUOTES["/control"].speaker} tone={MODULE_QUOTES["/control"].tone}>
          {MODULE_QUOTES["/control"].line}
        </MatrixQuote>
      </div>
    </section>
  );
}

function StatPill({
  count,
  label,
  tone,
}: {
  count: number | string;
  label: string;
  tone: "ion" | "quantum" | "solar" | "crimson" | "neutral";
}) {
  const toneCls =
    tone === "ion"
      ? "text-ion bg-ion-soft border-ion/30"
      : tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/30"
      : tone === "solar"
      ? "text-solar bg-solar-soft border-solar/30"
      : tone === "crimson"
      ? "text-crimson bg-crimson-soft border-crimson/30"
      : "text-text-muted bg-elevated border-border";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${toneCls}`}
    >
      <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}

function PulseRow({ label, ok, warn }: { label: string; ok?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px]">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            ok && "bg-quantum animate-breathe",
            warn && "bg-solar"
          )}
        />
        <span className={cn(ok && "text-quantum", warn && "text-solar")}>
          {ok ? "ok" : "warn"}
        </span>
      </span>
    </div>
  );
}
