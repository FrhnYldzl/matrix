"use client";

import { cn } from "@/lib/cn";
import type { OracleKind } from "@/lib/types";
import type { Priority, Suggestion } from "@/lib/oracle";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { Filter } from "lucide-react";

export interface Filters {
  kinds: Set<OracleKind>;
  priorities: Set<Priority>;
}

const kindLabels: Record<OracleKind, { label: string; tone: string }> = {
  gap: { label: "Boşluk", tone: "text-ion border-ion/40 bg-ion-soft" },
  strategy: { label: "Strateji", tone: "text-nebula border-nebula/40 bg-nebula-soft" },
  ops: { label: "Operasyonel", tone: "text-quantum border-quantum/40 bg-quantum-soft" },
  risk: { label: "Risk", tone: "text-crimson border-crimson/40 bg-crimson-soft" },
};

const prioLabels: Record<Priority, { label: string; tone: string }> = {
  high: { label: "Yüksek", tone: "text-crimson border-crimson/40 bg-crimson-soft" },
  medium: { label: "Orta", tone: "text-solar border-solar/40 bg-solar-soft" },
  low: { label: "Düşük", tone: "text-text-muted border-border bg-elevated" },
};

export function FilterPanel({
  suggestions,
  filters,
  onChange,
}: {
  suggestions: Suggestion[];
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const countBy = {
    gap: suggestions.filter((s) => s.kind === "gap").length,
    strategy: suggestions.filter((s) => s.kind === "strategy").length,
    ops: suggestions.filter((s) => s.kind === "ops").length,
    risk: suggestions.filter((s) => s.kind === "risk").length,
    high: suggestions.filter((s) => s.priority === "high").length,
    medium: suggestions.filter((s) => s.priority === "medium").length,
    low: suggestions.filter((s) => s.priority === "low").length,
  };

  const toggleKind = (k: OracleKind) => {
    const next = new Set(filters.kinds);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    onChange({ ...filters, kinds: next });
  };

  const togglePrio = (p: Priority) => {
    const next = new Set(filters.priorities);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    onChange({ ...filters, priorities: next });
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-text-muted" />
          <CardTitle>Filtreler</CardTitle>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">Tür</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(kindLabels) as OracleKind[]).map((k) => {
              const active = filters.kinds.has(k);
              const meta = kindLabels[k];
              return (
                <button
                  key={k}
                  onClick={() => toggleKind(k)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                    active
                      ? meta.tone + " shadow-inner"
                      : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
                  )}
                >
                  <span>{meta.label}</span>
                  <span className="font-mono text-[10px] opacity-70">{countBy[k]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-faint">Öncelik</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(prioLabels) as Priority[]).map((p) => {
              const active = filters.priorities.has(p);
              const meta = prioLabels[p];
              return (
                <button
                  key={p}
                  onClick={() => togglePrio(p)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                    active
                      ? meta.tone + " shadow-inner"
                      : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
                  )}
                >
                  <span>{meta.label}</span>
                  <span className="font-mono text-[10px] opacity-70">{countBy[p]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-elevated/40 p-3 text-[11px] leading-relaxed text-text-muted">
          <span className="font-medium text-text">İpucu:</span> Filtreleri hiçbir türde seçmezsen
          hepsi gösterilir. "Yüksek + Risk" kombinasyonu günün en kritik listesini verir.
        </div>
      </CardBody>
    </Card>
  );
}

export function defaultFilters(): Filters {
  return { kinds: new Set(), priorities: new Set() };
}

export function applyFilters(suggestions: Suggestion[], f: Filters): Suggestion[] {
  return suggestions.filter((s) => {
    if (f.kinds.size > 0 && !f.kinds.has(s.kind)) return false;
    if (f.priorities.size > 0 && !f.priorities.has(s.priority)) return false;
    return true;
  });
}
