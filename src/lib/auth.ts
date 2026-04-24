/**
 * Matrix OS · Auth — private holdco email allowlist + signed session cookie.
 *
 * Edge-compatible (uses Web Crypto, no Node-only APIs). Zero external deps.
 *
 * Session cookie format: `<base64url-payload>.<base64url-hmac>`
 *   payload = { email, name, iat, exp }  (JSON)
 *   hmac    = HMAC-SHA256(payload, MATRIX_SESSION_SECRET)
 *
 * Magic-link token: same format, short-lived (15 min), single-use semantics
 * via `purpose: "magic"` claim.
 */

const COOKIE_NAME = "matrix_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAGIC_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface SessionPayload {
  email: string;
  name?: string;
  iat: number; // issued-at (ms)
  exp: number; // expires-at (ms)
  purpose: "session" | "magic";
}

// ───────────────────────────────────────────────────────────────────────────
// base64url helpers (Edge-compatible)
// ───────────────────────────────────────────────────────────────────────────

function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ───────────────────────────────────────────────────────────────────────────
// HMAC sign/verify
// ───────────────────────────────────────────────────────────────────────────

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const raw = enc.encode(secret).buffer as ArrayBuffer;
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const buf = new TextEncoder().encode(data).buffer as ArrayBuffer;
  const sig = await crypto.subtle.sign("HMAC", key, buf);
  return toBase64Url(sig);
}

async function hmacVerify(data: string, signatureB64: string, secret: string): Promise<boolean> {
  try {
    const key = await importKey(secret);
    const sigBuf = fromBase64Url(signatureB64).buffer as ArrayBuffer;
    const dataBuf = new TextEncoder().encode(data).buffer as ArrayBuffer;
    return await crypto.subtle.verify("HMAC", key, sigBuf, dataBuf);
  } catch {
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Token sign/verify
// ───────────────────────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.MATRIX_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "MATRIX_SESSION_SECRET missing or too short (min 16 chars). Set it in Railway Variables."
    );
  }
  return secret;
}

export async function signToken(
  payload: Omit<SessionPayload, "iat" | "exp" | "purpose"> & {
    purpose: "session" | "magic";
  }
): Promise<string> {
  const now = Date.now();
  const ttl = payload.purpose === "magic" ? MAGIC_TTL_MS : SESSION_TTL_MS;
  const full: SessionPayload = {
    email: payload.email.toLowerCase(),
    name: payload.name,
    iat: now,
    exp: now + ttl,
    purpose: payload.purpose,
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(full)));
  const sig = await hmacSign(body, getSecret());
  return `${body}.${sig}`;
}

export async function verifyToken(
  token: string,
  expectedPurpose: "session" | "magic"
): Promise<SessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const secret = process.env.MATRIX_SESSION_SECRET;
  if (!secret) return null;
  const ok = await hmacVerify(body, sig, secret);
  if (!ok) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (payload.purpose !== expectedPurpose) return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Allowlist check
// ───────────────────────────────────────────────────────────────────────────

export function getAllowedEmails(): string[] {
  const raw = process.env.MATRIX_ALLOWED_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string): boolean {
  return getAllowedEmails().includes(email.toLowerCase());
}

// ───────────────────────────────────────────────────────────────────────────
// Cookie helpers
// ───────────────────────────────────────────────────────────────────────────

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export function buildSessionCookie(token: string): string {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(): string {
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

// ───────────────────────────────────────────────────────────────────────────
// Magic-link email — Resend or console fallback
// ───────────────────────────────────────────────────────────────────────────

export async function sendMagicLinkEmail(params: {
  toEmail: string;
  toName?: string;
  magicUrl: string;
}): Promise<{ sent: boolean; channel: "resend" | "console" }> {
  const { toEmail, toName, magicUrl } = params;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MATRIX_EMAIL_FROM || "Matrix <onboarding@resend.dev>";

  // Fallback: log to console when Resend not configured (dev, first-time Railway)
  if (!apiKey) {
    console.log(
      `\n[matrix/auth] MAGIC LINK (RESEND_API_KEY not set — sending to console):\n` +
        `  for: ${toEmail}\n` +
        `  url: ${magicUrl}\n` +
        `  expires: 15 minutes\n`
    );
    return { sent: true, channel: "console" };
  }

  const html = `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #e5e7eb; background: #0a0a0f;">
  <div style="font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #6b7280; margin-bottom: 8px;">MATRIX · OPERATOR CONSOLE</div>
  <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px; color: #f9fafb;">Welcome${toName ? `, ${toName}` : ""}.</h1>
  <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin: 0 0 24px;">Bu bir kerelik, 15 dakika geçerli oturum bağlantın. Sadece bu cihazdan aç:</p>
  <a href="${magicUrl}" style="display: inline-block; padding: 12px 28px; background: #4db8ff; color: #0a0a0f; font-weight: 600; text-decoration: none; border-radius: 8px;">Matrix'e gir →</a>
  <p style="font-size: 12px; color: #6b7280; margin-top: 32px; font-family: ui-monospace, monospace;">Link: <a href="${magicUrl}" style="color: #4db8ff; word-break: break-all;">${magicUrl}</a></p>
  <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">
  <p style="font-size: 11px; color: #6b7280; font-style: italic;">"Welcome to the desert of the real." — Morpheus</p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [toEmail],
        subject: "Matrix · sign-in link",
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[matrix/auth] Resend failed:", res.status, body);
      return { sent: false, channel: "resend" };
    }
    return { sent: true, channel: "resend" };
  } catch (e) {
    console.error("[matrix/auth] Resend network error:", e);
    return { sent: false, channel: "resend" };
  }
}
