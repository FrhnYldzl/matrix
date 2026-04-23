"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { goals as seedGoals } from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import type { Goal } from "@/lib/types";
import { Target } from "lucide-react";
import Link from "next/link";

const trajectoryMeta: Record<Goal["trajectory"], { label: string; bar: string; text: string }> = {
  ahead: { label: "Önde", bar: "bg-quantum", text: "text-quantum" },
  "on-track": { label: "Rotada", bar: "bg-ion", text: "text-ion" },
  "at-risk": { label: "Risk", bar: "bg-solar", text: "text-solar" },
  "off-track": { label: "Saptı", bar: "bg-crimson", text: "text-crimson" },
};

export function GoalOrbits() {
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const createdGoals = useWorkspaceStore((s) => s.createdGoals);
  const items = useMemo(
    () =>
      [
        ...seedGoals.filter((g) => g.workspaceId === wsId),
        ...createdGoals
          .filter((c) => c.entity.workspaceId === wsId)
          .map((c) => c.entity),
      ].slice(0, 5),
    [wsId, createdGoals]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target size={16} className="text-quantum" />
          <CardTitle>Hedef Yörüngeleri</CardTitle>
        </div>
        <Link href="/goals" className="text-xs text-text-muted hover:text-text">
          Tümü →
        </Link>
      </CardHeader>
      <CardBody className="space-y-4">
        {items.map((g) => {
          const pct = Math.min(100, (g.current / g.target) * 100);
          const meta = trajectoryMeta[g.trajectory];
          return (
            <div key={g.id}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-text truncate">{g.title}</span>
                <span className={cn("font-mono text-xs font-medium", meta.text)}>{meta.label}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2 text-xs text-text-muted">
                <span className="font-mono text-text">
                  {g.current}
                  {g.unit === "%" ? "%" : ""}
                </span>
                <span>/</span>
                <span>
                  {g.target}
                  {g.unit === "%" ? "%" : ` ${g.unit}`}
                </span>
                <span className="ml-auto font-mono text-text-faint">%{Math.round(pct)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", meta.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
