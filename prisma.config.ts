/**
 * Prisma 7+ config — holds schema + migration settings.
 *
 * Uses pg adapter so schema.prisma doesn't need a `url` field anymore.
 * DATABASE_URL still comes from .env.local (dev) / Railway Variables (prod).
 */

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
