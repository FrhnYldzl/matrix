/**
 * Matrix Orchestrator — runtime wrapper around Claude Agent SDK.
 *
 * Her ajan çağrısı buradan geçer:
 *   1. Kill switch kontrolü — armed ise hemen abort
 *   2. Cost budget preflight — workspace limiti aşılacaksa reddet
 *   3. Skill'in scopes'ı var mı? external-send varsa approval gate kur
 *   4. Claude SDK çağrısı (later: MCP tools inject)
 *   5. Audit event yaz (her başarılı/başarısız invocation)
 *   6. Cost entry yaz (input/output tokens × model fiyat)
 *
 * Bu sprint'te skeleton — gerçek SDK entegrasyonu B+1 sprint'te.
 */

import { db } from "@/lib/db";

export interface InvokeParams {
  workspaceId: string;
  agentId?: string;
  skillId?: string;
  workflowId?: string;
  input: Record<string, unknown>;
  triggerKind: "scheduled" | "webhook" | "manual" | "api";
  actorKindForAudit: "agent" | "skill" | "workflow" | "user";
  actorName: string;
}

export interface InvokeResult {
  runId: string;
  status: "SUCCESS" | "FAILED" | "AWAITING_APPROVAL" | "CANCELLED";
  output?: Record<string, unknown>;
  error?: string;
  totalCostUsd?: number;
}

export class OrchestratorError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "KILL_SWITCH_ARMED"
      | "BUDGET_EXCEEDED"
      | "AWAITING_APPROVAL"
      | "UNKNOWN"
  ) {
    super(message);
    this.name = "OrchestratorError";
  }
}

/**
 * Preflight check: kill switch + budget. Returns null if OK, else throws.
 */
async function preflightChecks(workspaceId: string): Promise<void> {
  const state = await db.systemState.findUnique({
    where: { id: "singleton" },
  });
  if (state?.killSwitchArmed) {
    throw new OrchestratorError(
      `Kill switch armed: ${state.killSwitchReason ?? "no reason"}`,
      "KILL_SWITCH_ARMED"
    );
  }

  // Basic budget check — monthly cap for this workspace
  const budgets = await db.budget.findMany({
    where: { workspaceId, scopeKind: "workspace" },
  });
  for (const b of budgets) {
    if (b.currentUsd >= b.monthlyLimitUsd) {
      throw new OrchestratorError(
        `Aylık bütçe ($${b.monthlyLimitUsd}) doldu`,
        "BUDGET_EXCEEDED"
      );
    }
  }
}

/**
 * Main invocation entry point.
 *
 * Gerçek Claude Agent SDK çağrısı ve MCP tool enjeksiyonu burada olacak.
 * Şu an skeleton: audit event yazar, mock bir output döndürür.
 */
export async function invoke(params: InvokeParams): Promise<InvokeResult> {
  const { workspaceId, agentId, workflowId, triggerKind, actorKindForAudit, actorName } = params;

  // Preflight
  try {
    await preflightChecks(workspaceId);
  } catch (e) {
    if (e instanceof OrchestratorError) {
      // Log but don't create a run record for killed invocations
      await db.auditEvent.create({
        data: {
          workspaceId,
          actorKind: actorKindForAudit,
          actorName,
          eventType: "agent.invoke.blocked",
          result: "fail",
          errorMessage: e.message,
        },
      });
      return { runId: "", status: "CANCELLED", error: e.message };
    }
    throw e;
  }

  // Create run record
  const run = await db.agentRun.create({
    data: {
      workspaceId,
      agentId,
      workflowId,
      triggerKind,
      status: "RUNNING",
    },
  });

  const started = Date.now();

  try {
    // ── Claude Agent SDK call goes here ──────────────────────────────────
    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // const response = await client.messages.create({ ... })
    //
    // For the skeleton we just simulate:
    const output = {
      message: `[skeleton] invocation ok · triggerKind=${triggerKind}`,
      echoInput: params.input as object,
    };

    await db.agentRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        output: output as object,
      },
    });

    await db.auditEvent.create({
      data: {
        workspaceId,
        actorKind: actorKindForAudit,
        actorName,
        eventType: "agent.invoke",
        result: "success",
        durationMs: Date.now() - started,
        traceId: run.traceId,
      },
    });

    return { runId: run.id, status: "SUCCESS", output };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    await db.agentRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage,
      },
    });
    await db.auditEvent.create({
      data: {
        workspaceId,
        actorKind: actorKindForAudit,
        actorName,
        eventType: "agent.invoke",
        result: "fail",
        durationMs: Date.now() - started,
        errorMessage,
        traceId: run.traceId,
      },
    });
    return { runId: run.id, status: "FAILED", error: errorMessage };
  }
}

/**
 * Gate: when a skill step has scope "external-send", we create a pending
 * Approval record and short-circuit the run to AWAITING_APPROVAL.
 *
 * Control Room UI polls this and presents to the founder/partner.
 */
export async function gateExternalSend(params: {
  runId: string;
  workspaceId: string;
  actorKind: string;
  actorName: string;
  actionLabel: string;
  actionBody: string;
  costEstimateUsd?: number;
  externalCount?: number;
}): Promise<{ approvalId: string }> {
  const approval = await db.approval.create({
    data: {
      workspaceId: params.workspaceId,
      actorKind: params.actorKind,
      actorName: params.actorName,
      actionLabel: params.actionLabel,
      actionBody: params.actionBody,
      costEstimateUsd: params.costEstimateUsd,
      externalCount: params.externalCount ?? 1,
      scope: "external-send",
      status: "PENDING",
    },
  });

  await db.agentRun.update({
    where: { id: params.runId },
    data: { status: "AWAITING_APPROVAL" },
  });

  return { approvalId: approval.id };
}
