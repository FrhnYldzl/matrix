"use client";

import { useMemo } from "react";
import { auditLog } from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "@/lib/cn";
import { AlertTriangle } from "lucide-react";

export function ErrorPatternsCard() {
  const { currentWorkspaceId } = useWorkspaceStore();

  const patterns = useMemo(() => {
    const wsEvents = auditLog.filter((e) => e.workspaceId === currentWorkspaceId);
    const map = new Map<string, { target: string; fails: number; warns: number; actor: string }>();
    wsEvents.forEach((e) => {
      if (e.result === "ok") return;
      const key = `${e.actor}|${e.target}`;
      const prev = map.get(key) || { target: e.target, fails: 0, warns: 0, actor: e.actor };
      if (e.result === "fail") prev.fails += 1;
      if (e.result === "warn") prev.warns += 1;
      map.set(key, prev);
    });
    return Array.from(map.values())
      .sort((a, b) => b.fails * 2 + b.warns - (a.fails * 2 + a.warns))
      .slice(0, 5);
  }, [currentWorkspaceId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-crimson" />
          <CardTitle>Hata Paternleri</CardTitle>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          tekrarlanan sorunlar
        </span>
      </CardHeader>
      <CardBody className="space-y-2">
        {patterns.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-elevated/30 p-6 text-center text-sm text-text-muted">
            Son 30 günde tekrarlayan bir hata paterni yok. Temiz kayıt.
          </div>
        ) : (
          patterns.map((p, i) => {
            const severity = p.fails >= 2 ? "crimson" : p.fails >= 1 ? "solar" : "ion";
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
                  severity === "crimson" && "border-crimson/40 bg-crimson-soft/10",
                  severity === "solar" && "border-solar/40 bg-solar-soft/10",
                  severity === "ion" && "border-border/60 bg-elevated/40"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-ion">{p.actor}</span>
                    <span className="text-text-faint">→</span>
                    <span className="truncate text-text">{p.target}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.fails > 0 && (
                    <span className="inline-flex items-center gap-1 rounded border border-crimson/30 bg-crimson-soft px-1.5 py-0.5 font-mono text-[10px] text-crimson">
                      {p.fails}× fail
                    </span>
                  )}
                  {p.warns > 0 && (
                    <span className="inline-flex items-center gap-1 rounded border border-solar/30 bg-solar-soft px-1.5 py-0.5 font-mono text-[10px] text-solar">
                      {p.warns}× warn
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );
}
