"use client";

/**
 * The Operator — Matrix task board.
 *
 * Morpheus gemi kaptanı ise Tank/Dozer/Link de Operator'ları. Tank,
 * Nebuchadnezzar'da kalıp crew'un (Matrix içindeki dijital ve gemideki
 * fiziksel) işlerini koordine eder. Bu sayfa onu modeliyor:
 *   - tek ekranda tüm workspace'in dijital + fiziksel task'leri
 *   - kanban columns: todo → doing → review → done + blocked
 *   - realm filter: digital / physical / both
 *   - owner filter: agent / human
 *   - source filter: Matrix native / Linear / Notion / Asana / Trello / Jira
 *   - sync badge — dış sistemden pull edilmişse kaynak ve last-sync göster
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/lib/store";
import {
  boardColumns,
  isOverdue,
  priorityMeta,
  sourceLabels,
  tasksForWorkspace,
  type Task,
  type TaskRealm,
  type TaskStatus,
} from "@/lib/operator";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote } from "../brand/MatrixQuote";
import {
  AlertTriangle,
  Bot,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Globe,
  MapPin,
  Plus,
  Radio,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Upload,
  User,
} from "lucide-react";
import { Button } from "../ui/Button";
import { toast } from "@/lib/toast";

export function OperatorPage() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  const [realmFilter, setRealmFilter] = useState<"all" | TaskRealm>("all");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "agent" | "human">("all");
  const [search, setSearch] = useState("");

  const wsTasks = useMemo(() => tasksForWorkspace(ws.id), [ws.id]);

  const filtered = useMemo(() => {
    return wsTasks.filter((t) => {
      if (realmFilter !== "all" && t.realm !== realmFilter) return false;
      if (ownerFilter !== "all" && t.ownerKind !== ownerFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !(t.description || "").toLowerCase().includes(q) &&
          !t.tags.some((tag) => tag.includes(q))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [wsTasks, realmFilter, ownerFilter, search]);

  // Column groups
  const byStatus = useMemo(() => {
    const out: Record<TaskStatus, Task[]> = {
      todo: [],
      doing: [],
      review: [],
      done: [],
      blocked: [],
    };
    for (const t of filtered) out[t.status].push(t);
    return out;
  }, [filtered]);

  // Topline stats
  const digitalCount = wsTasks.filter((t) => t.realm === "digital").length;
  const physicalCount = wsTasks.filter((t) => t.realm === "physical").length;
  const overdue = wsTasks.filter((t) => isOverdue(t)).length;
  const approvalPending = wsTasks.filter((t) => t.requiresApproval && t.status === "review").length;
  const synced = wsTasks.filter((t) => t.source !== "matrix" && t.source !== "oracle").length;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="ion" opacity={0.09} />
        <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-[500px] rounded-full bg-ion/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-nebula/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
            <Radio size={12} className="text-ion animate-breathe" />
            The Operator · Task Board · {ws.name}
          </div>
          <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {wsTasks.length} görev ekranda · dijital ve fiziksel.
          </h1>
          <p className="mt-3 max-w-3xl text-base text-text-muted leading-relaxed">
            Tank'ın konumu. Nebuchadnezzar'da kalır, crew'un hem Matrix içindeki
            dijital, hem gemideki fiziksel görevlerini koordine eder.{" "}
            <span className="text-text">Dış sistemlerden</span>{" "}
            (Linear · Notion · Asana · Trello · Jira) iki yönlü senkron — istersen
            kaynaktan çek, istersen Matrix'te üretilen task'ı dış sisteme push et.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatPill
              count={digitalCount}
              label="dijital"
              tone="ion"
              icon={<Globe size={11} />}
            />
            <StatPill
              count={physicalCount}
              label="fiziksel"
              tone="solar"
              icon={<MapPin size={11} />}
            />
            <StatPill
              count={overdue}
              label="gecikti"
              tone={overdue > 0 ? "crimson" : "neutral"}
              icon={<AlertTriangle size={11} />}
            />
            <StatPill
              count={approvalPending}
              label="onay bekliyor"
              tone={approvalPending > 0 ? "solar" : "neutral"}
              icon={<ShieldCheck size={11} />}
            />
            <StatPill
              count={synced}
              label="dış sistemde senkron"
              tone="nebula"
              icon={<RefreshCcw size={11} />}
            />
          </div>

          <div className="relative mt-6 max-w-3xl">
            <MatrixQuote speaker="Tank" tone="ion">
              I hope you're ready, because if you're not, we're all gonna die.
            </MatrixQuote>
          </div>
        </div>
      </section>

      {/* Filters + actions */}
      <div className="sticky top-14 z-10 flex flex-wrap items-center gap-3 border-b border-border/60 bg-void/70 px-8 py-3 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-text-faint" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            realm
          </span>
          {(["all", "digital", "physical"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRealmFilter(r)}
              className={cn(
                "rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
                realmFilter === r
                  ? r === "physical"
                    ? "border-solar/40 bg-solar-soft text-solar"
                    : r === "digital"
                    ? "border-ion/40 bg-ion-soft text-ion"
                    : "border-nebula/40 bg-nebula-soft text-nebula"
                  : "border-border/60 bg-transparent text-text-muted hover:text-text"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            owner
          </span>
          {(["all", "agent", "human"] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOwnerFilter(o)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
                ownerFilter === o
                  ? o === "agent"
                    ? "border-ion/40 bg-ion-soft text-ion"
                    : o === "human"
                    ? "border-nebula/40 bg-nebula-soft text-nebula"
                    : "border-quantum/40 bg-quantum-soft text-quantum"
                  : "border-border/60 bg-transparent text-text-muted hover:text-text"
              )}
            >
              {o === "agent" ? <Bot size={10} /> : o === "human" ? <User size={10} /> : null}
              {o}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Task ara (başlık · tag · açıklama)"
          className="min-w-48 flex-1 rounded-md border border-border/60 bg-elevated/40 px-3 py-1.5 text-sm outline-none placeholder:text-text-faint focus:border-ion/50"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast({
                tone: "nebula",
                title: "Dış sistemlerden senkron",
                description:
                  "Linear + Notion + Asana + Trello + Jira tarandı. 0 yeni task geldi (mock).",
              })
            }
          >
            <Download size={12} />
            Pull sync
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast({
                tone: "ion",
                title: "Dış sistemlere push",
                description:
                  "Matrix'te üretilen 3 task Linear'a push edildi — FER-143, FER-144, FER-145.",
              })
            }
          >
            <Upload size={12} />
            Push sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast({
                tone: "quantum",
                title: "Yeni task",
                description:
                  "Task editor bir sonraki sprint'te. Şu an Oracle veya workflow output'undan otomatik yaratılabilir.",
              })
            }
          >
            <Plus size={12} />
            Yeni task
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      <section className="px-8 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {boardColumns.map((col) => (
            <BoardColumn
              key={col.status}
              status={col.status}
              label={col.label}
              tone={col.tone}
              tasks={byStatus[col.status]}
            />
          ))}
        </div>

        {/* Integration legend */}
        <div className="mt-8 rounded-xl border border-border/60 bg-surface/60 p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            <Sparkles size={11} className="text-nebula" />
            Two-way integration · bağlı kaynaklar
          </div>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            The Operator hem <b className="text-text">dışarıdan task çeker</b>{" "}
            (Linear/Notion/Asana/Trello/Jira'daki mevcut kartlar) hem de{" "}
            <b className="text-text">Matrix'in ürettiği task'ları dışarıya push eder</b>{" "}
            (örn. content-writer ajanı draft bitirdiğinde editor için Notion kartı yaratır).
            Her entegrasyon TrainStation'daki ilgili connector üstünden çalışır —
            API key'i env'de tanımlıysa otomatik senkronizasyon.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              ["linear", "notion", "asana", "trello", "jira", "github"] as const
            ).map((src) => {
              const count = wsTasks.filter((t) => t.source === src).length;
              return (
                <span
                  key={src}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px]",
                    count > 0
                      ? "border-nebula/30 bg-nebula-soft/30 text-nebula"
                      : "border-border/60 bg-elevated/30 text-text-faint"
                  )}
                >
                  <ExternalLink size={9} />
                  {sourceLabels[src]}
                  <span className="ml-1 text-text-muted">{count}</span>
                </span>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column
// ---------------------------------------------------------------------------

function BoardColumn({
  status,
  label,
  tone,
  tasks,
}: {
  status: TaskStatus;
  label: string;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson";
  tasks: Task[];
}) {
  const toneBorder =
    tone === "ion"
      ? "border-ion/40"
      : tone === "nebula"
      ? "border-nebula/40"
      : tone === "quantum"
      ? "border-quantum/40"
      : tone === "solar"
      ? "border-solar/40"
      : "border-crimson/40";
  const toneText =
    tone === "ion"
      ? "text-ion"
      : tone === "nebula"
      ? "text-nebula"
      : tone === "quantum"
      ? "text-quantum"
      : tone === "solar"
      ? "text-solar"
      : "text-crimson";

  return (
    <div className="flex flex-col">
      <div className={cn("flex items-center justify-between border-b pb-2", toneBorder)}>
        <div className={cn("flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider", toneText)}>
          {label}
        </div>
        <span className="font-mono text-[10px] text-text-faint">{tasks.length}</span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
        {tasks.length === 0 && (
          <li className="rounded-md border border-dashed border-border/50 bg-elevated/20 p-3 text-center font-mono text-[10px] text-text-faint">
            boş
          </li>
        )}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task card
// ---------------------------------------------------------------------------

function TaskCard({ task: t }: { task: Task }) {
  const prioTone = priorityMeta[t.priority].tone;
  const prioCls =
    prioTone === "crimson"
      ? "text-crimson border-crimson/30 bg-crimson-soft"
      : prioTone === "solar"
      ? "text-solar border-solar/30 bg-solar-soft"
      : prioTone === "ion"
      ? "text-ion border-ion/30 bg-ion-soft"
      : "text-text-muted border-border/50 bg-elevated";

  const overdueFlag = isOverdue(t);
  const due = t.dueAtIso ? new Date(t.dueAtIso) : null;
  const dueLabel = due
    ? due.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })
    : null;

  return (
    <li
      className={cn(
        "rounded-lg border bg-surface/70 p-3 backdrop-blur-sm transition-colors",
        t.realm === "physical"
          ? "border-solar/20 hover:border-solar/40"
          : "border-border/60 hover:border-border-strong",
        overdueFlag && "ring-1 ring-crimson/30"
      )}
    >
      {/* Top meta row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded border px-1 py-px font-mono text-[9px] uppercase tracking-wider",
              t.realm === "physical"
                ? "border-solar/30 bg-solar-soft text-solar"
                : "border-ion/30 bg-ion-soft text-ion"
            )}
          >
            {t.realm === "physical" ? <MapPin size={8} /> : <Globe size={8} />}
            {t.realm}
          </span>
          <span
            className={cn(
              "rounded border px-1 py-px font-mono text-[9px] uppercase tracking-wider",
              prioCls
            )}
          >
            {t.priority}
          </span>
        </div>
        {t.source !== "matrix" && (
          <span className="inline-flex items-center gap-0.5 rounded border border-nebula/30 bg-nebula-soft/40 px-1 py-px font-mono text-[9px] text-nebula">
            <ExternalLink size={8} />
            {sourceLabels[t.source]}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="mt-1.5 text-[13px] font-medium leading-snug text-text">
        {t.title}
      </h4>

      {/* Description */}
      {t.description && (
        <p className="mt-1 text-[11px] leading-relaxed text-text-muted line-clamp-2">
          {t.description}
        </p>
      )}

      {/* Bottom meta row */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-text-faint">
        <span className="inline-flex items-center gap-1">
          {t.ownerKind === "agent" ? (
            <Bot size={9} className="text-ion" />
          ) : (
            <User size={9} className="text-nebula" />
          )}
          <span className="text-text-muted">{t.ownerName}</span>
        </span>

        {dueLabel && (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdueFlag ? "text-crimson" : "text-text-muted"
            )}
          >
            <Clock size={9} />
            {dueLabel}
          </span>
        )}

        {t.estimatedMinutes != null && (
          <span className="inline-flex items-center gap-1">
            <Timer size={9} />
            {t.estimatedMinutes}'
          </span>
        )}

        {t.requiresApproval && (
          <span className="inline-flex items-center gap-1 text-solar">
            <ShieldCheck size={9} />
            onay
          </span>
        )}
      </div>

      {/* Tags + cross-link */}
      {(t.tags.length > 0 || t.relatedRockId || t.relatedIssueId) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {t.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded border border-border/50 bg-elevated/40 px-1.5 py-px font-mono text-[9px] text-text-muted"
            >
              {tag}
            </span>
          ))}
          {t.relatedRockId && (
            <span className="rounded border border-solar/30 bg-solar-soft/30 px-1.5 py-px font-mono text-[9px] text-solar">
              ↔ rock
            </span>
          )}
          {t.relatedIssueId && (
            <span className="rounded border border-crimson/30 bg-crimson-soft/30 px-1.5 py-px font-mono text-[9px] text-crimson">
              ↔ issue
            </span>
          )}
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Hero stat pill
// ---------------------------------------------------------------------------

function StatPill({
  count,
  label,
  tone,
  icon,
}: {
  count: number;
  label: string;
  tone: "ion" | "nebula" | "quantum" | "solar" | "crimson" | "neutral";
  icon: React.ReactNode;
}) {
  const cls =
    tone === "ion"
      ? "text-ion bg-ion-soft border-ion/30"
      : tone === "nebula"
      ? "text-nebula bg-nebula-soft border-nebula/30"
      : tone === "quantum"
      ? "text-quantum bg-quantum-soft border-quantum/30"
      : tone === "solar"
      ? "text-solar bg-solar-soft border-solar/30"
      : tone === "crimson"
      ? "text-crimson bg-crimson-soft border-crimson/30"
      : "text-text-muted bg-elevated border-border";
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", cls)}>
      {icon}
      <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _keepImports = [ClipboardList];
