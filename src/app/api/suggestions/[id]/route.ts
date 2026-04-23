import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * PATCH /api/suggestions/:id
 * Body: { action: "accept" | "dismiss" }
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const { action } = await req.json();

    if (action !== "accept" && action !== "dismiss") {
      return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
    }

    const now = new Date();
    const suggestion = await db.suggestion.update({
      where: { id },
      data: {
        status: action === "accept" ? "ACCEPTED" : "DISMISSED",
        acceptedAt: action === "accept" ? now : null,
        dismissedAt: action === "dismiss" ? now : null,
      },
    });

    await db.auditEvent.create({
      data: {
        workspaceId: suggestion.workspaceId,
        actorKind: "user",
        actorName: "founder",
        eventType: `suggestion.${action}`,
        result: "success",
        payload: { suggestionId: id, title: suggestion.title } as object,
      },
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("[api/suggestions/[id]] PATCH failed:", error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
