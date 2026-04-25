"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { HeroHeader } from "@/components/deck/HeroHeader";
import { KpiRow } from "@/components/deck/KpiRow";
import { Constellation } from "@/components/deck/Constellation";
import { OracleNudges } from "@/components/deck/OracleNudges";
import { ActivityFeed } from "@/components/deck/ActivityFeed";
import { GoalOrbits } from "@/components/deck/GoalOrbits";
import { BlueprintSuggestionBanner } from "@/components/deck/BlueprintSuggestionBanner";
import { PortfolioRollup } from "@/components/deck/PortfolioRollup";
import { OracleGuide } from "@/components/oracle/OracleGuide";

/**
 * /dashboard — The Construct (Command Deck)
 *
 * Login sonrası landing route. Empty portföyü olan first-time user'lar
 * otomatik /onboarding'e yönlendirilir — Oracle conversational onboarding.
 */
export default function DashboardPage() {
  const router = useRouter();
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  // First-time user redirect — workspace yoksa Oracle conversation'a yolla.
  // useEffect ile (hydration'dan sonra çalışır, server-side mismatch yok).
  useEffect(() => {
    if (workspaces.length === 0) {
      router.replace("/onboarding");
    }
  }, [workspaces.length, router]);

  // Empty state — redirect olana kadar fallback (kısa süre)
  if (workspaces.length === 0) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center text-text-muted">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
            Oracle yükleniyor…
          </div>
          <div className="mt-2 text-sm">İlk kurulum için yönlendiriliyorsun.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <HeroHeader />

      <section className="space-y-6 px-8 py-8">
        <OracleGuide page="command-deck" />
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
