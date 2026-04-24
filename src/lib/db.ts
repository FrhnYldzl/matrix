/**
 * Prisma client singleton.
 *
 * Next.js'in HMR'ı dev mode'da modülleri yeniden yükler; her reload'da yeni
 * PrismaClient instance'ı yaratmak connection exhaustion'a yol açar. Bu
 * singleton pattern onu engeller.
 *
 * DATABASE_URL yoksa (örn. Railway'de Postgres plugin henüz eklenmedi)
 * Prisma Client lazy olarak instantiate edilir — ilk query atıldığında
 * anlamlı bir hata fırlatır, modül import'unda değil. Böylece frontend
 * DB olmadan da ayağa kalkar.
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
 * True when a DATABASE_URL is configured at runtime — API routes can
 * short-circuit to a friendly 503 if false.
 */
export const isDatabaseConnected = !!process.env.DATABASE_URL;
