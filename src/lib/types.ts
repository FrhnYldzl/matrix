export type Scope = "read" | "write" | "external-send";

export type AgentStatus = "live" | "idle" | "paused" | "error";

export interface StrategicTheme {
  id: string;
  label: string;
  description: string;
  weight: number; // 0-100, how central this theme is
}

export interface ValueAnchor {
  id: string;
  label: string;
  description: string;
}

export interface Workspace {
  id: string;
  name: string;
  shortName: string;
  industry: string;
  mission: string;
  vision: string;
  strategicThemes: StrategicTheme[];
  valueAnchors: ValueAnchor[];
  accent: "ion" | "nebula" | "quantum" | "solar";
  createdAt: string;
}

export interface Department {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  owner: string;
  health: number; // 0-100
}

export interface Agent {
  id: string;
  workspaceId: string;
  departmentId: string;
  name: string;
  displayName: string;
  description: string;
  model: "opus" | "sonnet" | "haiku";
  status: AgentStatus;
  scopes: Scope[];
  skillIds: string[];
  callsToday: number;
  successRate: number;
}

export interface Skill {
  id: string;
  workspaceId: string;
  ownerAgentId: string;
  name: string;
  displayName: string;
  triggers: string[];
  description: string;
  runsThisWeek: number;
  goldenTestPassing: boolean;
}

export type WorkflowStepKind =
  | "trigger"
  | "skill"
  | "integration"
  | "approval"
  | "notify"
  | "condition";

export interface WorkflowStep {
  id: string;
  kind: WorkflowStepKind;
  label: string;
  /** skill id or name when kind === "skill" */
  skillRef?: string;
  /** LLM model id (from llm-catalog) pinned for this skill invocation */
  modelRef?: string;
  /** fallback chain — tried in order if primary fails / times out / exceeds budget */
  modelFallback?: string[];
  /** integration name when kind === "integration" (e.g. ccxt, github) */
  integration?: string;
  /** notify channel when kind === "notify" */
  channel?: "slack" | "notion" | "email" | "webhook";
  /** destination — slack channel, notion db, email address */
  target?: string;
  /** optional human note */
  note?: string;
}

export interface WorkflowTrigger {
  kind: "schedule" | "webhook" | "manual";
  cron?: string;
  timezone?: string;
  webhookPath?: string;
}

export interface Workflow {
  id: string;
  workspaceId: string;
  departmentId: string;
  name: string;
  cadence: string;
  nextRun: string;
  lastStatus: "success" | "running" | "pending-approval" | "failed";
  steps: number;
  /** detailed step graph — optional; when missing, Canvas auto-scaffolds */
  trigger?: WorkflowTrigger;
  stepsDetail?: WorkflowStep[];
  description?: string;
}

export interface Goal {
  id: string;
  workspaceId: string;
  title: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  /** whether lower-is-better (error rate, burn rate) — defaults to false */
  invert?: boolean;
  trajectory: "ahead" | "on-track" | "at-risk" | "off-track";
  linkedAgentIds: string[];
  linkedSkillIds: string[];
  linkedThemeIds?: string[];
  /** last 12 weekly snapshots (oldest → newest) */
  history?: number[];
  owner?: string;
  cadence?: "weekly" | "monthly" | "quarterly";
}

export type OracleKind = "gap" | "strategy" | "ops" | "risk";

export interface OracleSuggestion {
  id: string;
  workspaceId: string;
  kind: OracleKind;
  title: string;
  rationale: string;
  target: string; // "Add skill", "Add agent", "New workflow", "Adjust strategy"
  priority: "high" | "medium" | "low";
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  workspaceId: string;
  at: string; // ISO
  actor: string;
  verb: string;
  object: string;
  status: "ok" | "waiting" | "failed";
}

export type ApprovalChannel = "gmail" | "slack" | "sms" | "transfer" | "webhook";

export interface ApprovalItem {
  id: string;
  workspaceId: string;
  agent: string; // agent name
  channel: ApprovalChannel;
  title: string;
  preview: string;
  recipient: string;
  createdAt: string;
  priority: "high" | "medium" | "low";
}

export interface AuditEvent {
  id: string;
  workspaceId: string;
  at: string;
  actor: string; // agent name or "oracle", "system"
  action: string; // "skill.run" | "task.delegate" | "workflow.run" | ...
  target: string;
  result: "ok" | "warn" | "fail";
  durationMs?: number;
  tokens?: number;
  traceId?: string;
}
