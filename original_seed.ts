import { PrismaClient, Role } from "@prisma/client";
import { prisma as sharedClient } from "@/lib/prisma";

/**
 * SEED SCRIPT
 * Uses the application's Prisma singleton to avoid connection pool leaks.
 */

export async function cleanupDatabase(prismaInstance?: PrismaClient) {
  const prisma = prismaInstance || sharedClient;
  console.log("🧹 Starting database cleanup...");

  // Break circular dependencies first to avoid foreign key constraints
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE Post SET nextId = NULL, previousId = NULL`,
    );
  } catch (e) {}

  const deletionOrder = [
    "Notification",
    "Bookmark",
    "Comment",
    "Fact",
    "Faq",
    "PlatformFeature",
    "Post",
    "Comparison",
    "Feature",
    "NewsArticle",
    "EmailRecipient",
    "EmailCampaign",
    "ContactMessage",
    "Subscription",
    "ForumPost",
    "ForumTopic",
    "FeatureCategory",
    "ComparisonCategory",
    "PostCategory",
    "ForumCategory",
    "Image",
    "SiteContent",
    "Tool",
    "User",
    "Account",
    "Session",
    "VerificationToken",
  ];

  // Execute deletions sequentially to respect remaining constraints
  for (const model of deletionOrder) {
    try {
      if ((prisma as any)[model]?.deleteMany) {
        await (prisma as any)[model].deleteMany({});
      }
    } catch (e) {
      console.warn(
        `⚠️ Warning: Could not clean model ${model}:`,
        e instanceof Error ? e.message : e,
      );
    }
  }

  console.log("✅ Database cleanup complete.");
}

async function main(prismaInstance?: PrismaClient, skipCleanup = false) {
  const prisma = prismaInstance || sharedClient;
  console.log("🌱 Starting database seeding...");

  if (!skipCleanup) {
    await cleanupDatabase(prisma);
  }

  // --- 1. Seed Users ---
  const adminEmail = "mafzalbro@gmail.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Afzal Creator",
      email: adminEmail,
      role: Role.ADMIN,
      onboarded: true,
      newsletter: true,
    },
  });

  // --- 2. Feature Categories & Features ---
  const categoriesData = [
    {
      name: "LMS Core",
      features: ["Course Builder", "Video Hosting", "Content Dripping"],
    },
    {
      name: "Marketing",
      features: ["Funnels", "Email Marketing", "Affiliate System"],
    },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.featureCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    for (const fName of cat.features) {
      await prisma.feature.upsert({
        where: { id: `feat-${fName.toLowerCase().replace(/\s+/g, "-")}` },
        update: { name: fName, categoryId: category.id },
        create: {
          id: `feat-${fName.toLowerCase().replace(/\s+/g, "-")}`,
          name: fName,
          categoryId: category.id,
        },
      });
    }
  }

  // --- 3. Sync Uploads ---
  console.log("\n🖼️ Syncing public/uploads to Image gallery...");
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter((f) =>
      /\.(jpe?g|png|gif|webp|svg)$/i.test(f),
    );
    for (const filename of imageFiles) {
      const existing = await prisma.image.findFirst({ where: { filename } });
      if (!existing) {
        const stats = await fs.stat(path.join(uploadsDir, filename));
        await prisma.image.create({
          data: {
            filename,
            url: `/uploads/${filename}`,
            altText: filename.split(".")[0].replace(/[-_]/g, " "),
            size: stats.size,
            authorId: admin.id,
          },
        });
      }
    }
  } catch (e) {}

  console.log("\n🎉 Seeding finished successfully!");
}

export const seed = async (skipCleanup = false) => {
  try {
    await main(sharedClient, skipCleanup);
  } catch (e) {
    console.error("❌ Seed failed:", e);
  }
  // No $disconnect here to prevent closing the shared pool in development
};

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed().then(() => {
    // Only disconnect if running as a standalone script
    sharedClient.$disconnect();
    process.exit(0);
  });
}
