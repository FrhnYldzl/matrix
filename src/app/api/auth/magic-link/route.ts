import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  isEmailAllowed,
  signToken,
  getAllowedEmails,
} from "@/lib/auth";

/**
 * POST /api/auth/magic-link
 * Body: { email }
 *
 * SADELEŞTİRİLMİŞ AKIŞ (Ferhan: "magic link işi karıştırıyor, kaldır"):
 *   - Email allowlist'te ise → DOĞRUDAN 7-günlük session cookie SET
 *   - Response: { ok: true, redirect: "/dashboard" }
 *   - LoginForm bu redirect'i window.location.href ile takip eder
 *   - Magic-link tıklama adımı YOK (Resend dependency yok)
 *
 * Allowlist hâlâ aktif — yetkisiz email giriş yapamaz.
 * İleride 2FA isterse `purpose: "magic"` flow'una geri dönülebilir.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    if (getAllowedEmails().length === 0) {
      console.error(
        "[auth] MATRIX_ALLOWED_EMAILS not set — login attempted but blocked"
      );
      return NextResponse.json(
        {
          error: "Sistem henüz partner allowlist'i ile yapılandırılmadı.",
        },
        { status: 503 }
      );
    }

    if (!isEmailAllowed(normalized)) {
      return NextResponse.json(
        { error: "Bu e-posta Matrix allowlist'inde değil." },
        { status: 403 }
      );
    }

    // Direct session — magic-link adımı atlandı
    const sessionToken = await signToken({
      email: normalized,
      purpose: "session",
    });

    const res = NextResponse.json({
      ok: true,
      redirect: "/dashboard",
    });
    res.headers.set("Set-Cookie", buildSessionCookie(sessionToken));
    return res;
  } catch (e) {
    console.error("[api/auth/magic-link] failed:", e);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

// resolvePublicOrigin kaldırıldı — artık magic-link tıklama yok, direct
// session set ediyoruz. Redirect URL relative ("/dashboard") — frontend
// window.location ile takip eder, origin sorununa düşmez.
