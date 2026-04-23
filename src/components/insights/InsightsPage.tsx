"use client";

import { useWorkspaceStore } from "@/lib/store";
import { BarChart3 } from "lucide-react";
import { LeverageScorecard } from "./LeverageScorecard";
import { PerformanceTable } from "./PerformanceTable";
import { DepartmentHealthGrid } from "./DepartmentHealthGrid";
import { WeeklyRetroCard } from "./WeeklyRetroCard";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";

export function InsightsPage() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  // In a real build these come from audit aggregates — here: workspace-biased mock
  const delegatedHours = ws.id === "ws-ferhan-core" ? 42 : ws.id === "ws-trading-desk" ? 18 : 22;
  const managementHours = ws.id === "ws-ferhan-core" ? 6.2 : ws.id === "ws-trading-desk" ? 4.1 : 5.5;
  const history =
    ws.id === "ws-ferhan-core"
      ? [1.8, 2.2, 2.6, 3.0, 3.4, 3.8, 4.2, 4.7, 5.2, 5.8, 6.3, 6.77]
      : ws.id === "ws-trading-desk"
      ? [1.1, 1.4, 1.8, 2.1, 2.5, 2.9, 3.2, 3.5, 3.8, 4.0, 4.2, 4.39]
      : [1.2, 1.5, 1.9, 2.2, 2.6, 2.9, 3.1, 3.4, 3.6, 3.8, 3.9, 4.0];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="ion" opacity={0.08} />
        <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-[500px] rounded-full bg-ion/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-quantum/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <BarChart3 size={12} className="text-ion" />
            The Truth · {ws.name}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            Bu hafta sistem sana ne kazandırdı?
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-muted leading-relaxed">
            Kaldıraç oranı, ajan/skill performansı, departman sağlığı ve Oracle öneri kabul
            hızı — tek bakışta. 3x altındaysa yatırım zayıf; 5-10x arasıysa fazlasıyla iyi.
          </p>

          <div className="mt-6 max-w-3xl">
            <MatrixQuote speaker={MODULE_QUOTES["/insights"].speaker} tone={MODULE_QUOTES["/insights"].tone}>
              {MODULE_QUOTES["/insights"].line}
            </MatrixQuote>
          </div>
        </div>
      </section>

      <section className="space-y-6 px-8 py-8">
        <LeverageScorecard
          delegatedHours={delegatedHours}
          managementHours={managementHours}
          history={history}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceTable />
          </div>
          <div>
            <WeeklyRetroCard />
          </div>
        </div>

        <DepartmentHealthGrid />
      </section>
    </div>
  );
}
