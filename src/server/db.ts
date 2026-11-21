import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalDb = globalThis as typeof globalThis & { natilumeDb?: PrismaClient };

export function getDb() {
  if (globalDb.natilumeDb) return globalDb.natilumeDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Configure DATABASE_URL.");
  const max = Number(process.env.DATABASE_POOL_SIZE ?? "5");
  if (!Number.isSafeInteger(max) || max < 1) throw new Error("DATABASE_POOL_SIZE inválido.");

  const adapter = new PrismaPg({ connectionString, max, connectionTimeoutMillis: 5_000 });
  globalDb.natilumeDb = new PrismaClient({ adapter });
  return globalDb.natilumeDb;
}
