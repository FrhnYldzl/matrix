import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/approvals/:id/decide
 * Body: { decision: "approve" | "deny", reviewerEmail, reason? }
 *
 * This is THE safety gate. Every external-send action funnels through here.
 * Nothing — not even Matrix itself — bypasses a human signature on outbound
 * touches to the real world.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const { decision, reviewerEmail, reason } = await req.json();

    if (decision !== "approve" && decision !== "deny") {
      return NextResponse.json({ error: "Geçersiz decision" }, { status: 400 });
    }

    const reviewer = reviewerEmail
      ? await db.user.findUnique({ where: { email: reviewerEmail } })
      : null;

    const approval = await db.approval.update({
      where: { id },
      data: {
        status: decision === "approve" ? "APPROVED" : "DENIED",
        reviewerId: reviewer?.id,
        decidedAt: new Date(),
        reason,
      },
    });

    await db.auditEvent.create({
      data: {
        workspaceId: approval.workspaceId,
        actorKind: "user",
        actorName: reviewer?.name ?? "unknown",
        eventType: `approval.${decision}`,
        result: "success",
        payload: { approvalId: id, reason } as object,
      },
    });

    // TODO(B.5): when approved, push the action onto BullMQ queue to execute
    // the originating agent's pending step. For now we just mark the flag.

    return NextResponse.json({ approval });
  } catch (error) {
    console.error("[api/approvals/decide] failed:", error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
