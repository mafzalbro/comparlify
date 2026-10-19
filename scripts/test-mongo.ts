import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectDb() {
  console.log("Connecting to MongoDB via Prisma...");
  try {
    const siteContentCount = await prisma.siteContent.count();
    console.log("SiteContent count:", siteContentCount);
    const siteContents = await prisma.siteContent.findMany({ take: 30 });
    console.log("Sample SiteContents:", siteContents);

    const comparisonsCount = await prisma.comparison.count();
    console.log("Comparisons count:", comparisonsCount);

    const postsCount = await prisma.post.count();
    console.log("Posts count:", postsCount);

    const platformsCount = await prisma.platform.count();
    console.log("Platforms count:", platformsCount);

    const adsCount = await prisma.advertisement.count();
    console.log("Advertisements count:", adsCount);

    const usersCount = await prisma.user.count();
    console.log("Users count:", usersCount);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDb();
