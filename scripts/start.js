#!/usr/bin/env node
/**
 * Matrix OS · Railway start wrapper.
 *
 * Runs:
 *   1. Prisma migrate deploy — BUT ONLY IF DATABASE_URL is set
 *      (Railway'e Postgres plugin eklenmemişse skip eder, Matrix yine ayağa kalkar)
 *   2. Next.js production server
 *
 * Böylece ilk deploy'da DB attach edilmeden önce bile frontend yaşar.
 * DB sonradan eklendiğinde migrate otomatik çalışır (sonraki restart'ta).
 */

const { spawnSync } = require("node:child_process");

function run(cmd, args, opts = {}) {
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

console.log("[matrix/start] starting Next.js production server");
const ok = run("npx", ["next", "start"]);
process.exit(ok ? 0 : 1);
