"use client";

import { useMemo, useState } from "react";
import { useWorkspaceStore } from "@/lib/store";
import {
  agents as allAgents,
  departments as allDepartments,
  goals as allGoals,
  skills as allSkills,
  workflows as allWorkflows,
} from "@/lib/mock-data";
import { connectors as allConnectors } from "@/lib/connectors";
import { getBudgetsWithSpend } from "@/lib/costs";
import { scanWorkspace, type Suggestion } from "@/lib/oracle";
import {
  forgeAgent,
  forgeSkill,
  forgeWorkflow,
  inferForgeTarget,
  type AgentIntent,
  type SkillIntent,
  type WorkflowIntent,
} from "@/lib/forge";
import { OracleHero } from "./OracleHero";
import { EmptyOracleState, SuggestionCard } from "./SuggestionCard";
import {
  FilterPanel,
  applyFilters,
  defaultFilters,
  type Filters,
} from "./FilterPanel";

export function OraclePage() {
  const {
    currentWorkspaceId,
    workspaces,
    createSkill,
    createAgent,
    createWorkflow,
    createdGoals,
    createdAgents,
    createdSkills,
    createdWorkflows,
    createdDepartments,
  } = useWorkspaceStore();
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  const [filters, setFilters] = useState<Filters>(defaultFilters());
  const [scanning, setScanning] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [scanTick, setScanTick] = useState(0);

  const suggestions = useMemo(() => {
    if (!ws) return [];
    // re-run on scanTick to let "rescan" feel fresh
    void scanTick;
    return scanWorkspace({
      workspace: ws,
      departments: [
        ...allDepartments.filter((d) => d.workspaceId === ws.id),
        ...createdDepartments
          .filter((c) => c.entity.workspaceId === ws.id)
          .map((c) => c.entity),
      ],
      agents: [
        ...allAgents.filter((a) => a.workspaceId === ws.id),
        ...createdAgents
          .filter((c) => c.entity.workspaceId === ws.id)
          .map((c) => c.entity),
      ],
      skills: [
        ...allSkills.filter((s) => s.workspaceId === ws.id),
        ...createdSkills
          .filter((c) => c.entity.workspaceId === ws.id)
          .map((c) => c.entity),
      ],
      workflows: [
        ...allWorkflows.filter((w) => w.workspaceId === ws.id),
        ...createdWorkflows
          .filter((c) => c.entity.workspaceId === ws.id)
          .map((c) => c.entity),
      ],
      goals: [
        ...allGoals.filter((g) => g.workspaceId === ws.id),
        ...createdGoals
          .filter((c) => c.entity.workspaceId === ws.id)
          .map((c) => c.entity),
      ],
      connectors: allConnectors,
      budgets: getBudgetsWithSpend(ws.id),
    });
  }, [
    ws,
    scanTick,
    createdDepartments,
    createdAgents,
    createdSkills,
    createdWorkflows,
    createdGoals,
  ]);

  const visible = useMemo(
    () =>
      applyFilters(suggestions, filters).filter(
        (s) => !dismissed.has(s.source) && !accepted.has(s.source)
      ),
    [suggestions, filters, dismissed, accepted]
  );

  const grouped = useMemo(() => {
    const high: Suggestion[] = [];
    const medium: Suggestion[] = [];
    const low: Suggestion[] = [];
    visible.forEach((s) => {
      if (s.priority === "high") high.push(s);
      else if (s.priority === "medium") medium.push(s);
      else low.push(s);
    });
    return { high, medium, low };
  }, [visible]);

  const rescan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanTick((v) => v + 1);
      setScanning(false);
    }, 700);
  };

  const dismiss = (s: Suggestion) =>
    setDismissed((prev) => new Set(prev).add(s.source));

  const accept = (s: Suggestion) => {
    const ctx = {
      workspaceId: ws.id,
      agents: allAgents
        .filter((a) => a.workspaceId === ws.id)
        .map((a) => ({
          id: a.id,
          name: a.name,
          displayName: a.displayName,
          departmentId: a.departmentId,
        })),
      departments: allDepartments
        .filter((d) => d.workspaceId === ws.id)
        .map((d) => ({ id: d.id, name: d.name })),
    };
    const target = inferForgeTarget(s, ctx);
    if (!target) {
      setToast(`"${s.title.slice(0, 40)}…" otomatik üretilemez — Library'den manuel aç.`);
      setTimeout(() => setToast(null), 3500);
      return;
    }
    const createdAt = new Date().toISOString();
    if (target.kind === "skill") {
      const f = forgeSkill(target.intent as SkillIntent, ws.id);
      createSkill(
        {
          entity: f.skill,
          origin: "oracle",
          createdAt,
          file: { path: f.relativePath, language: "markdown", content: f.markdown },
        },
        s.source
      );
      setToast(`✓ Skill "${f.skill.displayName}" envantere eklendi.`);
    } else if (target.kind === "agent") {
      const f = forgeAgent(target.intent as AgentIntent, ws.id);
      createAgent(
        {
          entity: f.agent,
          origin: "oracle",
          createdAt,
          file: { path: f.relativePath, language: "markdown", content: f.markdown },
        },
        s.source
      );
      setToast(`✓ Agent "${f.agent.displayName}" envantere eklendi.`);
    } else {
      const f = forgeWorkflow(target.intent as WorkflowIntent, ws.id);
      createWorkflow(
        {
          entity: f.workflow,
          origin: "oracle",
          createdAt,
          file: { path: f.relativePath, language: "yaml", content: f.yaml },
        },
        s.source
      );
      setToast(`✓ Workflow "${f.workflow.name}" envantere eklendi.`);
    }
    setAccepted((prev) => new Set(prev).add(s.source));
    setTimeout(() => setToast(null), 3500);
  };

  if (!ws) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-text-muted">
        Workspace yok — sol üstten ekle.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-lg border border-quantum/40 bg-quantum-soft/90 px-4 py-2.5 text-sm text-quantum shadow-[0_20px_40px_-10px_rgba(61,224,168,0.3)] backdrop-blur-md animate-[breathe_1.5s_ease-out]">
          {toast}
        </div>
      )}
      <OracleHero
        ws={ws}
        suggestions={visible}
        onRescan={rescan}
        scanning={scanning}
      />

      <section className="px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {visible.length === 0 && <EmptyOracleState />}

            {grouped.high.length > 0 && (
              <GroupSection title="Yüksek Öncelik" accent="crimson">
                {grouped.high.map((s) => (
                  <SuggestionCard key={s.id} suggestion={s} onDismiss={dismiss} onAccept={accept} />
                ))}
              </GroupSection>
            )}
            {grouped.medium.length > 0 && (
              <GroupSection title="Orta Öncelik" accent="solar">
                {grouped.medium.map((s) => (
                  <SuggestionCard key={s.id} suggestion={s} onDismiss={dismiss} onAccept={accept} />
                ))}
              </GroupSection>
            )}
            {grouped.low.length > 0 && (
              <GroupSection title="Düşük Öncelik" accent="neutral">
                {grouped.low.map((s) => (
                  <SuggestionCard key={s.id} suggestion={s} onDismiss={dismiss} onAccept={accept} />
                ))}
              </GroupSection>
            )}
          </div>

          <div>
            <FilterPanel
              suggestions={suggestions}
              filters={filters}
              onChange={setFilters}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function GroupSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "crimson" | "solar" | "neutral";
  children: React.ReactNode;
}) {
  const dotCls =
    accent === "crimson"
      ? "bg-crimson"
      : accent === "solar"
      ? "bg-solar"
      : "bg-text-faint";

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
        <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
          {title}
        </h2>
        <div className="h-px flex-1 bg-border/60" />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
