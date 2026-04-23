"use client";

import { goals } from "@/lib/mock-data";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import type { Goal, Workspace } from "@/lib/types";
import { ArrowUpRight, Target } from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";

const trajectoryMeta: Record<Goal["trajectory"], { label: string; tone: string }> = {
  ahead: { label: "Önde", tone: "text-quantum" },
  "on-track": { label: "Rotada", tone: "text-ion" },
  "at-risk": { label: "Risk", tone: "text-solar" },
  "off-track": { label: "Saptı", tone: "text-crimson" },
};

export function OkrsLinkCard({ ws }: { ws: Workspace }) {
  const wsGoals = goals.filter((g) => g.workspaceId === ws.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target size={14} className="text-quantum" />
          <CardTitle>OKR'ler</CardTitle>
        </div>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text"
        >
          Detaylı görünüm
          <ArrowUpRight size={11} />
        </Link>
      </CardHeader>
      <CardBody className="space-y-3">
        <p className="text-xs leading-relaxed text-text-muted">
          Stratejik temalarını ölçülebilir hedeflere bağla. Oracle, sapan her hedefin
          gerekçesini ajan/skill/workflow düzeyinde açıklar.
        </p>
        {wsGoals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-4 text-center text-sm text-text-muted">
            Bu workspace'te henüz OKR tanımlanmadı.
            <div className="mt-2">
              <Link href="/goals">
                <Button size="sm" variant="secondary">
                  Goals & Orbits'e git
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {wsGoals.map((g) => {
              const pct = Math.min(100, (g.current / g.target) * 100);
              const meta = trajectoryMeta[g.trajectory];
              return (
                <li
                  key={g.id}
                  className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-text truncate">{g.title}</span>
                    <span className={cn("font-mono text-[11px] font-medium", meta.tone)}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-elevated">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          g.trajectory === "ahead" && "bg-quantum",
                          g.trajectory === "on-track" && "bg-ion",
                          g.trajectory === "at-risk" && "bg-solar",
                          g.trajectory === "off-track" && "bg-crimson"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-text-faint">
                      {g.current}/{g.target} {g.unit === "%" ? "" : g.unit}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
