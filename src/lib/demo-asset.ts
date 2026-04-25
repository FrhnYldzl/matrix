"use client";

/**
 * Demo Asset Seeder — tek fonksiyonla Newsletter workspace'i + Oracle
 * proposal'ın tüm 30+ entity'sini store'a yazar.
 *
 * Amaç: Yeni kullanıcı 6 soruluk interview'a takılmadan, MATRIX_FLOW'un
 * 13 adımını uçtan uca dolaşıp ürünü deneyimleyebilsin. WorkspaceSwitcher'da
 * "Demo asset yükle" butonuyla tetiklenir.
 *
 * Yarattığı şey:
 *   - Workspace: "AI Matrix Newsletter · DEMO"
 *   - 4 dept · 4 agent · 5 skill · 3 workflow (Oracle proposal'dan)
 *   - 4 OKR (Goals & Orbits)
 *   - 4 ritual (Prime Program)
 *   - 4-5 budget (The Tribute)
 *   - 5 quick-win + 5 physical task (Operator)
 */

import { generateProposal } from "./oracle-onboarding";
import { ASSET_TEMPLATES } from "./asset-templates";
import type {
  Agent,
  Department,
  Goal,
  Ritual,
  Skill,
  Workflow,
  Workspace,
} from "./types";
import type { Task } from "./operator";
import type { Budget } from "./costs";
import type { useWorkspaceStore } from "./store";

type StoreApi = ReturnType<typeof useWorkspaceStore.getState>;

const DEMO_ANSWERS = {
  monthlyRevenueTargetUsd: 5000,
  timelineMonths: 6,
  niche: "AI tools & Matrix universe haberleri",
  weeklyHoursAvailable: 10,
  startingCapitalUsd: 500,
  uniqueAngle: "Günlük 5 dakikada AI dünyasının özeti — Morpheus tonunda",
};

const rand = () => Math.random().toString(36).slice(2, 6);

/**
 * Tüm asset'i tek seferde seed et. Caller store action'larına direkt erişir
 * (storeApi). Hangi workspace yaratıldıysa onun id'sini döner.
 */
export function seedDemoNewsletterAsset(store: StoreApi): { workspaceId: string } | null {
  const newsletterTemplate = ASSET_TEMPLATES.find((t) => t.type === "newsletter");
  if (!newsletterTemplate) return null;

  // 1. Workspace yarat
  const wsId = `ws-demo-newsletter-${Date.now().toString(36)}`;
  const workspace: Workspace = {
    id: wsId,
    name: "AI Matrix Newsletter · DEMO",
    shortName: "AM",
    industry: newsletterTemplate.defaultIndustry,
    mission: newsletterTemplate.mission,
    vision: newsletterTemplate.vision,
    strategicThemes: newsletterTemplate.themes.map((t, i) => ({
      id: `st-demo-${i}`,
      label: t.label,
      description: t.description,
      weight: t.weight,
    })),
    valueAnchors: [
      {
        id: "va-demo-1",
        label: "İnsan son kararı verir",
        description: "External-send scope'u her zaman onay gerektirir.",
      },
      {
        id: "va-demo-2",
        label: "Editör disiplini ödün vermez",
        description: "Hiçbir AI draft direkt yayınlanmaz — insan polish şart.",
      },
    ],
    accent: "nebula",
    createdAt: new Date().toISOString(),
  };

  store.createWorkspace(
    { entity: workspace, origin: "manual", createdAt: workspace.createdAt },
    "demo-asset:newsletter"
  );
  store.setWorkspace(wsId);

  // 2. Oracle proposal üret
  const proposal = generateProposal(newsletterTemplate, DEMO_ANSWERS);

  // 3. ID maplerini önceden hesapla (acceptProposal'daki aynı pattern)
  const deptNameToId: Record<string, string> = {};
  proposal.departments.forEach((d) => {
    deptNameToId[d.name] = `dept-${wsId}-${d.name}-${rand()}`;
  });

  const agentNameToId: Record<string, string> = {};
  proposal.agents.forEach((a) => {
    agentNameToId[a.name] = `ag-${wsId}-${a.name}-${rand()}`;
  });

  const skillNameToId: Record<string, string> = {};
  proposal.skills.forEach((s) => {
    skillNameToId[s.name] = `sk-${wsId}-${s.name}-${rand()}`;
  });

  const skillOwnerAgentId: Record<string, string> = {};
  proposal.agents.forEach((a) => {
    a.skillNames.forEach((skName) => {
      if (!skillOwnerAgentId[skName]) {
        skillOwnerAgentId[skName] = agentNameToId[a.name] ?? "";
      }
    });
  });

  const nowIso = new Date().toISOString();
  const sourceTag = `demo-asset:${wsId}`;

  // 4. Departments
  proposal.departments.forEach((d) => {
    const dept: Department = {
      id: deptNameToId[d.name],
      workspaceId: wsId,
      name: d.displayName,
      description: d.summary,
      owner: "Ferhan Y.",
      health: 80,
    };
    store.createDepartment({ entity: dept, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 5. Agents (real skillIds + departmentId)
  proposal.agents.forEach((a) => {
    const realSkillIds = a.skillNames
      .map((n) => skillNameToId[n])
      .filter((id): id is string => Boolean(id));
    const agent: Agent = {
      id: agentNameToId[a.name],
      workspaceId: wsId,
      departmentId: deptNameToId[a.departmentName] ?? "",
      name: a.name,
      displayName: a.displayName,
      description: a.summary,
      model: a.model,
      status: "idle",
      scopes: ["read"],
      skillIds: realSkillIds,
      callsToday: 0,
      successRate: 0,
    };
    store.createAgent({ entity: agent, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 6. Skills (real ownerAgentId)
  proposal.skills.forEach((s) => {
    const skill: Skill = {
      id: skillNameToId[s.name],
      workspaceId: wsId,
      ownerAgentId: skillOwnerAgentId[s.name] ?? "",
      name: s.name,
      displayName: s.displayName,
      description: s.summary,
      triggers: [],
      runsThisWeek: 0,
      goldenTestPassing: false,
    };
    store.createSkill({ entity: skill, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 7. Workflows
  const firstDeptId = Object.values(deptNameToId)[0] ?? "";
  proposal.workflows.forEach((w) => {
    const workflow: Workflow = {
      id: `wf-${wsId}-${w.name}-${rand()}`,
      workspaceId: wsId,
      departmentId: firstDeptId,
      name: w.name,
      cadence: w.cadence,
      nextRun: "",
      lastStatus: "success",
      steps: w.steps.length,
      description: w.description,
    };
    store.createWorkflow({ entity: workflow, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 8. Goals
  (proposal.goals ?? []).forEach((g, i) => {
    const goal: Goal = {
      id: `goal-${wsId}-${i}-${rand()}`,
      workspaceId: wsId,
      title: g.title,
      metric: g.metric,
      target: g.target,
      current: g.current,
      unit: g.unit,
      invert: g.invert,
      trajectory: g.trajectory,
      linkedAgentIds: [],
      linkedSkillIds: [],
      cadence: g.cadence,
      history: [],
    };
    store.createGoal({ entity: goal, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 9. Physical tasks
  proposal.physicalTasks.forEach((t) => {
    const dueIso = new Date(Date.now() + t.dueInDays * 86400000).toISOString();
    const task: Task = {
      id: `tsk-${wsId}-${rand()}`,
      workspaceId: wsId,
      title: t.title,
      description: t.description,
      realm: "physical",
      status: "todo",
      priority: t.priority,
      ownerName: "Ferhan Y.",
      ownerKind: "human",
      tags: ["onboarding", "physical", "demo"],
      createdAtIso: nowIso,
      dueAtIso: dueIso,
      source: "oracle",
      estimatedMinutes: t.estimatedMinutes,
    };
    store.createOperatorTask({ entity: task, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 10. Quick wins
  (proposal.quickWins ?? []).forEach((qw, i) => {
    const task: Task = {
      id: `tsk-qw-${wsId}-${i}-${rand()}`,
      workspaceId: wsId,
      title: qw.title,
      description: qw.description,
      realm: qw.realmHint === "library" || qw.realmHint === "control" ? "digital" : "physical",
      status: "todo",
      priority: "p1",
      ownerName: "Ferhan Y.",
      ownerKind: "human",
      tags: ["quick-win", `realm:${qw.realmHint}`, "demo"],
      createdAtIso: nowIso,
      dueAtIso: new Date(Date.now() + 24 * 3600000).toISOString(),
      source: "oracle",
      estimatedMinutes: qw.estimatedMinutes,
    };
    store.createOperatorTask({ entity: task, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 11. Rituals
  (proposal.rituals ?? []).forEach((r, i) => {
    const ritual: Ritual = {
      id: `rit-${wsId}-${i}-${rand()}`,
      workspaceId: wsId,
      label: r.label,
      cadence: r.cadence,
      dayOfWeek: r.dayOfWeek,
      timeOfDay: r.timeOfDay,
      durationMinutes: r.durationMinutes,
      description: r.description,
      streak: 0,
      active: true,
    };
    store.createRitual({ entity: ritual, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 12. Budgets
  (proposal.budgets ?? []).forEach((b, i) => {
    const budget: Budget = {
      id: `bdg-${wsId}-${i}-${rand()}`,
      workspaceId: wsId,
      scope: "workspace",
      scopeId: wsId,
      scopeLabel: b.label,
      period: "month",
      capUsd: b.monthlyUsd,
      spentUsd: 0,
      warnThresholdPct: 80,
    };
    store.createBudget({ entity: budget, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // 13. 2 connector pre-attached (Claude + Gmail — Newsletter için defaults)
  // Bu sayede MATRIX_FLOW Step 4 (TrainStation) zaten kısmen dolu görünür.
  // Beehiiv/Substack TrainStation'da "Scout" panelinden kullanıcı tarafından
  // sonradan keşfedilip eklenir (eğitsel değer var).
  store.attachConnector("c-claude", wsId);
  store.attachConnector("c-gmail", wsId);

  // 14. Final macro celebration
  store.recordAction("workspace.onboarded", {
    workspaceId: wsId,
    forceBonus: true,
    meta: {
      mode: "demo",
      departments: proposal.departments.length,
      agents: proposal.agents.length,
      skills: proposal.skills.length,
      workflows: proposal.workflows.length,
    },
  });

  return { workspaceId: wsId };
}
