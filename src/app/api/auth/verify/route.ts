import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  isEmailAllowed,
  signToken,
  verifyToken,
} from "@/lib/auth";

/**
 * GET /api/auth/verify?token=<magic>
 *
 * Flow:
 *   1. Magic token'ı verify et (imza + exp + purpose)
 *   2. Email hâlâ allowlist'te mi kontrol et (belki partner çıkarıldı)
 *   3. 7-günlük session token'ı imzala
 *   4. HttpOnly signed cookie set et
 *   5. / ana sayfaya redirect
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return redirectToLoginWithError(req, "missing-token");
  }

  const magicPayload = await verifyToken(token, "magic");
  if (!magicPayload) {
    return redirectToLoginWithError(req, "invalid-or-expired");
  }

  // Re-check allowlist (partner rotation could've happened since link was sent)
  if (!isEmailAllowed(magicPayload.email)) {
    return redirectToLoginWithError(req, "not-allowed");
  }

  const sessionToken = await signToken({
    email: magicPayload.email,
    name: magicPayload.name,
    purpose: "session",
  });

  // Login başarılı → app'in içine (Command Deck) götür. Public landing "/"'e
  // değil — kullanıcı zaten içeride, çalışmaya başlasın.
  const next = url.searchParams.get("next") || "/dashboard";
  // Production URL'i Railway proxy header'larından çıkar — url.origin
  // 0.0.0.0:8080 olabilir (Next.js'in iç bind adresi).
  const publicOrigin = resolvePublicOrigin(req);
  const redirectUrl = new URL(next, publicOrigin);

  const res = NextResponse.redirect(redirectUrl);
  res.headers.set("Set-Cookie", buildSessionCookie(sessionToken));
  return res;
}

function resolvePublicOrigin(req: Request): string {
  const manual =
    process.env.MATRIX_PUBLIC_URL ||
    process.env.VIBE_BUSINESS_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  if (manual) return manual.replace(/\/$/, "");
  const originHeader = req.headers.get("origin");
  if (originHeader) return originHeader.replace(/\/$/, "");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  const host = req.headers.get("host");
  if (host) {
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.");
    return `${isLocalhost ? "http" : "https"}://${host}`;
  }
  return new URL(req.url).origin;
}

function redirectToLoginWithError(req: Request, reason: string): NextResponse {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}
