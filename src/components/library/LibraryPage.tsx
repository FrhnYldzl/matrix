"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  agents as seedAgents,
  skills as seedSkills,
  workflows as seedWorkflows,
} from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/store";
import { Button } from "../ui/Button";
import { LibraryItemCard } from "./LibraryItemCard";
import { CreateDrawer } from "./CreateDrawer";
import {
  Bot,
  LibraryBig,
  Plus,
  Search,
  Sparkles,
  Waypoints,
  Wrench,
} from "lucide-react";
import { MatrixHexGrid } from "../brand/MatrixHexGrid";
import { MatrixQuote, MODULE_QUOTES } from "../brand/MatrixQuote";
import { toast } from "@/lib/toast";

type Tab = "skill" | "agent" | "workflow";

const tabMeta: Record<
  Tab,
  { label: string; icon: typeof Wrench; tone: "nebula" | "ion" | "quantum" }
> = {
  skill: { label: "Skills", icon: Wrench, tone: "nebula" },
  agent: { label: "Agents", icon: Bot, tone: "ion" },
  workflow: { label: "Workflows", icon: Waypoints, tone: "quantum" },
};

export function LibraryPage() {
  const { currentWorkspaceId, createdSkills, createdAgents, createdWorkflows } =
    useWorkspaceStore();
  const [tab, setTab] = useState<Tab>("skill");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [q, setQ] = useState("");

  const lists = useMemo(() => {
    const wsSkills = [
      ...seedSkills
        .filter((s) => s.workspaceId === currentWorkspaceId)
        .map((s) => ({ entity: s, origin: "seed" as const })),
      ...createdSkills.filter((c) => c.entity.workspaceId === currentWorkspaceId),
    ];
    const wsAgents = [
      ...seedAgents
        .filter((a) => a.workspaceId === currentWorkspaceId)
        .map((a) => ({ entity: a, origin: "seed" as const })),
      ...createdAgents.filter((c) => c.entity.workspaceId === currentWorkspaceId),
    ];
    const wsWorkflows = [
      ...seedWorkflows
        .filter((w) => w.workspaceId === currentWorkspaceId)
        .map((w) => ({ entity: w, origin: "seed" as const })),
      ...createdWorkflows.filter(
        (c) => c.entity.workspaceId === currentWorkspaceId
      ),
    ];
    return {
      skill: wsSkills,
      agent: wsAgents,
      workflow: wsWorkflows,
    };
  }, [currentWorkspaceId, createdSkills, createdAgents, createdWorkflows]);

  const activeList = lists[tab];
  const filtered = useMemo(() => {
    if (!q.trim()) return activeList;
    const query = q.toLowerCase();
    return activeList.filter((item) => {
      const e = item.entity as { name: string; displayName: string };
      return (
        e.name.toLowerCase().includes(query) ||
        e.displayName.toLowerCase().includes(query)
      );
    });
  }, [activeList, q]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50 px-8 pt-10 pb-8">
        <MatrixHexGrid tone="nebula" opacity={0.08} />
        <div className="pointer-events-none absolute -top-20 left-1/3 h-48 w-[500px] rounded-full bg-nebula/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-40 w-[400px] rounded-full bg-ion/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
              <LibraryBig size={12} className="text-nebula" />
              The Archive · Library
            </div>
            <h1 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-text md:text-5xl">
              {lists.skill.length + lists.agent.length + lists.workflow.length} parça envanterde.
            </h1>
            <p className="mt-3 text-base text-text-muted leading-relaxed">
              Tüm yeniden kullanılabilir bileşenlerin tek katta: Skills · Agents · Workflows.
              Oracle boşluk tespit ederse Forge motoruyla anında yeni bir parça üretir; sen
              GitHub'dan, n8n'den veya dosyadan da import edebilirsin.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Pill count={lists.skill.length} label="Skill" tone="nebula" />
              <Pill count={lists.agent.length} label="Agent" tone="ion" />
              <Pill count={lists.workflow.length} label="Workflow" tone="quantum" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="md" className="gap-1.5" onClick={() => setDrawerOpen(true)}>
              <Plus size={14} />
              Yeni {tabMeta[tab].label.slice(0, -1)}
            </Button>
          </div>
        </div>

        <div className="relative mt-6 max-w-3xl">
          <MatrixQuote speaker={MODULE_QUOTES["/library"].speaker} tone={MODULE_QUOTES["/library"].tone}>
            {MODULE_QUOTES["/library"].line}
          </MatrixQuote>
        </div>
      </section>

      {/* Tabs + search */}
      <div className="sticky top-14 z-10 border-b border-border/60 bg-void/70 px-8 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {(Object.keys(tabMeta) as Tab[]).map((t) => {
              const Icon = tabMeta[t].icon;
              const active = t === tab;
              const tone = tabMeta[t].tone;
              const toneCls =
                tone === "nebula"
                  ? "text-nebula bg-nebula-soft border-nebula/40"
                  : tone === "ion"
                  ? "text-ion bg-ion-soft border-ion/40"
                  : "text-quantum bg-quantum-soft border-quantum/40";
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-all",
                    active
                      ? toneCls + " shadow-inner"
                      : "border-border/60 bg-transparent text-text-muted hover:border-border-strong hover:text-text"
                  )}
                >
                  <Icon size={13} />
                  {tabMeta[t].label}
                  <span className="rounded bg-void/40 px-1.5 py-0.5 font-mono text-[10px]">
                    {lists[t].length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2 rounded-md border border-border/60 bg-elevated/40 px-3 py-1.5 text-sm md:w-80">
            <Search size={13} className="text-text-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Envanterde ara…"
              className="w-full bg-transparent outline-none placeholder:text-text-faint"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast({
                tone: "nebula",
                title: "Oracle boşluk taraması",
                description: `${lists.skill.length} skill · ${lists.agent.length} agent · ${lists.workflow.length} workflow tarandı. Oracle önerileri detaylı listeleniyor.`,
                action: { label: "Oracle'a git", href: "/oracle" },
              })
            }
          >
            <Sparkles size={12} className="text-nebula" />
            Oracle'dan boşluk öner
          </Button>
        </div>
      </div>

      {/* List */}
      <section className="px-8 py-8">
        {filtered.length === 0 ? (
          <EmptyTab tab={tab} onCreate={() => setDrawerOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filtered.map((item) => (
              <LibraryItemCard
                key={(item.entity as { id: string }).id}
                kind={tab}
                name={(item.entity as { name: string }).name}
                displayName={(item.entity as { displayName?: string; name: string }).displayName || (item.entity as { name: string }).name}
                summary={describeItem(tab, item.entity)}
                tags={extractTags(tab, item.entity)}
                origin={item.origin}
                filePath={pathFor(tab, item.entity)}
                meta={metaFor(tab, item.entity)}
                footer={
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() =>
                        toast({
                          tone: "nebula",
                          title: "Inline editor",
                          description: "Archive'da inline SKILL.md/AGENT.md editor'ü bir sonraki sprint'te.",
                        })
                      }
                    >
                      Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7"
                      onClick={() =>
                        toast({
                          tone: "ion",
                          title: "Dosya içeriği",
                          description: "Canonical markdown/YAML clipboard'a kopyalandı (mock).",
                        })
                      }
                    >
                      Dosyayı aç
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      <CreateDrawer open={drawerOpen} kind={tab} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

function Pill({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "nebula" | "ion" | "quantum";
}) {
  const toneCls =
    tone === "nebula"
      ? "text-nebula bg-nebula-soft border-nebula/30"
      : tone === "ion"
      ? "text-ion bg-ion-soft border-ion/30"
      : "text-quantum bg-quantum-soft border-quantum/30";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${toneCls}`}
    >
      <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}

function EmptyTab({ tab, onCreate }: { tab: Tab; onCreate: () => void }) {
  const M = tabMeta[tab];
  const Icon = M.icon;
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-elevated/30 px-8 py-20 text-center">
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl",
          M.tone === "nebula" && "bg-nebula-soft text-nebula",
          M.tone === "ion" && "bg-ion-soft text-ion",
          M.tone === "quantum" && "bg-quantum-soft text-quantum"
        )}
      >
        <Icon size={22} strokeWidth={1.4} />
      </div>
      <h3 className="mt-5 text-lg font-medium text-text">
        {M.label} envanterde yok
      </h3>
      <p className="mt-2 max-w-md text-sm text-text-muted leading-relaxed">
        Oracle'dan öneri al, Catalog'dan ekle, GitHub'dan import et veya sıfırdan yaz.
        Matrix her dördünü de destekliyor.
      </p>
      <div className="mt-4">
        <Button variant="primary" size="md" className="gap-1.5" onClick={onCreate}>
          <Plus size={14} /> Yeni {M.label.slice(0, -1)}
        </Button>
      </div>
    </div>
  );
}

// ---- Helpers ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function describeItem(tab: Tab, e: any): string {
  if (tab === "skill") return e.description || "—";
  if (tab === "agent") return e.description || "—";
  return `${e.cadence} · ${e.steps} adım`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTags(tab: Tab, e: any): string[] {
  if (tab === "skill") return e.triggers || [];
  if (tab === "agent") return [e.model, ...(e.scopes || [])];
  return [e.lastStatus];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pathFor(tab: Tab, e: any): string | undefined {
  if (tab === "skill") return `skills/${e.name}/SKILL.md`;
  if (tab === "agent") return `agents/${e.name}/AGENT.md`;
  return `workflows/${e.name}.yaml`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function metaFor(tab: Tab, e: any): React.ReactNode {
  if (tab === "skill") {
    return (
      <div>
        <div className={cn("text-sm font-semibold", e.goldenTestPassing ? "text-quantum" : "text-crimson")}>
          {e.goldenTestPassing ? "golden ✓" : "golden ✗"}
        </div>
        <div className="text-[10px] text-text-faint">{e.runsThisWeek} / hafta</div>
      </div>
    );
  }
  if (tab === "agent") {
    return (
      <div>
        <div className="text-sm font-semibold text-text">%{Math.round(e.successRate * 100)}</div>
        <div className="text-[10px] text-text-faint">{e.callsToday} çağrı</div>
      </div>
    );
  }
  return (
    <div>
      <div className="text-sm font-semibold text-text">{e.steps}</div>
      <div className="text-[10px] text-text-faint">adım</div>
    </div>
  );
}
