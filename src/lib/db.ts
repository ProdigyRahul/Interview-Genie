import { PrismaClient, type Prisma } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

type ExtendedPrismaClient = PrismaClient & {
  $on: <T extends Prisma.PrismaClientOptions["log"]>(
    eventType: T extends Array<infer E> ? E : never,
    callback: (event: Prisma.QueryEvent) => void | Promise<void>
  ) => void;
};

const globalForPrisma = global as { cachedPrisma?: PrismaClient };

let prisma: ExtendedPrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"],
  }) as ExtendedPrismaClient;
} else {
  if (!globalForPrisma.cachedPrisma) {
    globalForPrisma.cachedPrisma = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
        "error",
        "warn",
      ],
    });
  }
  prisma = globalForPrisma.cachedPrisma as ExtendedPrismaClient;

  // Log slow queries in development
  prisma.$on("query", async (e: Prisma.QueryEvent) => {
    if (e.duration >= 100) { // Log queries that take more than 100ms
      console.warn("Slow query detected:", {
        query: e.query,
        duration: e.duration,
        timestamp: e.timestamp,
      });
    }
  });
}

export const db = prisma; 