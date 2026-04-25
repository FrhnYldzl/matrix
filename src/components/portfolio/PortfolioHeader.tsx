"use client";

/**
 * PortfolioHeader — "Vibe Business" doktrininin görsel kalbi.
 *
 * Ferhan: "Varlıklar var, sanki işlem yapılan hisse ve fonlar gibi."
 *
 * Bu komponent kullanıcıya **portföy tablosu** mental modelini verir.
 * Robinhood/Trading 212 hissi: total value + change + ROI.
 *
 * Hesaplama (şimdilik basit):
 *   - Total MRR = sum(revenueAttribution[wsId])
 *   - Asset count = workspaces.length
 *   - Healthy count = on-track/ahead trajectory'li goal'i olan workspace'ler
 *   - At-risk count = at-risk/off-track ones
 */

import { useMemo } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/lib/store";
import { revenueAttribution } from "@/lib/costs";
import { goals as seedGoals } from "@/lib/mock-data";
import { cn } from "@/lib/cn";
import {
  ArrowUpRight,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export function PortfolioHeader() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const createdGoals = useWorkspaceStore((s) => s.createdGoals);

  const stats = useMemo(() => {
    if (workspaces.length === 0) {
      return {
        totalMrr: 0,
        assetCount: 0,
        healthyCount: 0,
        atRiskCount: 0,
        weeklyChange: 0,
      };
    }

    const totalMrr = workspaces.reduce(
      (sum, w) => sum + (revenueAttribution[w.id]?.monthlyUsd ?? 0),
      0
    );

    let healthy = 0;
    let atRisk = 0;
    workspaces.forEach((w) => {
      const wsGoals = [
        ...seedGoals.filter((g) => g.workspaceId === w.id),
        ...createdGoals
          .filter((c) => c.entity.workspaceId === w.id)
          .map((c) => c.entity),
      ];
      if (wsGoals.length === 0) return; // henüz değerlendirme yok
      const offCount = wsGoals.filter(
        (g) => g.trajectory === "at-risk" || g.trajectory === "off-track"
      ).length;
      const aheadCount = wsGoals.filter(
        (g) => g.trajectory === "ahead" || g.trajectory === "on-track"
      ).length;
      if (aheadCount > offCount) healthy++;
      if (offCount > 0) atRisk++;
    });

    // Weekly change — şimdilik mock pseudo-random (gerçek dünyada history ile)
    const weeklyChange = totalMrr > 0 ? Math.round((Math.sin(workspaces.length * 7.3) + 1) * 8 - 4) : 0;

    return {
      totalMrr,
      assetCount: workspaces.length,
      healthyCount: healthy,
      atRiskCount: atRisk,
      weeklyChange,
    };
  }, [workspaces, createdGoals]);

  const isPositive = stats.weeklyChange >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-quantum-soft/15 via-elevated/40 to-nebula-soft/10 p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-quantum to-transparent" />
      <div className="pointer-events-none absolute -top-20 right-0 h-40 w-[500px] rounded-full bg-quantum/8 blur-3xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {/* Left: portfolio value */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            <Wallet size={11} className="text-quantum" />
            Portföyün · holdco görünümü
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-sans text-4xl font-semibold tabular-nums text-text md:text-5xl">
              ${stats.totalMrr.toLocaleString("en-US")}
            </div>
            <div className="text-sm text-text-muted">/ ay MRR</div>
            {stats.assetCount > 0 && stats.weeklyChange !== 0 && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] tabular-nums",
                  isPositive
                    ? "border-quantum/30 bg-quantum-soft/30 text-quantum"
                    : "border-crimson/30 bg-crimson-soft/30 text-crimson"
                )}
              >
                {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isPositive ? "+" : ""}
                {stats.weeklyChange}% bu hafta
              </div>
            )}
          </div>

          {/* Counter pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <Pill
              tone="ion"
              count={stats.assetCount}
              label={stats.assetCount === 1 ? "varlık" : "varlık"}
            />
            {stats.healthyCount > 0 && (
              <Pill tone="quantum" count={stats.healthyCount} label="sağlıklı" />
            )}
            {stats.atRiskCount > 0 && (
              <Pill tone="solar" count={stats.atRiskCount} label="müdahale" />
            )}
            {stats.assetCount === 0 && (
              <span className="text-text-muted">
                Henüz portföye varlık eklemedin — ilk hamleni yap.
              </span>
            )}
          </div>
        </div>

        {/* Right: action */}
        <div className="flex shrink-0 items-center gap-2">
          {stats.assetCount === 0 ? (
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-quantum to-quantum/80 px-4 py-2 text-sm font-semibold text-void shadow-[0_0_24px_rgba(61,224,168,0.3)] transition-all hover:scale-[1.02]"
            >
              <Plus size={14} />
              İlk varlığını başlat
              <ArrowUpRight size={13} />
            </Link>
          ) : (
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg border border-quantum/40 bg-quantum-soft/30 px-4 py-2 text-sm font-medium text-quantum transition-all hover:bg-quantum/20"
            >
              <Plus size={13} />
              Yeni varlık
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({
  tone,
  count,
  label,
}: {
  tone: "ion" | "quantum" | "solar" | "nebula" | "crimson";
  count: number;
  label: string;
}) {
  const cls =
    tone === "ion"
      ? "border-ion/30 bg-ion-soft text-ion"
      : tone === "quantum"
      ? "border-quantum/30 bg-quantum-soft text-quantum"
      : tone === "solar"
      ? "border-solar/30 bg-solar-soft text-solar"
      : tone === "nebula"
      ? "border-nebula/30 bg-nebula-soft text-nebula"
      : "border-crimson/30 bg-crimson-soft text-crimson";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        cls
      )}
    >
      <span className="font-semibold tabular-nums">{count}</span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}
