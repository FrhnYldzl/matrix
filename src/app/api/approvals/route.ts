import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/approvals?workspaceId=&status=
 * The heart of external-send safety.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") ?? undefined;
    const status = (searchParams.get("status") ?? "PENDING") as
      | "PENDING"
      | "APPROVED"
      | "DENIED"
      | "EXPIRED";

    const approvals = await db.approval.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        status,
      },
      orderBy: { createdAt: "desc" },
      include: {
        workspace: { select: { name: true, slug: true, shortName: true } },
        reviewer: { select: { name: true, email: true } },
      },
    });
    return NextResponse.json({ approvals });
  } catch (error) {
    console.error("[api/approvals] GET failed:", error);
    return NextResponse.json({ error: "Sorgu başarısız" }, { status: 500 });
  }
}
