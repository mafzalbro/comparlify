import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton for Next.js (Prisma v6)
 * 
 * Ensures only one instance of the client is used, even across HMR reloads in development.
 * This prevents "pool timeout" errors caused by exhausting database connections.
 */

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }
  
  return new PrismaClient({
    // Minimal logging to keep the console clean while catching errors
    log: ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prismaGlobal: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}

export default prisma;
