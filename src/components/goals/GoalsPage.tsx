"use client";

import { useMemo } from "react";
import { useWorkspaceStore } from "@/lib/store";
import { goals as allGoals } from "@/lib/mock-data";
import { GoalsHero } from "./GoalsHero";
import { GoalCard } from "./GoalCard";
import { ThemeCoverageStrip } from "./ThemeCoverageStrip";
import { OracleGuide } from "../oracle/OracleGuide";

export function GoalsPage() {
  const { currentWorkspaceId, workspaces, createdGoals } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  if (!ws) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-text-muted">
        Workspace yok — sol üstten ekle.
      </div>
    );
  }
  const wsGoals = useMemo(
    () => [
      ...allGoals.filter((g) => g.workspaceId === ws.id),
      ...createdGoals
        .filter((c) => c.entity.workspaceId === ws.id)
        .map((c) => c.entity),
    ],
    [ws.id, createdGoals]
  );

  const ordered = useMemo(() => {
    const order: Record<string, number> = {
      "off-track": 0,
      "at-risk": 1,
      "on-track": 2,
      ahead: 3,
    };
    return [...wsGoals].sort((a, b) => order[a.trajectory] - order[b.trajectory]);
  }, [wsGoals]);

  return (
    <div className="flex flex-col">
      <GoalsHero ws={ws} goals={wsGoals} />

      <section className="space-y-6 px-8 py-8">
        <OracleGuide page="goals" />
        <ThemeCoverageStrip ws={ws} goals={wsGoals} />

        {wsGoals.length === 0 ? (
          <EmptyGoals />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {ordered.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyGoals() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-elevated/30 px-8 py-20 text-center">
      <h3 className="text-lg font-medium text-text">Henüz bir hedef yok</h3>
      <p className="mt-2 max-w-md text-sm text-text-muted leading-relaxed">
        OKR'lerini tanımladığında Matrix her ajan çağrısını, her skill çalışmasını ve her
        workflow sonucunu otomatik olarak bu hedeflerin yörüngesine işler.
      </p>
    </div>
  );
}
