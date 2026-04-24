import type { Edge, Node } from "@xyflow/react";
import { agents, departments, skills, workflows } from "@/lib/mock-data";
import type { Agent, Department, Skill, Workflow } from "@/lib/types";

// Layout constants (px)
const DEPT_PAD_X = 40;
const DEPT_PAD_TOP = 50;
const DEPT_PAD_BOTTOM = 40;
const DEPT_WIDTH = 880;
const DEPT_GAP_Y = 60;

const ROW_AGENT_Y = 20;
const ROW_SKILL_Y = 150;
const ROW_WORKFLOW_Y = 260;

const AGENT_GAP_X = 32;
const AGENT_WIDTH = 200;
const AGENT_HEIGHT = 96;

const SKILL_GAP_X = 24;
const SKILL_WIDTH = 180;
const SKILL_HEIGHT = 56;

const WF_GAP_X = 28;
const WF_WIDTH = 220;
const WF_HEIGHT = 78;

export interface OrgGraph {
  nodes: Node[];
  edges: Edge[];
}

export interface BuildExtras {
  extraAgents?: Agent[];
  extraSkills?: Skill[];
  extraWorkflows?: Workflow[];
  extraDepartments?: Department[];
}

export function buildOrgGraph(workspaceId: string, extras: BuildExtras = {}): OrgGraph {
  const wsDepartments: Department[] = [
    ...departments.filter((d) => d.workspaceId === workspaceId),
    ...(extras.extraDepartments || []).filter((d) => d.workspaceId === workspaceId),
  ];
  const wsAgents: Agent[] = [
    ...agents.filter((a) => a.workspaceId === workspaceId),
    ...(extras.extraAgents || []).filter((a) => a.workspaceId === workspaceId),
  ];
  const wsSkills: Skill[] = [
    ...skills.filter((s) => s.workspaceId === workspaceId),
    ...(extras.extraSkills || []).filter((s) => s.workspaceId === workspaceId),
  ];
  const wsWorkflows: Workflow[] = [
    ...workflows.filter((w) => w.workspaceId === workspaceId),
    ...(extras.extraWorkflows || []).filter((w) => w.workspaceId === workspaceId),
  ];

  // Defensive: create a synthetic "orphan" department for any agent/workflow
  // whose departmentId doesn't match a real department. This prevents
  // Org Studio crashes when newly-forged entities reference stale dept ids.
  const deptIdSet = new Set(wsDepartments.map((d) => d.id));
  const hasOrphans =
    wsAgents.some((a) => !deptIdSet.has(a.departmentId)) ||
    wsWorkflows.some((w) => !deptIdSet.has(w.departmentId));
  if (hasOrphans) {
    wsDepartments.push({
      id: `dept-orphan-${workspaceId}`,
      workspaceId,
      name: "Unassigned",
      description: "Henüz bir departmana atanmamış ajan / workflow'lar",
      owner: "—",
      health: 50,
    });
    const orphanId = `dept-orphan-${workspaceId}`;
    wsAgents.forEach((a) => {
      if (!deptIdSet.has(a.departmentId)) a.departmentId = orphanId;
    });
    wsWorkflows.forEach((w) => {
      if (!deptIdSet.has(w.departmentId)) w.departmentId = orphanId;
    });
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let yCursor = 0;

  wsDepartments.forEach((dept) => {
    const deptAgents = wsAgents.filter((a) => a.departmentId === dept.id);
    const deptAgentIds = new Set(deptAgents.map((a) => a.id));
    const deptSkills = wsSkills.filter((s) => deptAgentIds.has(s.ownerAgentId));
    const deptWorkflows = wsWorkflows.filter((w) => w.departmentId === dept.id);

    const rows = [
      deptAgents.length > 0 ? 1 : 0,
      deptSkills.length > 0 ? 1 : 0,
      deptWorkflows.length > 0 ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    const contentHeight = rows === 0
      ? 80
      : (deptAgents.length > 0 ? AGENT_HEIGHT : 0)
        + (deptSkills.length > 0 ? SKILL_HEIGHT + 30 : 0)
        + (deptWorkflows.length > 0 ? WF_HEIGHT + 30 : 0);

    const deptHeight = DEPT_PAD_TOP + contentHeight + DEPT_PAD_BOTTOM;

    // Department group node
    nodes.push({
      id: dept.id,
      type: "department",
      position: { x: 0, y: yCursor },
      data: { department: dept },
      style: { width: DEPT_WIDTH, height: deptHeight },
      selectable: true,
      draggable: false,
    });

    // Agents row
    deptAgents.forEach((a, i) => {
      nodes.push({
        id: a.id,
        type: "agent",
        parentId: dept.id,
        extent: "parent",
        position: {
          x: DEPT_PAD_X + i * (AGENT_WIDTH + AGENT_GAP_X),
          y: ROW_AGENT_Y,
        },
        data: { agent: a },
      });
    });

    // Skills row (under their owner agent where possible)
    const agentCenters = new Map<string, number>();
    deptAgents.forEach((a, i) => {
      agentCenters.set(a.id, DEPT_PAD_X + i * (AGENT_WIDTH + AGENT_GAP_X) + AGENT_WIDTH / 2);
    });

    // For overlap prevention, lay skills left-to-right, grouping by owner
    let skillX = DEPT_PAD_X;
    deptSkills.forEach((s) => {
      const ownerCenter = agentCenters.get(s.ownerAgentId);
      // Prefer to align under owner, clamp to not overlap prior skill
      const preferredX = ownerCenter ? ownerCenter - SKILL_WIDTH / 2 : skillX;
      const x = Math.max(skillX, preferredX);
      nodes.push({
        id: s.id,
        type: "skill",
        parentId: dept.id,
        extent: "parent",
        position: { x, y: ROW_SKILL_Y - (deptAgents.length === 0 ? AGENT_HEIGHT : 0) },
        data: { skill: s },
      });
      edges.push({
        id: `e-${s.ownerAgentId}-${s.id}`,
        source: s.ownerAgentId,
        target: s.id,
        type: "smoothstep",
        animated: false,
        style: { stroke: "var(--color-nebula)", strokeWidth: 1, strokeDasharray: "4 4" },
      });
      skillX = x + SKILL_WIDTH + SKILL_GAP_X;
    });

    // Workflow row
    deptWorkflows.forEach((w, i) => {
      const baseY = deptSkills.length > 0
        ? ROW_WORKFLOW_Y
        : deptAgents.length > 0
          ? ROW_SKILL_Y + 20
          : ROW_AGENT_Y;
      nodes.push({
        id: w.id,
        type: "workflow",
        parentId: dept.id,
        extent: "parent",
        position: {
          x: DEPT_PAD_X + i * (WF_WIDTH + WF_GAP_X),
          y: baseY,
        },
        data: { workflow: w },
      });
      // Edge from workflow to any department agent (conceptual trigger)
      const firstAgent = deptAgents[0];
      if (firstAgent) {
        edges.push({
          id: `e-${w.id}-${firstAgent.id}`,
          source: w.id,
          target: firstAgent.id,
          type: "smoothstep",
          animated: w.lastStatus === "running",
          style: { stroke: "var(--color-quantum)", strokeWidth: 1.25, strokeOpacity: 0.5 },
        });
      }
    });

    yCursor += deptHeight + DEPT_GAP_Y;
  });

  return { nodes, edges };
}
