import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/suggestions?workspaceId=&status=OPEN
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") ?? undefined;
    const status = (searchParams.get("status") ?? "OPEN") as
      | "OPEN"
      | "ACCEPTED"
      | "DISMISSED";

    const suggestions = await db.suggestion.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        status,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[api/suggestions] GET failed:", error);
    return NextResponse.json({ error: "Sorgu başarısız" }, { status: 500 });
  }
}
