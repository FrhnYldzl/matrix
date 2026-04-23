import type { Edge, Node } from "@xyflow/react";
import type { Workflow, WorkflowStep, WorkflowTrigger } from "@/lib/types";

const CENTER_X = 120;
const TRIGGER_Y = 0;
const STEP_START_Y = 170;
const STEP_GAP_Y = 140;

function defaultTrigger(wf: Workflow): WorkflowTrigger {
  if (wf.trigger) return wf.trigger;
  if (wf.cadence.toLowerCase().includes("webhook"))
    return { kind: "webhook", webhookPath: `/hooks/${wf.name}` };
  if (wf.cadence.toLowerCase().includes("manuel"))
    return { kind: "manual" };
  return { kind: "schedule", cron: "0 9 * * 1-5", timezone: "Europe/Istanbul" };
}

function defaultSteps(wf: Workflow): WorkflowStep[] {
  if (wf.stepsDetail && wf.stepsDetail.length > 0) return wf.stepsDetail;
  const n = Math.max(wf.steps, 1);
  const arr: WorkflowStep[] = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      id: `s${i + 1}`,
      kind: i === n - 1 ? "notify" : "skill",
      label: i === n - 1 ? "Sonucu teslim et" : `Adım ${i + 1}`,
    });
  }
  return arr;
}

export function buildWorkflowGraph(wf: Workflow): { nodes: Node[]; edges: Edge[] } {
  const trigger = defaultTrigger(wf);
  const steps = defaultSteps(wf);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Trigger
  nodes.push({
    id: "trigger",
    type: "trigger",
    position: { x: CENTER_X, y: TRIGGER_Y },
    data: { trigger },
    draggable: true,
  });

  // Steps
  let lastId = "trigger";
  steps.forEach((step, i) => {
    const nid = `step-${step.id}`;
    nodes.push({
      id: nid,
      type: "step",
      position: { x: CENTER_X, y: STEP_START_Y + i * STEP_GAP_Y },
      data: { step, index: i },
      draggable: true,
    });
    edges.push({
      id: `e-${lastId}-${nid}`,
      source: lastId,
      target: nid,
      type: "smoothstep",
      animated: wf.lastStatus === "running",
      style: { stroke: "var(--color-border-strong)", strokeWidth: 1.5 },
    });
    lastId = nid;
  });

  return { nodes, edges };
}
