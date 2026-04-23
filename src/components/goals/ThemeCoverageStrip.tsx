"use client";

import type { Goal, Workspace } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Compass } from "lucide-react";
import { cn } from "@/lib/cn";

export function ThemeCoverageStrip({ ws, goals }: { ws: Workspace; goals: Goal[] }) {
  if (ws.strategicThemes.length === 0) return null;

  const goalsByTheme = ws.strategicThemes.map((t) => {
    const linkedGoals = goals.filter((g) => g.linkedThemeIds?.includes(t.id));
    const atRisk = linkedGoals.filter(
      (g) => g.trajectory === "at-risk" || g.trajectory === "off-track"
    ).length;
    return { theme: t, linkedGoals, atRisk };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-nebula" />
          <CardTitle>Tema × Hedef Kapsamı</CardTitle>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          hangi tema kaç hedefe bağlı
        </span>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {goalsByTheme.map(({ theme, linkedGoals, atRisk }) => {
            const orphan = linkedGoals.length === 0;
            const healthy = linkedGoals.length > 0 && atRisk === 0;
            const troubled = atRisk > 0;
            return (
              <div
                key={theme.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5",
                  orphan
                    ? "border-crimson/40 bg-crimson-soft/20"
                    : troubled
                    ? "border-solar/40 bg-solar-soft/20"
                    : healthy
                    ? "border-quantum/30 bg-quantum-soft/10"
                    : "border-border/60 bg-elevated/40"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text truncate">{theme.label}</div>
                  <div className="mt-0.5 text-[11px] text-text-muted">
                    {orphan
                      ? "Hiçbir hedefe bağlı değil — boşluk"
                      : troubled
                      ? `${atRisk} bağlı hedef risk altında`
                      : `${linkedGoals.length} hedefte temsil ediliyor`}
                  </div>
                </div>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold tabular-nums",
                    orphan
                      ? "text-crimson"
                      : troubled
                      ? "text-solar"
                      : healthy
                      ? "text-quantum"
                      : "text-text-muted"
                  )}
                >
                  {linkedGoals.length}
                </span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
