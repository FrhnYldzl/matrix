"use client";

/**
 * /portfolio — klasik panoramik dashboard.
 *
 * Eski /dashboard'da yaşayan tüm ağır kartlar (KPI, Constellation, Goal
 * Orbits, Activity Feed, Portfolio Rollup, Blueprint Suggestion) buraya
 * taşındı. /dashboard artık Vibe Business — sadece PortfolioHeader +
 * OracleStream + AssetTable.
 *
 * Bu sayfa "tüm tabloyu görmek istiyorum" diyene gösterilir.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { KpiRow } from "@/components/deck/KpiRow";
import { Constellation } from "@/components/deck/Constellation";
import { OracleNudges } from "@/components/deck/OracleNudges";
import { ActivityFeed } from "@/components/deck/ActivityFeed";
import { GoalOrbits } from "@/components/deck/GoalOrbits";
import { BlueprintSuggestionBanner } from "@/components/deck/BlueprintSuggestionBanner";
import { PortfolioRollup } from "@/components/deck/PortfolioRollup";

export default function PortfolioPage() {
  const router = useRouter();
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  useEffect(() => {
    if (workspaces.length === 0) router.replace("/onboarding");
  }, [workspaces.length, router]);

  if (workspaces.length === 0) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-text-muted">
        Onboarding&apos;e yönlendiriliyorsun…
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
          Portföy · panoramik görünüm
        </div>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-text md:text-4xl">
          Tüm tablo, tek ekranda
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          KPI, varlık takımyıldızı, hedef yörüngeleri, aktivite akışı ve gelir
          attribution. Stream sayfası&apos;ndan farkı: <b>burası analitik</b>,
          orası aksiyon.
        </p>
      </section>

      <section className="space-y-6 px-8 py-8">
        <BlueprintSuggestionBanner />
        <KpiRow />
        <PortfolioRollup />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Constellation />
            <OracleNudges />
          </div>

          <div className="space-y-6">
            <GoalOrbits />
            <ActivityFeed />
          </div>
        </div>
      </section>
    </div>
  );
}
