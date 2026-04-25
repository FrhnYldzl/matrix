"use client";

/**
 * Asset Seeder — kullanıcı cevaplarına göre veya hazır demo şablonuyla
 * tek fonksiyonla 30+ entity'lik bir asset yaratır.
 *
 * İki ana giriş noktası:
 *   1. seedAssetFromAnswers(store, answers) — Conversational onboarding'ten
 *      gelen cevaplarla DİNAMİK asset
 *   2. seedDemoNewsletterAsset(store) — varsayılan Newsletter demo (legacy
 *      "Demo asset yükle" butonu için)
 */

import { generateProposal, type InterviewAnswers } from "./oracle-onboarding";
import { ASSET_TEMPLATES, type AssetTemplate } from "./asset-templates";
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

const rand = () => Math.random().toString(36).slice(2, 6);

// ───────────────────────────────────────────────────────────────────────────
// Conversational Onboarding answers (Oracle chat'ten gelir)
// ───────────────────────────────────────────────────────────────────────────

export interface OnboardingAnswers {
  /** Hangi asset türü — Newsletter / SaaS / E-commerce / Course / Affiliate / Custom */
  templateType: AssetTemplate["type"];
  /** Workspace adı — kullanıcının verdiği veya otomatik üretilen */
  workspaceName: string;
  /** Niş — "AI tools haberleri" gibi kısa metin */
  niche: string;
  /** Aylık gelir hedefi (USD) */
  monthlyRevenueTargetUsd: number;
  /** Hedefe kaç ayda ulaşma — varsayılan 6 */
  timelineMonths?: number;
  /** Haftalık saat bütçesi */
  weeklyHoursAvailable: number;
  /** Başlangıç sermayesi USD */
  startingCapitalUsd: number;
  /** Unique angle — "günlük 5dk briefing" gibi */
  uniqueAngle?: string;
  /** ID prefix — "ws-demo-" demo asset için, "ws-" gerçek için */
  isDemo?: boolean;
}

// ───────────────────────────────────────────────────────────────────────────
// Ana seeder — conversational answers'a göre asset yarat
// ───────────────────────────────────────────────────────────────────────────

export function seedAssetFromAnswers(
  store: StoreApi,
  answers: OnboardingAnswers
): { workspaceId: string } | null {
  const template = ASSET_TEMPLATES.find((t) => t.type === answers.templateType);
  if (!template) return null;

  // Workspace ID prefix — demo veya gerçek
  const idPrefix = answers.isDemo ? "ws-demo-" : "ws-";
  const slug = answers.workspaceName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  const wsId = `${idPrefix}${slug || "asset"}-${Date.now().toString(36)}`;

  // Short name — workspace adından 2-3 harf otomatik
  const shortName = (() => {
    const parts = answers.workspaceName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return answers.workspaceName.trim().slice(0, 2).toUpperCase() || "AS";
  })();

  // 1. Workspace yarat
  const workspace: Workspace = {
    id: wsId,
    name: answers.workspaceName,
    shortName,
    industry: template.defaultIndustry,
    mission: template.mission,
    vision: template.vision,
    strategicThemes: template.themes.map((t, i) => ({
      id: `st-${slug}-${i}`,
      label: t.label,
      description: t.description,
      weight: t.weight,
    })),
    valueAnchors: [
      {
        id: `va-${slug}-1`,
        label: "İnsan son kararı verir",
        description: "External-send scope'u her zaman onay gerektirir.",
      },
    ],
    accent: template.accent,
    createdAt: new Date().toISOString(),
  };

  store.createWorkspace(
    { entity: workspace, origin: "manual", createdAt: workspace.createdAt },
    answers.isDemo ? "demo-asset:auto" : "onboarding:conversational"
  );
  store.setWorkspace(wsId);

  // 2. Oracle proposal — dynamic answer'larla üret
  const interviewAnswers: InterviewAnswers = {
    monthlyRevenueTargetUsd: answers.monthlyRevenueTargetUsd,
    timelineMonths: answers.timelineMonths ?? 6,
    niche: answers.niche,
    weeklyHoursAvailable: answers.weeklyHoursAvailable,
    startingCapitalUsd: answers.startingCapitalUsd,
    uniqueAngle: answers.uniqueAngle,
  };
  const proposal = generateProposal(template, interviewAnswers);

  // 3. ID maps
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
  const sourceTag = answers.isDemo ? `demo-asset:${wsId}` : `onboarding:${wsId}`;

  // 4-12. Tüm entity'leri yaz (önceki seedDemoNewsletterAsset ile aynı pattern)

  // Departments
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

  // Agents
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

  // Skills
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

  // Workflows
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

  // Goals
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

  // Physical tasks
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
      tags: ["onboarding", "physical"],
      createdAtIso: nowIso,
      dueAtIso: dueIso,
      source: "oracle",
      estimatedMinutes: t.estimatedMinutes,
    };
    store.createOperatorTask({ entity: task, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // Quick wins
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
      tags: ["quick-win", `realm:${qw.realmHint}`],
      createdAtIso: nowIso,
      dueAtIso: new Date(Date.now() + 24 * 3600000).toISOString(),
      source: "oracle",
      estimatedMinutes: qw.estimatedMinutes,
    };
    store.createOperatorTask({ entity: task, origin: "oracle", createdAt: nowIso }, sourceTag);
  });

  // Rituals
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

  // Budgets
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

  // Default connector attaches — Claude her zaman, template-spec ek
  store.attachConnector("c-claude", wsId);
  if (template.type === "newsletter" || template.type === "podcast") {
    store.attachConnector("c-gmail", wsId);
  }

  // Macro celebration
  store.recordAction("workspace.onboarded", {
    workspaceId: wsId,
    forceBonus: true,
    meta: {
      mode: answers.isDemo ? "demo" : "conversational",
      template: answers.templateType,
      departments: proposal.departments.length,
      agents: proposal.agents.length,
      skills: proposal.skills.length,
      workflows: proposal.workflows.length,
    },
  });

  return { workspaceId: wsId };
}

// ───────────────────────────────────────────────────────────────────────────
// Legacy demo — sabit Newsletter cevaplarıyla çağırır
// (WorkspaceSwitcher'daki "Demo asset yükle" butonu için backward compat)
// ───────────────────────────────────────────────────────────────────────────

export function seedDemoNewsletterAsset(
  store: StoreApi
): { workspaceId: string } | null {
  return seedAssetFromAnswers(store, {
    templateType: "newsletter",
    workspaceName: "AI Matrix Newsletter · DEMO",
    niche: "AI tools & Matrix universe haberleri",
    monthlyRevenueTargetUsd: 5000,
    timelineMonths: 6,
    weeklyHoursAvailable: 10,
    startingCapitalUsd: 500,
    uniqueAngle: "Günlük 5 dakikada AI dünyasının özeti — Morpheus tonunda",
    isDemo: true,
  });
}
