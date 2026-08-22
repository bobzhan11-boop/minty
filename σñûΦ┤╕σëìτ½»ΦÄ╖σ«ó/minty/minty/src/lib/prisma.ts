import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Reuse a single PrismaClient across hot reloads in dev to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const log: ("error" | "warn")[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  // Production: Turso (libSQL) via the Prisma driver adapter, when configured.
  if (process.env.TURSO_DATABASE_URL) {
    const adapter = new PrismaLibSQL(
      createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    );
    return new PrismaClient({ adapter, log });
  }

  // Local dev: the SQLite file at DATABASE_URL.
  return new PrismaClient({ log });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
