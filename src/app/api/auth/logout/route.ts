import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.headers.set("Set-Cookie", clearSessionCookie());
  return res;
}

// Also allow GET for direct link ("sign out" in UI)
export async function GET(req: Request) {
  return POST(req);
}
