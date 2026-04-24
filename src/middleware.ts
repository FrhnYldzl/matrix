import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/auth";

/**
 * Matrix OS · auth middleware.
 *
 * Çalışma mantığı:
 *   1. Public path'ler serbest (login sayfası, auth API, static asset'ler)
 *   2. Her diğer path için session cookie doğrulanır
 *   3. Geçersiz/yoksa → /login'e redirect
 *
 * ÖNEMLI GEÇİŞ MODU:
 * Eğer MATRIX_SESSION_SECRET env değişkeni TANIMLI DEĞİLSE (dev veya
 * ilk Railway kurulum aşaması), middleware tamamen bypass geçer —
 * uygulamayı boot etmeden auth kurmak mümkün olsun. Production'da
 * MUHAKKAK env'e ekle.
 */

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/magic-link",
  "/api/auth/verify",
  "/api/auth/logout",
];

const PUBLIC_PREFIXES = ["/_next/", "/favicon", "/icon", "/public/"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Geçiş modu: secret yoksa auth devre dışı
  if (!process.env.MATRIX_SESSION_SECRET) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return redirectToLogin(req, pathname + search);
  }

  const session = await verifyToken(token, "session");
  if (!session) {
    return redirectToLogin(req, pathname + search);
  }

  // Valid session — pass through, attach user email for downstream
  const res = NextResponse.next();
  res.headers.set("x-matrix-user", session.email);
  return res;
}

function redirectToLogin(req: NextRequest, next: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Bütün route'ları yakala — public path kontrolü içeride
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
