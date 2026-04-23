/**
 * Matrix Spend & Budget — real cost tracking.
 *
 * Every skill / workflow run generates a CostEntry tied to a connector.
 * The Spend page aggregates these into per-connector, per-skill, per-workflow
 * and per-workspace views. A simple Budget cap system lets users put guard
 * rails on runaway spending.
 *
 * In live mode: `lib/forge.ts` + the workflow runner would emit entries.
 * Here we seed 30 days of synthetic but realistic data.
 */

import { connectors, priceLabel, type Connector } from "./connectors";

export type CostKind =
  | "llm-tokens"
  | "api-call"
  | "platform-share"
  | "per-unit"
  | "rev-share";

export interface CostEntry {
  id: string;
  workspaceId: string;
  at: string; // ISO
  actorType: "skill" | "workflow" | "agent";
  actorName: string; // e.g. "lead-enrichment"
  connectorId: string; // which connector incurred the cost
  kind: CostKind;
  unitCount: number; // tokens, calls, units, etc.
  unitCostUsd: number;
  totalUsd: number;
  traceId: string;
}

export type BudgetScope = "workspace" | "workflow" | "skill" | "connector";
export type BudgetPeriod = "day" | "week" | "month";

export interface Budget {
  id: string;
  workspaceId: string;
  scope: BudgetScope;
  scopeId: string; // workspaceId itself, or workflow name, etc.
  scopeLabel: string; // human readable
  period: BudgetPeriod;
  capUsd: number;
  spentUsd: number;
  warnThresholdPct: number; // 0-100, when to raise a warning
}

// ---------------------------------------------------------------------------
// Synthetic 30-day cost log
// ---------------------------------------------------------------------------

// Which actors consume which connectors (drives seed distribution)
export const actorConnectorMap: Array<{
  workspaceId: string;
  actorType: "skill" | "workflow";
  actorName: string;
  connectorIds: string[];
  runsPerDay: number; // average
  avgCostPerRunUsd: number; // average
}> = [
  // Ferhan · Core
  {
    workspaceId: "ws-ferhan-core",
    actorType: "skill",
    actorName: "lead-enrichment",
    connectorIds: ["c-claude", "c-hubspot"],
    runsPerDay: 3.2,
    avgCostPerRunUsd: 0.18,
  },
  {
    workspaceId: "ws-ferhan-core",
    actorType: "skill",
    actorName: "meeting-notes-synthesizer",
    connectorIds: ["c-claude", "c-notion", "c-slack"],
    runsPerDay: 1.0,
    avgCostPerRunUsd: 0.28,
  },
  {
    workspaceId: "ws-ferhan-core",
    actorType: "skill",
    actorName: "weekly-biz-review",
    connectorIds: ["c-claude", "c-notion"],
    runsPerDay: 0.18,
    avgCostPerRunUsd: 0.92,
  },
  {
    workspaceId: "ws-ferhan-core",
    actorType: "workflow",
    actorName: "inbound-lead-triage",
    connectorIds: ["c-claude", "c-hubspot", "c-slack"],
    runsPerDay: 4.5,
    avgCostPerRunUsd: 0.34,
  },
  {
    workspaceId: "ws-ferhan-core",
    actorType: "workflow",
    actorName: "sprint-status-roundup",
    connectorIds: ["c-linear", "c-claude", "c-notion", "c-slack"],
    runsPerDay: 0.14,
    avgCostPerRunUsd: 0.52,
  },
  {
    workspaceId: "ws-ferhan-core",
    actorType: "workflow",
    actorName: "weekly-exec-dashboard",
    connectorIds: ["c-claude", "c-notion", "c-slack"],
    runsPerDay: 0.14,
    avgCostPerRunUsd: 0.86,
  },

  // Trading Desk
  {
    workspaceId: "ws-trading-desk",
    actorType: "skill",
    actorName: "market-pulse-report",
    connectorIds: ["c-claude", "c-slack"],
    runsPerDay: 1.0,
    avgCostPerRunUsd: 0.42,
  },
  {
    workspaceId: "ws-trading-desk",
    actorType: "workflow",
    actorName: "daily-market-briefing",
    connectorIds: ["c-claude", "c-slack"],
    runsPerDay: 1.0,
    avgCostPerRunUsd: 0.48,
  },

  // Content Studio
  {
    workspaceId: "ws-content-studio",
    actorType: "skill",
    actorName: "research-synthesis",
    connectorIds: ["c-claude", "c-notion"],
    runsPerDay: 0.8,
    avgCostPerRunUsd: 0.55,
  },
];

// Build a deterministic 30-day log so numbers don't dance on every render.
function seed30DayCostLog(): CostEntry[] {
  const out: CostEntry[] = [];
  const now = new Date("2026-04-23T09:00:00Z");

  actorConnectorMap.forEach((a) => {
    for (let day = 29; day >= 0; day--) {
      const date = new Date(now.getTime() - day * 86400000);
      // Add a bit of deterministic variation
      const dayVar = 1 + Math.sin(day * 0.5 + a.actorName.length) * 0.25;
      const runs = Math.max(0, Math.round(a.runsPerDay * dayVar));
      for (let r = 0; r < runs; r++) {
        // Distribute across connectors used
        a.connectorIds.forEach((cid) => {
          const connector = connectors.find((c) => c.id === cid);
          if (!connector) return;
          const perConnectorShare = 1 / a.connectorIds.length;
          const variation = 0.75 + ((day + r + cid.length) % 50) / 100; // 0.75 - 1.25
          const totalUsd =
            a.avgCostPerRunUsd * perConnectorShare * variation;
          const unitCount = Math.round(
            connector.pricing.unit === "per-call"
              ? 1
              : connector.pricing.unit === "per-unit"
              ? 1
              : 1000 * perConnectorShare * variation
          );
          const unitCost = totalUsd / Math.max(unitCount, 1);
          const hour = 8 + ((r * 3 + day) % 10);
          const at = new Date(date);
          at.setUTCHours(hour, (r * 7) % 60, 0, 0);
          out.push({
            id: `cost-${a.actorName}-${day}-${r}-${cid}`,
            workspaceId: a.workspaceId,
            at: at.toISOString(),
            actorType: a.actorType,
            actorName: a.actorName,
            connectorId: cid,
            kind: inferKind(connector),
            unitCount,
            unitCostUsd: unitCost,
            totalUsd,
            traceId: `tr-${a.actorName.slice(0, 3)}-${day}${r}`,
          });
        });
      }
    }
  });

  return out;
}

function inferKind(connector: Connector): CostKind {
  if (connector.category === "ai" || connector.category === "engines") return "llm-tokens";
  if (connector.pricing.unit === "per-call") return "api-call";
  if (connector.pricing.unit === "per-month") return "platform-share";
  if (connector.pricing.unit === "per-unit") return "per-unit";
  if (connector.pricing.unit === "rev-share") return "rev-share";
  return "api-call";
}

export const costLog: CostEntry[] = seed30DayCostLog();

// ---------------------------------------------------------------------------
// Workspace-level revenue proxy (used for ROI).
// In real life this would come from Stripe / QuickBooks / internal attribution.
// ---------------------------------------------------------------------------

export const revenueAttribution: Record<string, { monthlyUsd: number; source: string }> = {
  "ws-ferhan-core": {
    monthlyUsd: 18400,
    source: "Consulting + SaaS pilot gelir (saat kazancı → iş kapasitesi artışı)",
  },
  "ws-trading-desk": {
    monthlyUsd: 6200,
    source: "Paper PnL + strateji danışmanlık",
  },
  "ws-content-studio": {
    monthlyUsd: 4100,
    source: "Newsletter sponsorluk + editöryal proje geliri",
  },
};

// ---------------------------------------------------------------------------
// Mock budgets (per workspace)
// ---------------------------------------------------------------------------

export const budgets: Budget[] = [
  {
    id: "bg-fc-month",
    workspaceId: "ws-ferhan-core",
    scope: "workspace",
    scopeId: "ws-ferhan-core",
    scopeLabel: "Ferhan · Core (tüm workspace)",
    period: "month",
    capUsd: 500,
    spentUsd: 0, // filled dynamically
    warnThresholdPct: 80,
  },
  {
    id: "bg-fc-inbound",
    workspaceId: "ws-ferhan-core",
    scope: "workflow",
    scopeId: "inbound-lead-triage",
    scopeLabel: "Workflow: inbound-lead-triage",
    period: "month",
    capUsd: 150,
    spentUsd: 0,
    warnThresholdPct: 75,
  },
  {
    id: "bg-fc-claude",
    workspaceId: "ws-ferhan-core",
    scope: "connector",
    scopeId: "c-claude",
    scopeLabel: "Connector: Claude API",
    period: "month",
    capUsd: 200,
    spentUsd: 0,
    warnThresholdPct: 80,
  },
  {
    id: "bg-td-month",
    workspaceId: "ws-trading-desk",
    scope: "workspace",
    scopeId: "ws-trading-desk",
    scopeLabel: "Trading Desk (tüm workspace)",
    period: "month",
    capUsd: 200,
    spentUsd: 0,
    warnThresholdPct: 80,
  },
];

// ---------------------------------------------------------------------------
// Aggregators
// ---------------------------------------------------------------------------

export interface SpendSummary {
  totalUsd: number;
  byConnector: Array<{ connectorId: string; total: number; calls: number }>;
  byActor: Array<{
    actorType: "skill" | "workflow";
    actorName: string;
    total: number;
    runs: number;
  }>;
  byDay: Array<{ date: string; total: number }>;
  byKind: Record<CostKind, number>;
}

export function summarizeSpend(
  workspaceId: string,
  sinceIso?: string
): SpendSummary {
  const cutoff = sinceIso ? new Date(sinceIso).getTime() : 0;
  const entries = costLog.filter(
    (e) => e.workspaceId === workspaceId && new Date(e.at).getTime() >= cutoff
  );

  const byConnectorMap = new Map<string, { total: number; calls: number }>();
  const byActorMap = new Map<
    string,
    { actorType: "skill" | "workflow"; actorName: string; total: number; runs: number }
  >();
  const byDayMap = new Map<string, number>();
  const byKind: Record<CostKind, number> = {
    "llm-tokens": 0,
    "api-call": 0,
    "platform-share": 0,
    "per-unit": 0,
    "rev-share": 0,
  };

  let total = 0;
  entries.forEach((e) => {
    total += e.totalUsd;
    // connector
    const c = byConnectorMap.get(e.connectorId) || { total: 0, calls: 0 };
    c.total += e.totalUsd;
    c.calls += 1;
    byConnectorMap.set(e.connectorId, c);
    // actor
    const aKey = `${e.actorType}:${e.actorName}`;
    const a = byActorMap.get(aKey) || {
      actorType: e.actorType as "skill" | "workflow",
      actorName: e.actorName,
      total: 0,
      runs: 0,
    };
    a.total += e.totalUsd;
    a.runs += 1;
    byActorMap.set(aKey, a);
    // day
    const dayKey = e.at.slice(0, 10);
    byDayMap.set(dayKey, (byDayMap.get(dayKey) || 0) + e.totalUsd);
    // kind
    byKind[e.kind] += e.totalUsd;
  });

  return {
    totalUsd: total,
    byConnector: Array.from(byConnectorMap.entries())
      .map(([connectorId, v]) => ({ connectorId, ...v }))
      .sort((a, b) => b.total - a.total),
    byActor: Array.from(byActorMap.values()).sort((a, b) => b.total - a.total),
    byDay: Array.from(byDayMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    byKind,
  };
}

export function getBudgetsWithSpend(workspaceId: string): Budget[] {
  const now = new Date("2026-04-23T09:00:00Z");
  return budgets
    .filter((b) => b.workspaceId === workspaceId)
    .map((b) => {
      // Period start
      const periodMs =
        b.period === "day" ? 86400000 : b.period === "week" ? 7 * 86400000 : 30 * 86400000;
      const since = new Date(now.getTime() - periodMs).toISOString();
      const entries = costLog.filter(
        (e) => e.workspaceId === workspaceId && new Date(e.at).getTime() >= new Date(since).getTime()
      );
      let spent = 0;
      entries.forEach((e) => {
        if (b.scope === "workspace") spent += e.totalUsd;
        else if (b.scope === "workflow" && e.actorType === "workflow" && e.actorName === b.scopeId)
          spent += e.totalUsd;
        else if (b.scope === "skill" && e.actorType === "skill" && e.actorName === b.scopeId)
          spent += e.totalUsd;
        else if (b.scope === "connector" && e.connectorId === b.scopeId) spent += e.totalUsd;
      });
      return { ...b, spentUsd: Number(spent.toFixed(2)) };
    });
}

/** Today's call count across all connectors (used by Connector Hub hero). */
export function callsToday(): number {
  const today = new Date("2026-04-23").toISOString().slice(0, 10);
  return costLog.filter((e) => e.at.startsWith(today)).length;
}

export function spentToday(workspaceId?: string): number {
  const today = new Date("2026-04-23").toISOString().slice(0, 10);
  return costLog
    .filter((e) => e.at.startsWith(today) && (!workspaceId || e.workspaceId === workspaceId))
    .reduce((s, e) => s + e.totalUsd, 0);
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

export function usd(value: number, opts?: { decimals?: number }): string {
  const d = opts?.decimals ?? (value < 1 ? 3 : value < 100 ? 2 : 0);
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })}`;
}

export function formatDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export { priceLabel };
