import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const workspace = await db.workspace.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        strategicThemes: true,
        valueAnchors: true,
        departments: { include: { agents: true } },
        agents: true,
        skills: true,
        workflows: true,
        goals: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("[api/workspaces/[id]] GET failed:", error);
    return NextResponse.json({ error: "Sorgu başarısız" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const patch = await req.json();
    const workspace = await db.workspace.update({
      where: { id },
      data: patch,
    });

    await db.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorKind: "user",
        actorName: "founder",
        eventType: "workspace.patch",
        result: "success",
        payload: patch as object,
      },
    });
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("[api/workspaces/[id]] PATCH failed:", error);
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}
