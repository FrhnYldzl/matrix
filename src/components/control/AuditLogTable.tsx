"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { auditLog } from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import type { AuditEvent } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "../ui/Card";
import { ScrollText, Search } from "lucide-react";

type ResultFilter = "all" | "ok" | "warn" | "fail";

function timeShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditLogTable() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [query, setQuery] = useState("");

  const events = useMemo(() => {
    return auditLog
      .filter((e) => e.workspaceId === currentWorkspaceId)
      .filter((e) => filter === "all" || e.result === filter)
      .filter((e) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          e.actor.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          (e.traceId || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [currentWorkspaceId, filter, query]);

  const counts = useMemo(() => {
    const wsEvents = auditLog.filter((e) => e.workspaceId === currentWorkspaceId);
    return {
      all: wsEvents.length,
      ok: wsEvents.filter((e) => e.result === "ok").length,
      warn: wsEvents.filter((e) => e.result === "warn").length,
      fail: wsEvents.filter((e) => e.result === "fail").length,
    };
  }, [currentWorkspaceId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ScrollText size={14} className="text-text-muted" />
          <CardTitle>Audit Log</CardTitle>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          her Task → Notion'a yazılır
        </span>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1.5">
            <FilterPill
              label="Tümü"
              count={counts.all}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterPill
              label="OK"
              count={counts.ok}
              tone="quantum"
              active={filter === "ok"}
              onClick={() => setFilter("ok")}
            />
            <FilterPill
              label="Warn"
              count={counts.warn}
              tone="solar"
              active={filter === "warn"}
              onClick={() => setFilter("warn")}
            />
            <FilterPill
              label="Fail"
              count={counts.fail}
              tone="crimson"
              active={filter === "fail"}
              onClick={() => setFilter("fail")}
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-elevated/40 px-2.5 py-1.5 text-xs md:w-64">
            <Search size={12} className="text-text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="aktör, target veya trace ID…"
              className="w-full bg-transparent outline-none placeholder:text-text-faint"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-elevated/50 text-left font-mono text-[10px] uppercase tracking-wider text-text-faint">
                <th className="px-3 py-2 font-medium">Zaman</th>
                <th className="px-3 py-2 font-medium">Aktör</th>
                <th className="px-3 py-2 font-medium">Eylem</th>
                <th className="px-3 py-2 font-medium">Hedef</th>
                <th className="px-3 py-2 font-medium">Sonuç</th>
                <th className="px-3 py-2 text-right font-medium">Süre</th>
                <th className="px-3 py-2 text-right font-medium">Token</th>
                <th className="px-3 py-2 font-medium">Trace</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <Row key={e.id} e={e} />
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-xs text-text-muted"
                  >
                    Bu filtrelere uyan kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

function Row({ e }: { e: AuditEvent }) {
  const dotCls =
    e.result === "ok" ? "bg-quantum" : e.result === "warn" ? "bg-solar" : "bg-crimson";
  const txtCls =
    e.result === "ok"
      ? "text-quantum"
      : e.result === "warn"
      ? "text-solar"
      : "text-crimson";

  return (
    <tr className="border-b border-border/30 text-xs transition-colors hover:bg-elevated/30">
      <td className="px-3 py-2 font-mono text-text-muted">{timeShort(e.at)}</td>
      <td className="px-3 py-2">
        <span className="font-mono text-ion">{e.actor}</span>
      </td>
      <td className="px-3 py-2 font-mono text-text-muted">{e.action}</td>
      <td className="px-3 py-2 text-text">{e.target}</td>
      <td className="px-3 py-2">
        <span className={cn("inline-flex items-center gap-1.5 font-mono uppercase", txtCls)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", dotCls)} />
          {e.result}
        </span>
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-text-muted">
        {e.durationMs ? `${e.durationMs}ms` : "—"}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-text-muted">
        {e.tokens ? e.tokens.toLocaleString("tr-TR") : "—"}
      </td>
      <td className="px-3 py-2 font-mono text-[10px] text-text-faint">
        {e.traceId || "—"}
      </td>
    </tr>
  );
}

function FilterPill({
  label,
  count,
  tone = "neutral",
  active,
  onClick,
}: {
  label: string;
  count: number;
  tone?: "neutral" | "quantum" | "solar" | "crimson";
  active: boolean;
  onClick: () => void;
}) {
  const toneCls =
    tone === "quantum"
      ? "text-quantum border-quantum/40 bg-quantum-soft"
      : tone === "solar"
      ? "text-solar border-solar/40 bg-solar-soft"
      : tone === "crimson"
      ? "text-crimson border-crimson/40 bg-crimson-soft"
      : "text-text border-border-strong bg-elevated";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
        active
          ? toneCls + " shadow-inner"
          : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
      )}
    >
      <span>{label}</span>
      <span className="font-mono text-[10px] opacity-70">{count}</span>
    </button>
  );
}
