import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET  /api/system/kill-switch  — current state
 * POST /api/system/kill-switch  — body: { armed: boolean, reason?: string }
 *
 * When armed, ALL agent runtime invocations immediately abort. This is the
 * single most important safety primitive in Matrix.
 */
export async function GET() {
  const state = await db.systemState.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    killSwitchArmed: state?.killSwitchArmed ?? false,
    killSwitchReason: state?.killSwitchReason ?? null,
    killSwitchAt: state?.killSwitchAt ?? null,
  });
}

export async function POST(req: Request) {
  try {
    const { armed, reason } = await req.json();
    const state = await db.systemState.upsert({
      where: { id: "singleton" },
      update: {
        killSwitchArmed: !!armed,
        killSwitchReason: armed ? reason ?? null : null,
        killSwitchAt: armed ? new Date() : null,
      },
      create: {
        id: "singleton",
        killSwitchArmed: !!armed,
        killSwitchReason: armed ? reason ?? null : null,
        killSwitchAt: armed ? new Date() : null,
      },
    });
    return NextResponse.json({ state });
  } catch (error) {
    console.error("[api/kill-switch] POST failed:", error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
