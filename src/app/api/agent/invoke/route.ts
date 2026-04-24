import { NextResponse } from "next/server";
import { invoke, OrchestratorError } from "@/lib/agent/orchestrator";

/**
 * POST /api/agent/invoke
 * Body: {
 *   workspaceId, agentId?, skillId?, workflowId?, input, triggerKind,
 *   actorName
 * }
 *
 * Main entry point for any Matrix-driven execution.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await invoke({
      workspaceId: body.workspaceId,
      agentId: body.agentId,
      skillId: body.skillId,
      workflowId: body.workflowId,
      input: body.input ?? {},
      userPrompt: body.userPrompt,
      systemPrompt: body.systemPrompt,
      model: body.model,
      triggerKind: body.triggerKind ?? "api",
      actorKindForAudit: body.agentId
        ? "agent"
        : body.workflowId
        ? "workflow"
        : body.skillId
        ? "skill"
        : "user",
      actorName: body.actorName ?? "anonymous",
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof OrchestratorError) {
      return NextResponse.json(
        { error: e.message, code: e.code },
        { status: e.code === "KILL_SWITCH_ARMED" ? 423 : 402 }
      );
    }
    console.error("[api/agent/invoke] failed:", e);
    return NextResponse.json({ error: "Çağrı başarısız" }, { status: 500 });
  }
}
