"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import {
  callsToday,
  costLog,
  formatDay,
  getBudgetsWithSpend,
  revenueAttribution,
  spentToday,
  summarizeSpend,
  usd,
  type SpendSummary,
} from "@/lib/costs";
import { connectors } from "@/lib/connectors";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Sparkline } from "../ui/Sparkline";
import {
  Activity,
  AlertTriangle,
  Bot,
  Coins,
  Plug,
  TrendingDown,
  TrendingUp,
  Wallet,
  Waypoints,
} from "lucide-react";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";
import { toast } from "@/lib/toast";
import { OracleGuide } from "../oracle/OracleGuide";

export function SpendPage() {
  const { currentWorkspaceId, workspaces, createdBudgets } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  // 30-day window
  const since = new Date(
    new Date("2026-04-23T00:00:00Z").getTime() - 30 * 86400000
  ).toISOString();

  const summary = useMemo<SpendSummary>(
    () =>
      ws
        ? summarizeSpend(ws.id, since)
        : {
            totalUsd: 0,
            byDay: [],
            byActor: [],
            byConnector: [],
            byKind: {
              "llm-tokens": 0,
              "api-call": 0,
              "platform-share": 0,
              "per-unit": 0,
              "rev-share": 0,
            },
          },
    [ws, since]
  );
  // Seed budgets + Oracle-onboarded budgets (yeni workspace'in spentUsd=0)
  const budgetsWithSpend = useMemo(() => {
    if (!ws) return [];
    const seed = getBudgetsWithSpend(ws.id);
    const oracle = createdBudgets
      .filter((c) => c.entity.workspaceId === ws.id)
      .map((c) => ({ ...c.entity, spentUsd: c.entity.spentUsd ?? 0 }));
    return [...seed, ...oracle];
  }, [ws, createdBudgets]);

  if (!ws) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-text-muted">
        Workspace yok — sol üstten ekle.
      </div>
    );
  }

  const revenue = revenueAttribution[ws.id]?.monthlyUsd ?? 0;
  const revenueSource = revenueAttribution[ws.id]?.source;
  const spend = summary.totalUsd;
  const roi = spend > 0 ? revenue / spend : revenue > 0 ? 999 : 0;

  const today = spentToday(ws.id);
  const callsCount = costLogCallsForWs(ws.id);

  const spendHistory = summary.byDay.slice(-14).map((d) => d.total);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="solar" opacity={0.08} />
        <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-[500px] rounded-full bg-solar/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-quantum/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <Wallet size={12} className="text-solar" />
            The Tribute · {ws.name}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            Matrix bu ay <span className={roi >= 10 ? "text-quantum" : roi >= 3 ? "text-ion" : "text-solar"}>
              {roi >= 999 ? "sonsuz" : roi.toFixed(1) + "x"}
            </span> geri getirdi.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-muted leading-relaxed">
            Son 30 günde Matrix'in harcadığı ve gerçek ciroda geri kazandığı her dolar.
            <span className="text-text"> {usd(revenue)} geri,</span>{" "}
            <span className="text-text"> {usd(spend)} harcandı.</span>{" "}
            <span className="text-text-faint">ROI = revenue / spend.</span>
          </p>
          {revenueSource && (
            <p className="mt-1.5 text-[11px] text-text-faint">
              Gelir kaynağı: {revenueSource}
            </p>
          )}

          <div className="relative mt-6 max-w-3xl">
            <MatrixQuote speaker={MODULE_QUOTES["/spend"].speaker} tone={MODULE_QUOTES["/spend"].tone}>
              {MODULE_QUOTES["/spend"].line}
            </MatrixQuote>
          </div>
        </div>
      </section>

      <section className="space-y-6 px-8 py-8">
        <OracleGuide page="spend" />

        {/* Top stat row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            label="30g gelir"
            value={usd(revenue)}
            tone="quantum"
          />
          <StatCard
            icon={TrendingDown}
            label="30g harcama"
            value={usd(spend)}
            tone="solar"
            sub={`${summary.byConnector.reduce((s, c) => s + c.calls, 0).toLocaleString("tr-TR")} çağrı`}
          />
          <StatCard
            icon={Coins}
            label="ROI"
            value={roi >= 999 ? "∞" : `${roi.toFixed(1)}x`}
            tone={roi >= 10 ? "quantum" : roi >= 3 ? "ion" : "solar"}
          />
          <StatCard
            icon={Activity}
            label="Bugünkü harcama"
            value={usd(today)}
            tone="ion"
            sub={`${callsCount} çağrı · tüm workspace'ler ${callsToday().toLocaleString("tr-TR")}`}
          />
        </div>

        {/* Sparkline */}
        <Card>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                14 günlük harcama trendi
              </div>
              <div className="mt-0.5 text-sm text-text">
                Günlük toplam $ — pik günleri görüntüle
              </div>
            </div>
            <Badge tone="solar">{spendHistory.length} gün</Badge>
          </div>
          <div className="p-5">
            <Sparkline
              data={spendHistory}
              tone="solar"
              width={900}
              height={80}
              className="w-full"
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-text-faint">
              <span>{formatDay(summary.byDay[0]?.date || since)}</span>
              <span>şimdi</span>
            </div>
          </div>
        </Card>

        {/* Budgets */}
        <Card>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-solar" />
              <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                Bütçe Limitleri
              </h3>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast({
                  tone: "solar",
                  title: "Bütçe editor",
                  description: "Workspace başına aylık bütçe tanımı — prod'da burada açılacak. Mevcut: takip ve uyarı sistemi.",
                })
              }
            >
              + Bütçe ekle
            </Button>
          </div>
          <div className="space-y-3 p-5">
            {budgetsWithSpend.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/60 bg-elevated/30 p-4 text-center text-sm text-text-muted">
                Bu workspace için bütçe tanımlanmamış.
              </div>
            ) : (
              budgetsWithSpend.map((b) => {
                const pct = Math.min(100, (b.spentUsd / b.capUsd) * 100);
                const overWarn = pct >= b.warnThresholdPct;
                const over = pct >= 100;
                const tone = over ? "crimson" : overWarn ? "solar" : "ion";
                return (
                  <div key={b.id} className="rounded-lg border border-border/60 bg-elevated/40 p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text truncate">
                            {b.scopeLabel}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
                            {b.period}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 font-mono text-xs">
                        <span
                          className={cn(
                            tone === "crimson" && "text-crimson",
                            tone === "solar" && "text-solar",
                            tone === "ion" && "text-ion"
                          )}
                        >
                          {usd(b.spentUsd, { decimals: 2 })}
                        </span>
                        <span className="text-text-muted">/</span>
                        <span className="text-text">{usd(b.capUsd, { decimals: 0 })}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          tone === "crimson" && "bg-crimson",
                          tone === "solar" && "bg-solar",
                          tone === "ion" && "bg-ion"
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    {over && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-crimson">
                        <AlertTriangle size={11} />
                        Limit aşıldı — bu scope'taki external-send aksiyonları onay kuyruğuna düşer.
                      </div>
                    )}
                    {!over && overWarn && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-solar">
                        <AlertTriangle size={11} />
                        %{b.warnThresholdPct} uyarı eşiği aşıldı
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* By connector + By actor */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Plug size={14} className="text-ion" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                  Connector Başına Harcama
                </h3>
              </div>
              <Badge tone="neutral">{summary.byConnector.length} connector</Badge>
            </div>
            <div className="p-5 space-y-2">
              {summary.byConnector.slice(0, 10).map((row) => {
                const c = connectors.find((x) => x.id === row.connectorId);
                const pct = (row.total / summary.totalUsd) * 100;
                const isPhysical = c?.category === "physical-world";
                return (
                  <div key={row.connectorId} className="group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[9px] font-semibold uppercase",
                            isPhysical
                              ? "border-solar/40 bg-solar-soft text-solar"
                              : "border-border/60 bg-elevated text-text-muted"
                          )}
                        >
                          {c?.shortCode || "??"}
                        </span>
                        <span className="truncate text-sm text-text">{c?.name || row.connectorId}</span>
                        <span className="font-mono text-[10px] text-text-faint">
                          {row.calls} çağrı
                        </span>
                      </span>
                      <span className="font-mono text-xs tabular-nums text-text">
                        {usd(row.total)}
                      </span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-elevated">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          isPhysical ? "bg-solar" : "bg-ion"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-nebula" />
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                  Skill / Workflow Başına
                </h3>
              </div>
              <Badge tone="neutral">{summary.byActor.length} aktör</Badge>
            </div>
            <div className="p-5 space-y-2">
              {summary.byActor.slice(0, 10).map((row) => {
                const pct = (row.total / summary.totalUsd) * 100;
                const isWorkflow = row.actorType === "workflow";
                return (
                  <div key={`${row.actorType}-${row.actorName}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        {isWorkflow ? (
                          <Waypoints size={11} className="shrink-0 text-quantum" />
                        ) : (
                          <Bot size={11} className="shrink-0 text-nebula" />
                        )}
                        <span className="truncate font-mono text-sm text-text">
                          {row.actorName}
                        </span>
                        <span className="font-mono text-[10px] text-text-faint">
                          {row.runs} run
                        </span>
                      </span>
                      <span className="font-mono text-xs tabular-nums text-text">
                        {usd(row.total)}
                      </span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-elevated">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          isWorkflow ? "bg-quantum" : "bg-nebula"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Kind breakdown */}
        <Card>
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Coins size={14} className="text-solar" />
              <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
                Harcama Türü Dağılımı
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-5">
            {(Object.entries(summary.byKind) as [keyof typeof summary.byKind, number][]).map(
              ([k, v]) => {
                const pct = summary.totalUsd > 0 ? (v / summary.totalUsd) * 100 : 0;
                const label = kindLabel(k);
                return (
                  <div
                    key={k}
                    className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                  >
                    <div className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
                      {label}
                    </div>
                    <div className="mt-1 text-lg font-semibold tabular-nums text-text">
                      {usd(v)}
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-elevated">
                      <div className="h-full rounded-full bg-solar" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-text-faint">
                      %{Math.round(pct)}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  sub,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  sub?: string;
}) {
  const cls =
    tone === "ion"
      ? "border-ion/30 bg-ion-soft text-ion"
      : tone === "nebula"
      ? "border-nebula/30 bg-nebula-soft text-nebula"
      : tone === "quantum"
      ? "border-quantum/30 bg-quantum-soft text-quantum"
      : tone === "solar"
      ? "border-solar/30 bg-solar-soft text-solar"
      : "border-crimson/30 bg-crimson-soft text-crimson";
  return (
    <Card className={cn("relative overflow-hidden border", cls)}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-80">{label}</span>
          <Icon size={14} className="opacity-70" />
        </div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-text">{value}</div>
        {sub && <div className="mt-0.5 text-[11px] opacity-80">{sub}</div>}
      </div>
    </Card>
  );
}

function kindLabel(k: string): string {
  switch (k) {
    case "llm-tokens":
      return "LLM Tokens";
    case "api-call":
      return "API Call";
    case "platform-share":
      return "Platform";
    case "per-unit":
      return "Per-Unit";
    case "rev-share":
      return "Rev-Share";
    default:
      return k;
  }
}

// Local helper — today's call count for this workspace
function costLogCallsForWs(workspaceId: string): number {
  const today = new Date("2026-04-23").toISOString().slice(0, 10);
  return costLog.filter((e) => e.at.startsWith(today) && e.workspaceId === workspaceId).length;
}
