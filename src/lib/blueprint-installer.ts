"use client";

import {
  forgeAgent,
  forgeSkill,
  forgeWorkflow,
  type AgentIntent,
  type SkillIntent,
  type WorkflowIntent,
} from "./forge";
import type { Blueprint } from "./blueprints";
import type { useWorkspaceStore } from "./store";

type Store = ReturnType<typeof useWorkspaceStore.getState>;

export interface InstallProgress {
  step: "agents" | "skills" | "workflows" | "okrs" | "done";
  current: number;
  total: number;
  label: string;
}

export interface InstallResult {
  agentCount: number;
  skillCount: number;
  workflowCount: number;
  okrCount: number;
  durationMs: number;
}

/**
 * Install a blueprint into the current workspace.
 * Delays between steps so the UI can animate the progress bar.
 */
export async function installBlueprint(
  bp: Blueprint,
  workspaceId: string,
  store: Store,
  onProgress: (p: InstallProgress) => void,
  stepDelayMs = 60
): Promise<InstallResult> {
  const start = Date.now();

  // 0) Create departments first (so agents/workflows can attach)
  const deptIdByBpId = new Map<string, string>();
  bp.departments.forEach((d) => {
    const realId = `${d.id}-${Math.random().toString(36).slice(2, 6)}`;
    deptIdByBpId.set(d.id, realId);
    store.createDepartment({
      entity: {
        id: realId,
        workspaceId,
        name: d.name,
        description: d.description,
        owner: "Blueprint kurulumu",
        health: 75,
      },
      origin: "catalog",
      createdAt: new Date().toISOString(),
    });
  });

  const createdByName = new Map<string, string>(); // agent name → created agent id

  // 1) Agents
  for (let i = 0; i < bp.agents.length; i++) {
    const a = bp.agents[i];
    const intent: AgentIntent = {
      ...a.intent,
      departmentId: deptIdByBpId.get(a.deptId) || a.deptId,
    };
    const f = forgeAgent(intent, workspaceId);
    store.createAgent({
      entity: f.agent,
      origin: "catalog",
      createdAt: new Date().toISOString(),
      file: { path: f.relativePath, language: "markdown", content: f.markdown },
    });
    createdByName.set(intent.name, f.agent.id);
    onProgress({
      step: "agents",
      current: i + 1,
      total: bp.agents.length,
      label: f.agent.displayName,
    });
    if (stepDelayMs) await sleep(stepDelayMs);
  }

  // 2) Skills — hook to owner agent if created
  for (let i = 0; i < bp.skills.length; i++) {
    const s = bp.skills[i];
    const ownerId = createdByName.get(s.ownerAgentName) || "";
    const intent: SkillIntent = {
      ...(s.intent as SkillIntent),
      ownerAgentId: ownerId,
      ownerAgentName: s.ownerAgentName,
    };
    const f = forgeSkill(intent, workspaceId);
    store.createSkill({
      entity: f.skill,
      origin: "catalog",
      createdAt: new Date().toISOString(),
      file: { path: f.relativePath, language: "markdown", content: f.markdown },
    });
    onProgress({
      step: "skills",
      current: i + 1,
      total: bp.skills.length,
      label: f.skill.displayName,
    });
    if (stepDelayMs) await sleep(stepDelayMs);
  }

  // 3) Workflows
  for (let i = 0; i < bp.workflows.length; i++) {
    const w = bp.workflows[i];
    const intent: WorkflowIntent = {
      ...w.intent,
      departmentId: deptIdByBpId.get(w.deptId) || w.deptId,
    };
    const f = forgeWorkflow(intent, workspaceId);
    store.createWorkflow({
      entity: f.workflow,
      origin: "catalog",
      createdAt: new Date().toISOString(),
      file: { path: f.relativePath, language: "yaml", content: f.yaml },
    });
    onProgress({
      step: "workflows",
      current: i + 1,
      total: bp.workflows.length,
      label: f.workflow.name,
    });
    if (stepDelayMs) await sleep(stepDelayMs);
  }

  // 4) OKRs — real Goal entities, dropped into Goals & Orbits
  for (let i = 0; i < bp.okrs.length; i++) {
    const o = bp.okrs[i];
    const id = `goal-${bp.id}-${i}-${Math.random().toString(36).slice(2, 6)}`;
    // Seed with a realistic "35-55% progress" starting point + 12-week history
    const progressPct = 0.3 + Math.random() * 0.25;
    const current = o.invert
      ? o.target + (o.target * 0.9) * (1 - progressPct)
      : o.target * progressPct;
    const worstPoint = o.invert ? current * 1.4 : current * 0.15;
    const history: number[] = [];
    for (let h = 0; h < 12; h++) {
      const t = h / 11;
      history.push(worstPoint + (current - worstPoint) * t);
    }
    // Trajectory bias: blueprint-newborn goals start "at-risk" to encourage engagement
    const trajectory =
      progressPct >= 0.5
        ? "on-track"
        : progressPct >= 0.35
        ? "at-risk"
        : "off-track";

    store.createGoal(
      {
        entity: {
          id,
          workspaceId,
          title: o.title,
          metric: o.metric,
          target: o.target,
          current: Number(current.toFixed(1)),
          unit: o.unit,
          invert: o.invert,
          trajectory,
          cadence: "weekly",
          owner: "Blueprint kurulumu",
          linkedAgentIds: [],
          linkedSkillIds: [],
          linkedThemeIds: [],
          history: history.map((n) => Number(n.toFixed(2))),
        },
        origin: "catalog",
        createdAt: new Date().toISOString(),
      },
      bp.id
    );

    onProgress({
      step: "okrs",
      current: i + 1,
      total: bp.okrs.length,
      label: o.title,
    });
    if (stepDelayMs) await sleep(stepDelayMs);
  }

  onProgress({ step: "done", current: 1, total: 1, label: "Kurulum tamam" });

  return {
    agentCount: bp.agents.length,
    skillCount: bp.skills.length,
    workflowCount: bp.workflows.length,
    okrCount: bp.okrs.length,
    durationMs: Date.now() - start,
  };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
