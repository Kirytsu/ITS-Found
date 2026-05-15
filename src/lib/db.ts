/**
 * src/lib/db.ts
 * Prisma Client singleton — prevents multiple instances in development
 * (Next.js hot-reload creates new module instances each time).
 * Uses better-sqlite3 driver adapter required by Prisma 7.
 */
import { PrismaClient } from "../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
};

// Extend globalThis type to hold our singleton
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db =
  globalForPrisma.prisma ?? createPrismaClient();

// In development, store the client on globalThis to survive hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
