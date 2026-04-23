import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/workspaces
 * Returns all workspaces (= all digital assets in the Matrix portfolio).
 */
export async function GET() {
  try {
    const workspaces = await db.workspace.findMany({
      include: {
        _count: {
          select: {
            agents: true,
            skills: true,
            workflows: true,
            goals: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("[api/workspaces] GET failed:", error);
    return NextResponse.json(
      { error: "Workspaces sorgusu başarısız" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Creates a new workspace (= adds a new digital asset to the portfolio).
 * Body: { slug, name, shortName, industry, mission?, vision?, accent? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, name, shortName, industry, mission, vision, accent } = body;

    if (!slug || !name || !shortName || !industry) {
      return NextResponse.json(
        { error: "slug, name, shortName ve industry zorunlu" },
        { status: 400 }
      );
    }

    const workspace = await db.workspace.create({
      data: { slug, name, shortName, industry, mission, vision, accent },
    });

    // Log creation in audit
    await db.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorKind: "user",
        actorName: "founder",
        eventType: "workspace.create",
        result: "success",
        payload: { slug, name } as object,
      },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("[api/workspaces] POST failed:", error);
    return NextResponse.json(
      { error: "Workspace oluşturulamadı" },
      { status: 500 }
    );
  }
}
