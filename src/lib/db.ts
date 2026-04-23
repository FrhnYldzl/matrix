/**
 * Prisma client singleton.
 *
 * Next.js'in HMR'ı dev mode'da modülleri yeniden yükler; her reload'da yeni
 * PrismaClient instance'ı yaratmak connection exhaustion'a yol açar. Bu
 * singleton pattern onu engeller.
 *
 * Usage:
 *   import { db } from "@/lib/db";
 *   const ws = await db.workspace.findMany();
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * Bool flag to know whether we're running against a real DB or fallback to
 * in-memory mock data. Used by pages to decide rendering strategy while we're
 * in the transition phase (C sprint → B sprint ramp-up).
 */
export const isDatabaseConnected = !!process.env.DATABASE_URL;
