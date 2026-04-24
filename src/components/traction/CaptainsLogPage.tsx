"use client";

/**
 * Captain's Log — Matrix adaptation of Gino Wickman's EOS (Traction).
 *
 * Morpheus is the captain of the Nebuchadnezzar. This module is the
 * operating cadence that keeps the crew aligned: 90-day Rocks, weekly
 * Scorecard, Issues List, Accountability Chart, Level-10 Meeting agenda.
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import {
  accountabilityForWorkspace,
  issuesForWorkspace,
  l10Agenda,
  rocksForWorkspace,
  scorecardForWorkspace,
  scorecardHealth,
  type Issue,
  type Rock,
  type ScorecardRow,
  type AccountabilityRole,
} from "@/lib/traction";
import { goals as allGoals } from "@/lib/mock-data";
import { GoalCard } from "../goals/GoalCard";
import { ThemeCoverageStrip } from "../goals/ThemeCoverageStrip";
import { Card } from "../ui/Card";
import { Sparkline } from "../ui/Sparkline";
import { Button } from "../ui/Button";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote } from "../brand/MatrixQuote";
import { toast } from "@/lib/toast";
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock,
  Compass,
  Crown,
  Mountain,
  Network,
  ScrollText,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

type Tab = "rocks" | "scorecard" | "issues" | "accountability" | "l10" | "goals";

const tabMeta: Record<
  Tab,
  { label: string; subLabel: string; icon: typeof Mountain; tone: "ion" | "nebula" | "quantum" | "solar" | "crimson" }
> = {
  rocks: {
    label: "90-Day Rocks",
    subLabel: "Bu çeyreğin kayaları",
    icon: Mountain,
    tone: "solar",
  },
  scorecard: {
    label: "Weekly Scorecard",
    subLabel: "13-hafta rolling sağlık",
    icon: TrendingUp,
    tone: "quantum",
  },
  issues: {
    label: "Issues List",
    subLabel: "IDS · Identify / Discuss / Solve",
    icon: AlertCircle,
    tone: "crimson",
  },
  accountability: {
    label: "Accountability Chart",
    subLabel: "Rol → sorumluluk",
    icon: Network,
    tone: "ion",
  },
  l10: {
    label: "Level 10 Meeting",
    subLabel: "Haftalık 90-dk ritüel",
    icon: ClipboardCheck,
    tone: "nebula",
  },
  goals: {
    label: "Goals · The Prophecy",
    subLabel: "OKR'ler + yörünge",
    icon: Target,
    tone: "quantum",
  },
};

export function CaptainsLogPage() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  const [tab, setTab] = useState<Tab>("rocks");

  const { createdGoals } = useWorkspaceStore();
  const wsRocks = useMemo(() => rocksForWorkspace(ws.id), [ws.id]);
  const wsScorecard = useMemo(() => scorecardForWorkspace(ws.id), [ws.id]);
  const wsIssues = useMemo(() => issuesForWorkspace(ws.id), [ws.id]);
  const wsRoles = useMemo(() => accountabilityForWorkspace(ws.id), [ws.id]);
  const wsGoals = useMemo(
    () => [
      ...allGoals.filter((g) => g.workspaceId === ws.id),
      ...createdGoals
        .filter((c) => c.entity.workspaceId === ws.id)
        .map((c) => c.entity),
    ],
    [ws.id, createdGoals]
  );

  const rockOnTrack = wsRocks.filter((r) => r.status === "on-track").length;
  const rockOffTrack = wsRocks.filter((r) => r.status === "off-track").length;
  const openIssues = wsIssues.filter((i) => i.ids !== "closed").length;
  const highPrioIssues = wsIssues.filter((i) => i.ids !== "closed" && i.priority === "high").length;
  const onTrackMetrics = wsScorecard.filter((r) => scorecardHealth(r) === "on-track").length;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="nebula" opacity={0.08} />
        <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-[500px] rounded-full bg-nebula/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-solar/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <ScrollText size={12} className="text-nebula" />
            Captain's Log · Traction / EOS for Matrix
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            Şirket nabzını gemi kaptanı gibi tut.
          </h1>
          <p className="mt-3 max-w-3xl text-base text-text-muted leading-relaxed">
            Gino Wickman'ın <b className="text-text">Entrepreneurial Operating System</b>'ini (EOS /
            Traction kitabı) Matrix'e uyarladım. <b className="text-text">90-Day Rocks</b>{" "}
            çeyreğin kayaları. <b className="text-text">Scorecard</b> haftalık sağlık
            metriği. <b className="text-text">Issues List</b>{" "}
            IDS framework'üyle çözülür. <b className="text-text">Accountability Chart</b>{" "}
            "kim neyden sorumlu" netliği, <b className="text-text">L10 Meeting</b>{" "}
            haftalık 90-dk'lık komuta ritüeli.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatPill
              count={`${rockOnTrack}/${wsRocks.length}`}
              label="Rock on-track"
              tone={rockOffTrack > 0 ? "solar" : "quantum"}
            />
            <StatPill
              count={openIssues}
              label={`Açık issue${highPrioIssues > 0 ? ` (${highPrioIssues} yüksek)` : ""}`}
              tone={highPrioIssues > 0 ? "crimson" : "nebula"}
            />
            <StatPill
              count={`${onTrackMetrics}/${wsScorecard.length}`}
              label="Scorecard on-track"
              tone="quantum"
            />
            <StatPill count={wsRoles.length} label="Accountability rolü" tone="ion" />
          </div>

          <div className="relative mt-6 max-w-3xl">
            <MatrixQuote speaker="Morpheus" tone="nebula">
              I can only show you the door. You're the one that has to walk through it.
            </MatrixQuote>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-14 z-10 border-b border-border/60 bg-void/70 px-8 py-3 backdrop-blur-md">
        <div className="flex flex-wrap gap-1">
          {(Object.keys(tabMeta) as Tab[]).map((t) => {
            const meta = tabMeta[t];
            const Icon = meta.icon;
            const active = t === tab;
            const toneCls =
              meta.tone === "ion"
                ? "text-ion bg-ion-soft border-ion/40"
                : meta.tone === "nebula"
                ? "text-nebula bg-nebula-soft border-nebula/40"
                : meta.tone === "quantum"
                ? "text-quantum bg-quantum-soft border-quantum/40"
                : meta.tone === "solar"
                ? "text-solar bg-solar-soft border-solar/40"
                : "text-crimson bg-crimson-soft border-crimson/40";
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-all",
                  active
                    ? toneCls + " shadow-inner"
                    : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
                )}
              >
                <Icon size={14} />
                <span className="font-medium">{meta.label}</span>
                <span className="hidden font-mono text-[10px] text-text-faint lg:inline">
                  · {meta.subLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <section className="px-8 py-8">
        {tab === "rocks" && <RocksTab rocks={wsRocks} />}
        {tab === "scorecard" && <ScorecardTab rows={wsScorecard} />}
        {tab === "issues" && <IssuesTab issues={wsIssues} />}
        {tab === "accountability" && <AccountabilityTab roles={wsRoles} />}
        {tab === "l10" && <L10Tab />}
        {tab === "goals" && <GoalsTab goals={wsGoals} workspace={ws} />}
      </section>
    </div>
  );
}

function StatPill({
  count,
  label,
  tone,
}: {
  count: number | string;
  label: string;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
}) {
  const toneCls =
    tone === "ion"
      ? "text-ion bg-ion-soft border-ion/30"
      : tone === "nebula"
      ? "text-nebula bg-nebula-soft border-nebula/30"
      : tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/30"
      : tone === "solar"
      ? "text-solar bg-solar-soft border-solar/30"
      : "text-crimson bg-crimson-soft border-crimson/30";
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", toneCls)}>
      <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tab 1 — 90-Day Rocks
// ═══════════════════════════════════════════════════════════════════════════

function RocksTab({ rocks }: { rocks: Rock[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">2026 Q2 · Rocks</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Her çeyrek 3–7 büyük taşı belirlersin. Öncelik değil, <b className="text-text">bitirme taahhüdü</b>.
            Rock düşerse Oracle bir risk suggestion üretir.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast({
              tone: "solar",
              title: "Yeni Rock kuyruğu açık",
              description: "90-günlük rock editor bu sprint Oracle Forge üstünden açılacak. Şimdilik Issue olarak ekleyebilirsin.",
            })
          }
        >
          <Mountain size={12} />
          Yeni Rock
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {rocks.map((r) => (
          <RockCard key={r.id} rock={r} />
        ))}
      </div>
    </div>
  );
}

function RockCard({ rock: r }: { rock: Rock }) {
  const doneMilestones = r.milestones.filter((m) => m.done).length;
  const statusTone =
    r.status === "on-track"
      ? "quantum"
      : r.status === "off-track"
      ? "solar"
      : r.status === "done"
      ? "ion"
      : "crimson";
  const statusCls =
    statusTone === "quantum"
      ? "border-quantum/30 bg-quantum-soft/30 text-quantum"
      : statusTone === "solar"
      ? "border-solar/30 bg-solar-soft/30 text-solar"
      : statusTone === "ion"
      ? "border-ion/30 bg-ion-soft/30 text-ion"
      : "border-crimson/30 bg-crimson-soft/30 text-crimson";

  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          statusTone === "quantum" && "via-quantum/60",
          statusTone === "solar" && "via-solar/60",
          statusTone === "ion" && "via-ion/60",
          statusTone === "crimson" && "via-crimson/60"
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
            <Mountain size={10} className="text-solar" />
            {r.quarter}
          </div>
          <h3 className="mt-1 text-base font-semibold text-text leading-snug">{r.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-text-muted line-clamp-2">
            {r.description}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            statusCls
          )}
        >
          {r.status}
        </span>
      </div>

      {/* Owner */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px]",
            r.ownerKind === "agent"
              ? "border-ion/30 bg-ion-soft/50 text-ion"
              : "border-nebula/30 bg-nebula-soft/50 text-nebula"
          )}
        >
          {r.ownerKind === "agent" ? <Bot size={9} /> : <User size={9} />}
          {r.ownerName}
        </span>
        <span className="font-mono text-[10px] text-text-faint">
          · {r.ownerRole}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between font-mono text-[10px] text-text-faint">
          <span>İlerleme</span>
          <span className="text-text">%{r.progressPct}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
          <div
            className={cn(
              "h-full transition-all",
              statusTone === "quantum" && "bg-quantum",
              statusTone === "solar" && "bg-solar",
              statusTone === "ion" && "bg-ion",
              statusTone === "crimson" && "bg-crimson"
            )}
            style={{ width: `${r.progressPct}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-text-faint">
          <span>Milestones</span>
          <span>
            {doneMilestones}/{r.milestones.length}
          </span>
        </div>
        <ul className="space-y-1">
          {r.milestones.map((m, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px]">
              {m.done ? (
                <CheckCircle2 size={11} className="shrink-0 text-quantum" />
              ) : (
                <Circle size={11} className="shrink-0 text-text-faint" />
              )}
              <span
                className={cn(
                  "flex-1 truncate",
                  m.done ? "text-text-muted line-through decoration-text-faint/60" : "text-text"
                )}
              >
                {m.label}
              </span>
              <span className="font-mono text-[9px] text-text-faint">
                {new Date(m.dueIso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {r.linkedGoalId && (
        <div className="mt-3 border-t border-border/50 pt-2 font-mono text-[10px] text-text-faint">
          ↔ The Prophecy goal: <span className="text-quantum">{r.linkedGoalId}</span>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tab 2 — Weekly Scorecard
// ═══════════════════════════════════════════════════════════════════════════

function ScorecardTab({ rows }: { rows: ScorecardRow[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-text">Weekly Scorecard · 13 hafta rolling</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Her metrik bir sahibi, bir hedefi, 13 haftalık trendi taşır.{" "}
          <b className="text-text">Target'ı iki hafta üst üste kaçıran</b> metrik otomatik Issue olur.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-elevated/40">
                <th className="py-3 pl-5 pr-3 text-left font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  Metrik
                </th>
                <th className="py-3 px-3 text-left font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  Sahibi
                </th>
                <th className="py-3 px-3 text-right font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  Hedef
                </th>
                <th className="py-3 px-3 text-right font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  Bu hafta
                </th>
                <th className="py-3 px-3 text-center font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  13-hafta trend
                </th>
                <th className="py-3 px-5 pl-3 text-right font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  Sağlık
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const latest = row.weekly[row.weekly.length - 1];
                const health = scorecardHealth(row);
                const healthTone =
                  health === "on-track"
                    ? "quantum"
                    : health === "at-risk"
                    ? "solar"
                    : "crimson";
                const healthCls =
                  healthTone === "quantum"
                    ? "text-quantum border-quantum/40 bg-quantum-soft"
                    : healthTone === "solar"
                    ? "text-solar border-solar/40 bg-solar-soft"
                    : "text-crimson border-crimson/40 bg-crimson-soft";
                return (
                  <tr key={row.id} className="border-b border-border/40 last:border-b-0 hover:bg-elevated/30">
                    <td className="py-3 pl-5 pr-3">
                      <div className="text-sm font-medium text-text">{row.metric}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-text-muted">{row.ownerName}</td>
                    <td className="py-3 px-3 text-right font-mono text-[12px] text-text-muted tabular-nums">
                      {formatMetric(row.target, row.unit)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[13px] font-semibold text-text tabular-nums">
                      {formatMetric(latest, row.unit)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="mx-auto h-8 w-32">
                        <Sparkline
                          data={row.weekly}
                          tone={
                            row.trend === "up"
                              ? "quantum"
                              : row.trend === "down"
                              ? row.metric.includes("hata") || row.metric.includes("harcama")
                                ? "quantum"
                                : "crimson"
                              : "ion"
                          }
                        />
                      </div>
                    </td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                          healthCls
                        )}
                      >
                        {health === "on-track" ? (
                          <TrendingUp size={9} />
                        ) : health === "at-risk" ? (
                          <Clock size={9} />
                        ) : (
                          <TrendingDown size={9} />
                        )}
                        {health}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function formatMetric(n: number, unit: string): string {
  if (unit === "USD") {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return `$${n}`;
  }
  if (unit === "%") return `%${n}`;
  if (unit === "sa") return `${n} sa`;
  return `${n}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Tab 3 — Issues List (IDS)
// ═══════════════════════════════════════════════════════════════════════════

function IssuesTab({ issues }: { issues: Issue[] }) {
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");
  const visible = issues.filter((i) =>
    filter === "all" ? true : filter === "closed" ? i.ids === "closed" : i.ids !== "closed"
  );

  const byIDS: Record<Issue["ids"], Issue[]> = {
    identify: visible.filter((i) => i.ids === "identify"),
    discuss: visible.filter((i) => i.ids === "discuss"),
    solve: visible.filter((i) => i.ids === "solve"),
    closed: visible.filter((i) => i.ids === "closed"),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Issues List · IDS</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            <b className="text-text">I</b>dentify → <b className="text-text">D</b>iscuss →{" "}
            <b className="text-text">S</b>olve. Her L10 meeting'in 60 dakikası burada geçer.
          </p>
        </div>
        <div className="flex gap-1">
          {(["open", "closed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
                filter === f
                  ? "border-nebula/40 bg-nebula-soft text-nebula"
                  : "border-border/60 bg-transparent text-text-muted hover:text-text"
              )}
            >
              {f === "open" ? "açık" : f === "closed" ? "kapalı" : "tümü"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <IDSColumn title="Identify" icon={Circle} tone="ion" issues={byIDS.identify} />
        <IDSColumn title="Discuss" icon={Users} tone="solar" issues={byIDS.discuss} />
        <IDSColumn title="Solve" icon={Sparkles} tone="quantum" issues={byIDS.solve} />
        <IDSColumn title="Closed" icon={CheckCircle2} tone="nebula" issues={byIDS.closed} />
      </div>
    </div>
  );
}

function IDSColumn({
  title,
  icon: Icon,
  tone,
  issues,
}: {
  title: string;
  icon: typeof Circle;
  tone: "ion" | "nebula" | "quantum" | "solar";
  issues: Issue[];
}) {
  const toneCls =
    tone === "ion"
      ? "text-ion border-ion/40"
      : tone === "nebula"
      ? "text-nebula border-nebula/40"
      : tone === "quantum"
      ? "text-quantum border-quantum/40"
      : "text-solar border-solar/40";
  return (
    <div className="space-y-3">
      <div className={cn("flex items-center justify-between border-b pb-2", toneCls)}>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
          <Icon size={11} />
          {title}
        </div>
        <span className="font-mono text-[10px] text-text-faint">{issues.length}</span>
      </div>
      <div className="space-y-2">
        {issues.map((i) => (
          <IssueCard key={i.id} issue={i} />
        ))}
        {issues.length === 0 && (
          <div className="rounded-md border border-dashed border-border/50 bg-elevated/20 p-3 text-center font-mono text-[10px] text-text-faint">
            boş
          </div>
        )}
      </div>
    </div>
  );
}

function IssueCard({ issue: i }: { issue: Issue }) {
  const prioTone =
    i.priority === "high" ? "crimson" : i.priority === "medium" ? "solar" : "neutral";
  const prioCls =
    prioTone === "crimson"
      ? "text-crimson border-crimson/30 bg-crimson-soft"
      : prioTone === "solar"
      ? "text-solar border-solar/30 bg-solar-soft"
      : "text-text-muted border-border/50 bg-elevated";
  const catLabel: Record<Issue["category"], string> = {
    people: "people",
    process: "process",
    tech: "tech",
    customer: "customer",
    strategy: "strategy",
  };
  return (
    <div className="rounded-md border border-border/60 bg-surface/70 p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[10px] uppercase tracking-wider text-text-faint">
          {catLabel[i.category]}
        </span>
        <span
          className={cn(
            "rounded border px-1 py-px font-mono text-[9px] uppercase tracking-wider",
            prioCls
          )}
        >
          {i.priority}
        </span>
      </div>
      <div className="mt-1 text-[12px] font-medium leading-snug text-text line-clamp-3">
        {i.title}
      </div>
      {i.note && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-text-muted line-clamp-2">
          {i.note}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-text-faint">
        <span>{i.raisedBy}</span>
        {i.assigneeName && (
          <span className="text-ion">→ {i.assigneeName}</span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tab 4 — Accountability Chart
// ═══════════════════════════════════════════════════════════════════════════

function AccountabilityTab({ roles }: { roles: AccountabilityRole[] }) {
  const executives = roles.filter((r) => r.sits === "executive");
  const departments = roles.filter((r) => r.sits === "department");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Accountability Chart</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Org Studio'daki şema "kim kimin üstü" der. Bu chart{" "}
          <b className="text-text">"kim neyden SORUMLU"</b> der. EOS'un en sevdiğim
          parçası — rol · ajan · 3-5 kritik sorumluluk.
        </p>
      </div>

      {/* Executive tier */}
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
          <Crown size={11} className="text-solar" />
          Executive · 2 rol
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {executives.map((r) => (
            <AccountabilityCard key={r.id} role={r} />
          ))}
        </div>
      </div>

      {/* Department tier */}
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
          <Network size={11} className="text-ion" />
          Department · {departments.length} rol
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {departments.map((r) => (
            <AccountabilityCard key={r.id} role={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountabilityCard({ role: r }: { role: AccountabilityRole }) {
  const tierBorder = r.sits === "executive" ? "border-solar/30" : "border-ion/30";
  return (
    <Card className={cn("p-4", tierBorder)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border",
              r.sits === "executive"
                ? "border-solar/40 bg-solar-soft text-solar"
                : "border-ion/40 bg-ion-soft text-ion"
            )}
          >
            {r.ownerKind === "agent" ? <Bot size={14} /> : <User size={14} />}
          </div>
          <div>
            <div className="text-sm font-semibold text-text">{r.role}</div>
            <div className="font-mono text-[10px] text-text-faint">{r.ownerName}</div>
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-[11px]">
        {r.topAccountabilities.map((a, i) => (
          <li key={i} className="flex items-start gap-2 text-text-muted">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-text-faint" />
            <span className="leading-relaxed">{a}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tab 5 — Level 10 Meeting
// ═══════════════════════════════════════════════════════════════════════════

function L10Tab() {
  const total = l10Agenda.reduce((s, a) => s + a.minutes, 0);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Level 10 Meeting · Haftalık 90 dk</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Aynı gün, aynı saat, <b className="text-text">aynı agenda</b>. Matrix bunu bir workflow
            olarak Nebuchadnezzar'da bir sonraki Pazartesi 09:30'a schedule edebilir.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast({
              tone: "nebula",
              title: "L10 workflow kuruldu",
              description: "Her Pazartesi 09:30 · 90 dk · Loading Program'da aktif. Cron next run: Pzt 09:30.",
              action: { label: "Workflow'u aç", href: "/workflows" },
            })
          }
        >
          <Calendar size={12} />
          Workflow olarak kur
        </Button>
      </div>

      <Card className="relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nebula/60 to-transparent" />
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-nebula" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
              Agenda · toplam {total} dk
            </span>
          </div>
          <span className="font-mono text-[10px] text-text-faint">
            Canonical EOS template
          </span>
        </div>
        <ol className="mt-4 space-y-3">
          {l10Agenda.map((item, idx) => (
            <li key={item.id} className="flex gap-4">
              <div className="flex shrink-0 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-nebula/40 bg-nebula-soft font-mono text-[11px] font-semibold text-nebula">
                  {idx + 1}
                </div>
                {idx < l10Agenda.length - 1 && (
                  <div className="mt-1 h-full w-px bg-border/50" />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-text">{item.label}</div>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-elevated/40 px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                    <Clock size={9} />
                    {item.minutes} dk
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-lg border border-nebula/25 bg-nebula-soft/20 p-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-nebula">
            <Target size={10} />
            Meeting Rating
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-text">
            Her L10 bittiğinde herkes meeting'i 1-10 puanlar. 8'in altı varsa bir sonraki L10'un ilk
            Issue'u <span className="font-mono text-nebula">"neden bu seviyede kaldık?"</span>{" "}
            olur. Bu geribildirim döngüsü EOS'un sessiz kahramanıdır.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tab 6 — Goals · The Prophecy (merged from /goals)
// ═══════════════════════════════════════════════════════════════════════════

function GoalsTab({
  goals,
  workspace,
}: {
  goals: ReturnType<typeof rocksForWorkspace> extends infer _ ? Array<{ id: string; workspaceId: string; title: string; description?: string; target: number; current: number; unit: string; trajectory: "ahead" | "on-track" | "at-risk" | "off-track"; theme?: string }> : never;
  workspace: { id: string; name: string };
}) {
  const ordered = useMemo(() => {
    const order: Record<string, number> = {
      "off-track": 0,
      "at-risk": 1,
      "on-track": 2,
      ahead: 3,
    };
    return [...goals].sort((a, b) => order[a.trajectory] - order[b.trajectory]);
  }, [goals]);

  const onRail = goals.filter(
    (g) => g.trajectory === "on-track" || g.trajectory === "ahead"
  ).length;
  const risky = goals.filter(
    (g) => g.trajectory === "at-risk" || g.trajectory === "off-track"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">
            The Prophecy · OKR & yörüngeler
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Her Rock bir goal'ün çeyreklik kesitiyken, goal'lar senelik yörüngelerin
            tamamı. <b className="text-text">{onRail}/{goals.length}</b> rotada,{" "}
            {risky > 0 && <b className="text-solar">{risky}</b>}{risky > 0 && " risk altında."}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast({
              tone: "quantum",
              title: "Yeni OKR",
              description:
                "OKR editor şu an Oracle Forge üstünden çalışır — Oracle'a bir 'goal için önerim var' suggestion'ı üreterek ekleyebilirsin.",
              action: { label: "Oracle'a git", href: "/oracle" },
            })
          }
        >
          <Target size={12} />
          Yeni OKR
        </Button>
      </div>

      <ThemeCoverageStrip ws={workspace as never} goals={goals as never} />

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-elevated/30 px-8 py-16 text-center">
          <Target size={24} className="text-text-faint" />
          <h3 className="mt-3 text-lg font-medium text-text">
            Henüz bir hedef yok
          </h3>
          <p className="mt-2 max-w-md text-sm text-text-muted leading-relaxed">
            OKR'lerini tanımladığında Matrix her ajan çağrısını, her skill
            çalışmasını ve her workflow sonucunu otomatik olarak bu hedeflerin
            yörüngesine işler.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {ordered.map((g) => (
            <GoalCard key={g.id} goal={g as never} />
          ))}
        </div>
      )}
    </div>
  );
}
