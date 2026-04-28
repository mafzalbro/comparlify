import {
  PrismaClient,
  Role,
  ContentType,
  CommentStatus,
  Post,
} from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import { syncComparisonData } from "../src/compare/sync";
import { promises as fs } from "fs";
import path from "path";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

export async function cleanupDatabase() {
  console.log("🧹 Starting database cleanup...");

  const models = Object.keys(prisma).filter(
    (key) =>
      !key.startsWith("_") &&
      !key.endsWith("Delegate") &&
      typeof (prisma as any)[key].deleteMany === "function",
  );

  console.log("  - Breaking Post navigation links...");
  try {
    await prisma.$executeRawUnsafe(`UPDATE Post SET nextId = NULL, previousId = NULL`);
  } catch (e: any) {
    console.warn(`  - Could not break Post links: ${e.message}`);
  }

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
    "PricingTier",
    "Platform",
    "User",
    "Account",
    "Session",
    "VerificationToken",
  ];

  const remainingModels = models.filter((m) => !deletionOrder.includes(m));
  const finalDeletionOrder = [...deletionOrder, ...remainingModels];

  for (const model of finalDeletionOrder) {
    try {
      if ((prisma as any)[model]?.deleteMany) {
        const { count } = await (prisma as any)[model].deleteMany({});
        if (count > 0) {
          console.log(`  🔥 Deleted ${count} records from ${model}`);
        }
      }
    } catch (e: any) {
      if (e.code !== "P2025") {
        console.warn(`  - Could not delete from ${model}: ${e.message}`);
      }
    }
  }

  console.log("✅ Database cleanup complete.");
}

async function main(skipCleanup = false) {
  console.log("🌱 Starting database seeding...");

  if (!skipCleanup) {
    await cleanupDatabase();
  }

  // 1. Seed Users
  console.log("\n👤 Seeding Users...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Afzal Creator",
      email: "mafzalbro@gmail.com",
      role: Role.ADMIN,
      onboarded: true,
      newsletter: true,
    },
  });

  const bobUser = await prisma.user.create({
    data: {
      name: "Bob Builder",
      email: "maf415415@gmail.com",
      role: Role.AUTHOR,
      onboarded: false,
      newsletter: true,
    },
  });

  const charlieUser = await prisma.user.create({
    data: {
      name: "Charlie User",
      email: "ma4156250@gmail.com",
      role: Role.USER,
      onboarded: false,
      newsletter: false,
    },
  });

  // 2. Sync Intelligence Reports & Comparisons
  console.log("\n📍 Syncing 36 platforms and curated comparisons...");
  await syncComparisonData();

  // 3. Seed Blog Categories & Posts
  console.log("\n📚 Seeding Blog Content...");
  const guideCategory = await prisma.postCategory.create({
    data: { name: "Platform Guides", slug: "platform-guides" },
  });

  const postsData = [
    {
      slug: "choosing-the-right-platform",
      title: "10 Things to Consider When Choosing a Course Platform",
      description: "Key factors to weigh before committing to a platform.",
      content: "Full content about choosing platforms...",
      image: "https://picsum.photos/400/250?random=1",
      published: true,
      authorId: adminUser.id,
      categoryId: guideCategory.id,
    }
  ];

  for (const post of postsData) {
    await prisma.post.create({ data: post });
  }

  // 4. Seed Site Content
  console.log("\n🌐 Seeding Site Content...");
  const siteContent = [
    { key: "global.siteName", group: "Globals", value: "Comparlify" },
    { key: "homepage.hero.title", group: "Homepage", value: "Build, Market & Sell\nSmarter, Not Harder" },
  ];

  for (const content of siteContent) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: content as any,
      create: content as any,
    });
  }

  // 5. Seed Images
  console.log("\n🖼️ Seeding existing images...");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await fs.readdir(uploadsDir);
    for (const filename of files.filter(f => /\.(jpe?g|png|gif|webp|svg)$/i.test(f))) {
      await prisma.image.upsert({
        where: { filename },
        update: {},
        create: {
          filename,
          url: `/uploads/${filename}`,
          altText: filename.split('.')[0],
          size: (await fs.stat(path.join(uploadsDir, filename))).size,
          authorId: adminUser.id,
        }
      });
    }
  } catch (e) {}

  console.log("\n🎉 Seeding finished successfully!");
}

export const seed = async (skipCleanup = false) => {
  try {
    await main(skipCleanup);
  } catch (e) {
    console.error("\n❌ An error occurred during seeding:");
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}
