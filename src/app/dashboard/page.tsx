"use client";

import { useEffect, useState } from "react";
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
import { OracleStream } from "@/components/oracle/OracleStream";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  return <DashboardWithStream />;
}

/**
 * Stream-first dashboard.
 *
 * Ferhan'ın direktifi:
 *   1. "Boeing kokpit hissi olmasın" — dashboard'lar dominant değil
 *   2. "Kullanıcı dashboard'lara bağlı değil" — Oracle Stream tek başına yeter
 *   3. "Temelde mantığı olmalı" — backend'de entity'ler var, görsel sadece Stream
 *
 * Layout:
 *   ┌────────────────────────────────────┐
 *   │ HeroHeader (kompakt selamlama)     │
 *   ├────────────────────────────────────┤
 *   │ OracleGuide (sayfa-özel öneri)     │
 *   ├────────────────────────────────────┤
 *   │ ⭐ ORACLE STREAM (dominant)         │
 *   │   ┌──────────────────────┐         │
 *   │   │ Quick-win kartı [Yap]│         │
 *   │   │ OKR kartı [Onayla]   │         │
 *   │   │ Ritual kartı [✓]     │         │
 *   │   └──────────────────────┘         │
 *   ├────────────────────────────────────┤
 *   │ [▼ Tüm tabloyu gör]  ◄── toggle    │
 *   │   (klasik kartlar gizli — açılır)   │
 *   └────────────────────────────────────┘
 */
function DashboardWithStream() {
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  return (
    <div className="flex flex-col">
      <HeroHeader />

      <section className="space-y-6 px-8 py-8">
        <OracleGuide page="command-deck" />

        {/* ⭐ Oracle Stream — DOMINANT katman. Kullanıcı sadece bunu görür,
            tüm aksiyonlar inline. Goals/Operator/Prime'a gitmeye gerek yok. */}
        <OracleStream />

        {/* Toggle: Klasik dashboard görünümü — opsiyonel. Default kapalı. */}
        <button
          onClick={() => setShowFullDashboard((s) => !s)}
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-elevated/20 px-4 py-3 text-sm text-text-muted transition-all hover:border-border hover:bg-elevated/40 hover:text-text"
        >
          {showFullDashboard ? (
            <>
              <ChevronUp size={14} />
              Tüm tabloyu gizle
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Tüm tabloyu gör (KPI · Constellation · Goal Orbits · Activity)
              <span className="ml-2 font-mono text-[10px] text-text-faint">
                opsiyonel
              </span>
            </>
          )}
        </button>

        {showFullDashboard && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
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
          </div>
        )}
      </section>
    </div>
  );
}
