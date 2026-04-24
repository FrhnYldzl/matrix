import { NextResponse } from "next/server";
import {
  isEmailAllowed,
  sendMagicLinkEmail,
  signToken,
  getAllowedEmails,
} from "@/lib/auth";

/**
 * POST /api/auth/magic-link
 * Body: { email }
 *
 * Returns 200 with channel info when link was dispatched.
 * Security: reveals whether email is allowlisted — acceptable for a private
 * holdco OS (no spam surface, only known partners).
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    if (getAllowedEmails().length === 0) {
      return NextResponse.json(
        {
          error:
            "MATRIX_ALLOWED_EMAILS env değişkeni tanımlanmamış. Railway Variables'a ekle.",
        },
        { status: 500 }
      );
    }

    if (!isEmailAllowed(normalized)) {
      return NextResponse.json(
        { error: "Bu e-posta Matrix allowlist'inde değil." },
        { status: 403 }
      );
    }

    // Generate short-lived magic token
    const token = await signToken({
      email: normalized,
      purpose: "magic",
    });

    // Build the verify URL
    const origin =
      req.headers.get("origin") ||
      req.headers.get("x-forwarded-host")
        ? `https://${req.headers.get("x-forwarded-host")}`
        : new URL(req.url).origin;
    const magicUrl = `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`;

    const result = await sendMagicLinkEmail({
      toEmail: normalized,
      magicUrl,
    });

    return NextResponse.json({
      ok: true,
      channel: result.channel,
    });
  } catch (e) {
    console.error("[api/auth/magic-link] failed:", e);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
