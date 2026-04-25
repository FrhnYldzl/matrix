"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { OracleStream } from "@/components/oracle/OracleStream";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { AssetTable } from "@/components/portfolio/AssetTable";
import { ArrowRight, BarChart3 } from "lucide-react";

/**
 * /dashboard — The Construct (Vibe Business)
 *
 * Ferhan'ın doktrini:
 *   "Varlıklar var, sanki işlem yapılan hisse ve fonlar gibi.
 *    Oracle benim yerime işi yönetsin, sonuçları göreyim."
 *
 * Bu route'un işi 3 katmanda netleşti:
 *   1. PortfolioHeader  — toplam değer, change %, varlık sayısı (Robinhood hissi)
 *   2. OracleStream     — Oracle'ın bu hafta için aksiyonları
 *   3. AssetTable       — workspaces hisse satırı gibi (ticker + MRR + Δ + status)
 *
 * Klasik panoramik dashboard (KPI/Constellation/GoalOrbits/etc.) artık
 * /portfolio route'una taşındı. "Tüm tabloyu gör" linki ile erişilir.
 */
export default function DashboardPage() {
  const router = useRouter();
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  // First-time user — onboarding'e yönlen
  useEffect(() => {
    if (workspaces.length === 0) {
      router.replace("/onboarding");
    }
  }, [workspaces.length, router]);

  if (workspaces.length === 0) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center text-text-muted">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-nebula">
            Oracle yükleniyor…
          </div>
          <div className="mt-2 text-sm">
            İlk varlığını başlatmak için yönlendiriliyorsun.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="space-y-6 px-8 py-8">
        {/* 1. Portfolio Header — Vibe Business hissi */}
        <PortfolioHeader />

        {/* 2. Oracle Stream — bu haftaki aksiyonlar */}
        <OracleStream />

        {/* 3. Asset Table — varlıklar hisse satırı gibi */}
        <AssetTable />

        {/* Link: tüm tabloyu gör → /portfolio */}
        <Link
          href="/portfolio"
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-elevated/20 px-4 py-3 text-sm text-text-muted transition-all hover:border-border hover:bg-elevated/40 hover:text-text"
        >
          <BarChart3 size={13} />
          Panoramik analitik görünüm
          <span className="font-mono text-[10px] text-text-faint">
            (KPI · Constellation · Goal Orbits · Activity Feed)
          </span>
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </section>
    </div>
  );
}
