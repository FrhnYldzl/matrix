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

    // Build the verify URL — Railway proxy header'larını doğru parse et
    // Eski kod operator precedence yüzünden 0.0.0.0:8080'e fallback yapıyordu
    const origin = resolvePublicOrigin(req);
    const magicUrl = `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`;

    const result = await sendMagicLinkEmail({
      toEmail: normalized,
      magicUrl,
    });

    // RESEND_API_KEY yoksa magic URL'i direkt response'da döndür — kullanıcı
    // login form'da göreceği link'e tıklayıp girer. Bu bypass DEĞİL: email
    // hâlâ allowlist'te olmalı, token yine 15 dk'da expire olur.
    // Production'da RESEND_API_KEY ekleyince bu URL response'da gelmez.
    return NextResponse.json({
      ok: true,
      channel: result.channel,
      ...(result.channel === "console" && { devMagicUrl: magicUrl }),
    });
  } catch (e) {
    console.error("[api/auth/magic-link] failed:", e);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

/**
 * Production URL detection — Railway behind a reverse proxy bind ediyor
 * 0.0.0.0:8080'e ama dış dünyadan https://matrix-production-*.railway.app
 * geliyor. x-forwarded-host + x-forwarded-proto header'larıyla doğru
 * URL'i çıkar. NEXT_PUBLIC_APP_URL fallback olarak da var (manuel override).
 */
function resolvePublicOrigin(req: Request): string {
  // 1. Manuel override (en güvenilir, prod için kesin)
  const manual =
    process.env.MATRIX_PUBLIC_URL ||
    process.env.VIBE_BUSINESS_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  if (manual) return manual.replace(/\/$/, "");

  // 2. Browser'dan gelen origin header (en doğru)
  const originHeader = req.headers.get("origin");
  if (originHeader) return originHeader.replace(/\/$/, "");

  // 3. Railway/Vercel proxy header'ları
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  // 4. Standart Host header (proxy yoksa)
  const host = req.headers.get("host");
  if (host) {
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.");
    return `${isLocalhost ? "http" : "https"}://${host}`;
  }

  // 5. Son çare — req.url'den parse (en zayıf, 0.0.0.0 olabilir)
  return new URL(req.url).origin;
}
