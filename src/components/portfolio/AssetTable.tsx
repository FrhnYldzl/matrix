"use client";

/**
 * AssetTable — workspaces as stock-style ticker rows.
 *
 * Ferhan'ın doktrini: "Varlıklar var, sanki işlem yapılan hisse ve fonlar gibi."
 *
 * Her satır = bir dijital varlık (workspace).
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ TICKER  AD                MRR/AY    Δ HAFTA    DURUM    →   │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │ NL      AI Matrix News    $0       —          SETUP    →    │
 *   │ TR      TüketiciRadar     $1.2K    +5%        AHEAD    →    │
 *   │ JS      Juris SaaS        $5.8K    -2%        AT-RISK  →    │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Tıklanan satır → workspace switch + dashboard refresh
 * "+ Yeni varlık" → /onboarding
 *
 * Durum hesaplama: workspace'in goal'lerinin trajectory aggregate'i
 *   ahead-dominant → AHEAD (quantum)
 *   on-track → ON-TRACK (ion)
 *   at-risk → AT-RISK (solar)
 *   off-track → CRITICAL (crimson)
 *   no goals → SETUP (nebula)
 */

import { useMemo } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/lib/store";
import { revenueAttribution } from "@/lib/costs";
import { goals as seedGoals } from "@/lib/mock-data";
import { cn } from "@/lib/cn";
import {
  ArrowUpRight,
  Check,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type AssetStatus = "AHEAD" | "ON-TRACK" | "AT-RISK" | "CRITICAL" | "SETUP";

const STATUS_META: Record<
  AssetStatus,
  { tone: string; label: string; description: string }
> = {
  AHEAD: {
    tone: "text-quantum bg-quantum-soft border-quantum/40",
    label: "AHEAD",
    description: "Hedefin önünde — momentum güçlü",
  },
  "ON-TRACK": {
    tone: "text-ion bg-ion-soft border-ion/40",
    label: "ON-TRACK",
    description: "Rotada — hedefe yaklaşıyor",
  },
  "AT-RISK": {
    tone: "text-solar bg-solar-soft border-solar/40",
    label: "AT-RISK",
    description: "Sapma var — Oracle müdahale öneriyor",
  },
  CRITICAL: {
    tone: "text-crimson bg-crimson-soft border-crimson/40",
    label: "CRITICAL",
    description: "Off-track — pivot veya kaynak takviyesi gerek",
  },
  SETUP: {
    tone: "text-nebula bg-nebula-soft border-nebula/40",
    label: "SETUP",
    description: "Yeni varlık — kurulum sürüyor",
  },
};

export function AssetTable() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const createdGoals = useWorkspaceStore((s) => s.createdGoals);

  const assets = useMemo(() => {
    return workspaces.map((w) => {
      const wsGoals = [
        ...seedGoals.filter((g) => g.workspaceId === w.id),
        ...createdGoals
          .filter((c) => c.entity.workspaceId === w.id)
          .map((c) => c.entity),
      ];

      // Status compute
      let status: AssetStatus = "SETUP";
      if (wsGoals.length > 0) {
        const off = wsGoals.filter((g) => g.trajectory === "off-track").length;
        const risk = wsGoals.filter((g) => g.trajectory === "at-risk").length;
        const ahead = wsGoals.filter((g) => g.trajectory === "ahead").length;
        const onTrack = wsGoals.filter((g) => g.trajectory === "on-track").length;
        if (off > 0) status = "CRITICAL";
        else if (risk > 0) status = "AT-RISK";
        else if (ahead > onTrack) status = "AHEAD";
        else status = "ON-TRACK";
      }

      const mrr = revenueAttribution[w.id]?.monthlyUsd ?? 0;
      // Mock weekly change (deterministic per workspace id)
      const seed = w.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const weeklyChange = mrr > 0 ? Math.round((Math.sin(seed) + 1) * 7 - 6) : 0;

      return {
        ws: w,
        ticker: w.shortName,
        mrr,
        weeklyChange,
        status,
        goalCount: wsGoals.length,
      };
    });
  }, [workspaces, createdGoals]);

  if (workspaces.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-elevated/20 p-10 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
          Portföyün boş
        </div>
        <p className="mt-2 text-sm text-text-muted">
          Hero&apos;s Journey&apos;in eşiğindesin. İlk varlığını başlatınca
          burada hisse senedi gibi görünecek.
        </p>
        <Link
          href="/onboarding"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-quantum to-quantum/80 px-4 py-2 text-sm font-medium text-void transition-all hover:scale-[1.02]"
        >
          <Plus size={13} />
          İlk varlığı başlat
          <ArrowUpRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface/40">
      <div className="flex items-center justify-between border-b border-border/50 bg-elevated/30 px-5 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
          Varlıklarım · {assets.length} ticker
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1 rounded-md border border-quantum/30 bg-quantum-soft/40 px-2 py-1 font-mono text-[10px] text-quantum transition-colors hover:bg-quantum/20"
        >
          <Plus size={10} />
          Yeni varlık
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border/40 bg-elevated/15 font-mono text-[10px] uppercase tracking-wider text-text-faint">
            <tr>
              <th className="py-2.5 pl-5 pr-3 text-left">Ticker</th>
              <th className="py-2.5 px-3 text-left">Ad</th>
              <th className="py-2.5 px-3 text-right">MRR</th>
              <th className="py-2.5 px-3 text-right">Δ Hafta</th>
              <th className="py-2.5 px-3 text-left">Durum</th>
              <th className="py-2.5 pl-3 pr-5 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => {
              const meta = STATUS_META[a.status];
              const isActive = a.ws.id === currentWorkspaceId;
              const isPositive = a.weeklyChange >= 0;

              return (
                <tr
                  key={a.ws.id}
                  className={cn(
                    "border-b border-border/30 transition-colors hover:bg-elevated/30",
                    isActive && "bg-nebula-soft/15",
                    "last:border-b-0"
                  )}
                >
                  {/* Ticker badge */}
                  <td className="py-3.5 pl-5 pr-3">
                    <button
                      onClick={() => setWorkspace(a.ws.id)}
                      className={cn(
                        "flex h-8 w-12 items-center justify-center rounded-md border font-mono text-[11px] font-bold transition-all hover:scale-105",
                        a.ws.accent === "ion" && "border-ion/40 bg-ion-soft text-ion",
                        a.ws.accent === "nebula" &&
                          "border-nebula/40 bg-nebula-soft text-nebula",
                        a.ws.accent === "quantum" &&
                          "border-quantum/40 bg-quantum-soft text-quantum",
                        a.ws.accent === "solar" &&
                          "border-solar/40 bg-solar-soft text-solar"
                      )}
                    >
                      {a.ticker}
                    </button>
                  </td>

                  {/* Name + industry */}
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => setWorkspace(a.ws.id)}
                      className="text-left"
                    >
                      <div className="text-sm font-medium text-text">
                        {a.ws.name}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-text-faint">
                        {a.ws.industry}
                      </div>
                    </button>
                  </td>

                  {/* MRR */}
                  <td className="py-3.5 px-3 text-right">
                    <div
                      className={cn(
                        "font-mono text-base font-semibold tabular-nums",
                        a.mrr > 0 ? "text-text" : "text-text-faint"
                      )}
                    >
                      ${formatCompact(a.mrr)}
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] text-text-faint">
                      / ay
                    </div>
                  </td>

                  {/* Weekly change */}
                  <td className="py-3.5 px-3 text-right">
                    {a.weeklyChange === 0 ? (
                      <span className="font-mono text-sm text-text-faint">—</span>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums",
                          isPositive ? "text-quantum" : "text-crimson"
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp size={11} />
                        ) : (
                          <TrendingDown size={11} />
                        )}
                        {isPositive ? "+" : ""}
                        {a.weeklyChange}%
                      </span>
                    )}
                  </td>

                  {/* Status badge */}
                  <td className="py-3.5 px-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                        meta.tone
                      )}
                      title={meta.description}
                    >
                      {meta.label}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 pl-3 pr-5 text-right">
                    <button
                      onClick={() => setWorkspace(a.ws.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[10px] transition-all",
                        isActive
                          ? "border-nebula/40 bg-nebula-soft text-nebula"
                          : "border-border/60 bg-elevated/40 text-text-muted hover:border-border-strong hover:text-text"
                      )}
                    >
                      {isActive ? (
                        <>
                          <Check size={10} />
                          aktif
                        </>
                      ) : (
                        <>
                          aç
                          <ArrowUpRight size={10} />
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}
