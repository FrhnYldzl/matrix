#!/usr/bin/env node
/**
 * Matrix OS · Railway start wrapper.
 *
 * 1. Prisma migrate deploy — if DATABASE_URL is set (graceful skip otherwise)
 * 2. Next.js production server on Railway-assigned $PORT (fallback 3000)
 *
 * Explicit -p $PORT ensures Railway's dynamic port allocation is honored
 * even if Next.js's PORT pickup changes across versions.
 */

const { spawnSync } = require("node:child_process");

const PORT = process.env.PORT || "3000";
const HOST = process.env.HOST || "0.0.0.0";

function run(cmd, args, opts = {}) {
  console.log(`[matrix/start] $ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...opts });
  return r.status === 0;
}

if (process.env.DATABASE_URL) {
  console.log("[matrix/start] DATABASE_URL found — running prisma migrate deploy");
  const ok = run("npx", ["prisma", "migrate", "deploy"]);
  if (!ok) {
    console.warn(
      "[matrix/start] migrate deploy failed — starting Next.js anyway; " +
        "check Railway DB connectivity and re-run migrate via `railway run npm run db:migrate:deploy`"
    );
  }
} else {
  console.warn(
    "[matrix/start] DATABASE_URL not set — skipping migrate. " +
      "Attach a Postgres plugin on Railway and redeploy to enable DB features. " +
      "Frontend will still be accessible."
  );
}

console.log(`[matrix/start] starting Next.js on ${HOST}:${PORT}`);
const ok = run("npx", ["next", "start", "-H", HOST, "-p", PORT]);
process.exit(ok ? 0 : 1);
