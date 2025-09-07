import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the PrismaClient instance.
// This prevents hot-reloading in development from creating too many instances.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new PrismaClient instance if one doesn't already exist.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ['query'],
  });

// If we're not in production, set the global prisma instance.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
