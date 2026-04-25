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
  const redirectUrl = new URL(next, url.origin);

  const res = NextResponse.redirect(redirectUrl);
  res.headers.set("Set-Cookie", buildSessionCookie(sessionToken));
  return res;
}

function redirectToLoginWithError(req: Request, reason: string): NextResponse {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}
