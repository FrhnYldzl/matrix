"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { Database } from "lucide-react";

/**
 * /workspace/[id]/data — The Mainframe
 *
 * Bilgi & analitik:
 *   • The Truth (Insights)
 *   • The Tribute (Spend & ROI)
 *   • Entity Tables (yeni — Airtable view: agents · skills · workflows · goals · tasks · rituals · budgets)
 *   • Goal Orbits (görsel OKR)
 */
export default function DataTab() {
  const params = useParams<{ id: string }>();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const createdAgents = useWorkspaceStore((s) => s.createdAgents);
  const createdSkills = useWorkspaceStore((s) => s.createdSkills);
  const createdWorkflows = useWorkspaceStore((s) => s.createdWorkflows);
  const createdGoals = useWorkspaceStore((s) => s.createdGoals);
  const createdOperatorTasks = useWorkspaceStore((s) => s.createdOperatorTasks);
  const createdRituals = useWorkspaceStore((s) => s.createdRituals);
  const createdBudgets = useWorkspaceStore((s) => s.createdBudgets);
  const createdDepartments = useWorkspaceStore((s) => s.createdDepartments);

  const ws = workspaces.find((w) => w.id === params.id);
  if (!ws) return null;

  // Entity counts (workspace bazlı)
  const counts = {
    agents: createdAgents.filter((c) => c.entity.workspaceId === ws.id).length,
    skills: createdSkills.filter((c) => c.entity.workspaceId === ws.id).length,
    workflows: createdWorkflows.filter((c) => c.entity.workspaceId === ws.id)
      .length,
    goals: createdGoals.filter((c) => c.entity.workspaceId === ws.id).length,
    tasks: createdOperatorTasks.filter((c) => c.entity.workspaceId === ws.id)
      .length,
    rituals: createdRituals.filter((c) => c.entity.workspaceId === ws.id)
      .length,
    budgets: createdBudgets.filter((c) => c.entity.workspaceId === ws.id)
      .length,
    departments: createdDepartments.filter((c) => c.entity.workspaceId === ws.id)
      .length,
  };

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
            <Database size={12} className="text-quantum" />
            The Mainframe · bilgi & analitik
          </div>
          <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-text">
            {ws.name} · veri tabloları
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Entity tabloları · kaldıraç skoru · gelir/harcama · hedef
            yörüngeleri.
          </p>
        </header>

        {/* Entity tables grid */}
        <section>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            Entity Tabloları · {Object.values(counts).reduce((s, n) => s + n, 0)} kayıt
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <EntityTile label="Agents" count={counts.agents} tone="ion" />
            <EntityTile label="Skills" count={counts.skills} tone="nebula" />
            <EntityTile label="Workflows" count={counts.workflows} tone="quantum" />
            <EntityTile label="Goals" count={counts.goals} tone="quantum" />
            <EntityTile label="Tasks" count={counts.tasks} tone="ion" />
            <EntityTile label="Rituals" count={counts.rituals} tone="nebula" />
            <EntityTile label="Budgets" count={counts.budgets} tone="solar" />
            <EntityTile label="Departments" count={counts.departments} tone="ion" />
          </div>
        </section>

        {/* Analytics modules */}
        <section>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            Analitik
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Link
              href="/insights"
              className="block rounded-xl border border-ion/30 bg-ion-soft/15 p-4 transition-all hover:scale-[1.01]"
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ion">
                The Truth · Insights
              </div>
              <div className="mt-1 text-base font-semibold text-text">
                Kaldıraç &amp; performans
              </div>
              <div className="mt-1 text-xs text-text-muted">
                Delegasyon ratio · agent perf · weekly retro
              </div>
            </Link>
            <Link
              href="/spend"
              className="block rounded-xl border border-solar/30 bg-solar-soft/15 p-4 transition-all hover:scale-[1.01]"
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-solar">
                The Tribute · Spend &amp; ROI
              </div>
              <div className="mt-1 text-base font-semibold text-text">
                Gelir vs harcama
              </div>
              <div className="mt-1 text-xs text-text-muted">
                30g rollup · budget alerts · ROI per agent
              </div>
            </Link>
          </div>
        </section>

        <div className="rounded-lg border border-dashed border-border/60 bg-elevated/20 p-4 text-center">
          <p className="text-xs text-text-muted">
            Sprint D&apos;de Airtable-style entity table editörü gelecek
            (inline edit, filter, SQL view).
          </p>
        </div>
      </div>
    </div>
  );
}

function EntityTile({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "ion" | "nebula" | "quantum" | "solar";
}) {
  const toneCls: Record<typeof tone, string> = {
    ion: "border-ion/30 bg-ion-soft/15",
    nebula: "border-nebula/30 bg-nebula-soft/15",
    quantum: "border-quantum/30 bg-quantum-soft/15",
    solar: "border-solar/30 bg-solar-soft/15",
  };
  const textCls: Record<typeof tone, string> = {
    ion: "text-ion",
    nebula: "text-nebula",
    quantum: "text-quantum",
    solar: "text-solar",
  };
  return (
    <div className={`rounded-lg border p-3 ${toneCls[tone]}`}>
      <div
        className={`font-mono text-[9px] uppercase tracking-[0.18em] ${textCls[tone]}`}
      >
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-text">
        {count}
      </div>
    </div>
  );
}
