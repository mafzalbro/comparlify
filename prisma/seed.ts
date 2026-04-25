import {
  PrismaClient,
  Role,
} from "@prisma/client";
import { prisma as sharedClient } from "../src/lib/prisma";
import { allPlatforms } from "../src/compare/platforms";

/**
 * SEED SCRIPT
 * Uses the application's Prisma singleton to avoid connection pool leaks.
 * Now dynamically pulls high-fidelity data from the codebase and maintains legacy sync requirements.
 */

export async function cleanupDatabase(prismaInstance?: PrismaClient) {
  const prisma = prismaInstance || sharedClient;
  console.log("🧹 Starting database cleanup...");

  // Break circular dependencies first to avoid foreign key constraints
  try {
    await prisma.$executeRawUnsafe(`UPDATE Post SET nextId = NULL, previousId = NULL`);
  } catch (e) {}

  const deletionOrder = [
    "Notification", "Bookmark", "Comment", "Fact", "Faq", "PlatformFeature", 
    "Post", "Comparison", "Feature", "NewsArticle", "EmailRecipient", 
    "EmailCampaign", "ContactMessage", "Subscription", "ForumPost", 
    "ForumTopic", "FeatureCategory", "ComparisonCategory", "PostCategory", 
    "ForumCategory", "Image", "SiteContent", "Tool", "User", "Account", 
    "Session", "VerificationToken", "PricingTier", "Platform"
  ];

  // Execute deletions sequentially to respect remaining constraints
  for (const model of deletionOrder) {
    try {
      if ((prisma as any)[model]?.deleteMany) {
        await (prisma as any)[model].deleteMany({});
      }
    } catch (e) {
      console.warn(`⚠️ Warning: Could not clean model ${model}:`, e instanceof Error ? e.message : e);
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
    }
  });

  // --- 2. Seed Platforms from Central Data ---
  console.log("📍 Seeding 36 high-fidelity platforms...");
  for (const data of allPlatforms) {
    const platform = await prisma.platform.create({
      data: {
        name: data.name,
        website: data.website,
        logoUrl: data.logoUrl,
        description: data.description,
        rating: data.rating,
        easeOfUse: data.easeOfUse,
        featuresRating: data.featuresRating,
        support: data.support,
        pros: data.pros,
        cons: data.cons,
        affiliateLink: data.affiliateLink,
        dealDescription: data.dealDescription,
        videoHostingIncluded: data.videoHostingIncluded,
        lastVerifiedAt: new Date(data.lastVerifiedAt),
        tiers: {
          create: data.tiers.map(t => ({
            name: t.name,
            monthlyPrice: t.monthlyPrice,
            annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent,
            transactionFeePercent: t.transactionFeePercent,
            isPopular: t.isPopular || false,
            features: t.features,
          }))
        }
      }
    });

    // Seed Features for each platform
    for (const feat of data.features) {
      const category = await prisma.featureCategory.upsert({
        where: { name: feat.categoryName },
        update: {},
        create: { name: feat.categoryName },
      });

      let existingFeature = await prisma.feature.findFirst({
        where: { name: feat.featureName, categoryId: category.id }
      });

      if (!existingFeature) {
        existingFeature = await prisma.feature.create({
          data: { name: feat.featureName, categoryId: category.id }
        });
      }

      await prisma.platformFeature.create({
        data: {
          platformId: platform.id,
          featureId: existingFeature.id,
          hasFeature: feat.hasFeature,
          details: feat.details
        }
      });
    }
  }

  // --- 3. Legacy Feature Seeding (Ensure specific categories exist) ---
  const categoriesData = [
    { name: "LMS Core", features: ["Course Builder", "Video Hosting", "Content Dripping"] },
    { name: "Marketing", features: ["Funnels", "Email Marketing", "Affiliate System"] }
  ];

  for (const cat of categoriesData) {
    const category = await prisma.featureCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name }
    });
    for (const fName of cat.features) {
      const featId = `feat-${fName.toLowerCase().replace(/\s+/g, '-')}`;
      await prisma.feature.upsert({
        where: { id: featId },
        update: { name: fName, categoryId: category.id },
        create: { id: featId, name: fName, categoryId: category.id }
      });
    }
  }

  // --- 4. Sync Uploads (Legacy requirement) ---
  console.log("\n🖼️ Syncing public/uploads to Image gallery...");
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(f => /\.(jpe?g|png|gif|webp|svg)$/i.test(f));
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
          }
        });
      }
    }
  } catch (e) {}

  // --- 5. Seed Comparison Category ---
  const compCategory = await prisma.comparisonCategory.upsert({
    where: { slug: "platform-showdowns" },
    update: {
        description: "In-depth, data-driven comparisons of the world's leading platforms."
    },
    create: {
      name: "Platform Showdowns",
      slug: "platform-showdowns",
      description: "In-depth, data-driven comparisons of the world's leading platforms."
    }
  });

  // --- 6. Seed Curated Comparison Guides ---
  const platforms = await prisma.platform.findMany();
  const getPlat = (name: string) => platforms.find(p => p.name === name);

  const curatedComparisons = [
    {
      slug: "kajabi-vs-skool",
      title: "Kajabi vs Skool: The Ultimate 2026 Comparison Guide",
      summary: "Marketing Powerhouse vs. Engagement Engine. Which one wins for your business?",
      intro: "Choosing between Kajabi and Skool is the most critical decision for course creators today. In 2026, the battle for student attention is won through either superior marketing systems or superior engagement mechanics.",
      conclusion: "If you need an all-in-one marketing machine that handles your entire business, Kajabi is the choice. If you want high engagement and a gamified community that keeps students coming back, Skool is the clear winner.",
      platA: "Kajabi",
      platB: "Skool",
      content: `## Architecture and Philosophy: Stability vs. Velocity

In 2026, the lines between course hosting and community management have blurred, but Kajabi and Skool represent two fundamentally different philosophies.

### Kajabi: The Institutional Heavyweight
Kajabi is built for those who want a single, stable login to manage their entire digital empire. It is a "marketing-first" platform that prioritizes high-end funnels and automated sales cycles.

### Skool: The Engagement Specialist
Skool is built for those who believe that the community *is* the product. It is an "engagement-first" platform that uses gamification and social triggers to drive student success.

| Feature | Kajabi | Skool |
|---------|--------|-------|
| Community | Traditional Forum | Modern Gamified Feed |
| Marketing | Advanced Funnels | Basic (Lead Magnets) |
| Gamification | Basic Badges | Leveling & Unlockables |
| ROI | High SaaS Fee | Flat $99 Fee |`
    },
    {
        slug: "beehiiv-vs-substack",
        title: "Beehiiv vs Substack 2026: The Battle for Newsletter Supremacy",
        summary: "Growth Tools vs. Recommendation Networks. Where should you build your list?",
        intro: "The newsletter economy has matured. Beehiiv and Substack are the two giants, but they serve very different goals.",
        conclusion: "Substack is for the writer starting from zero. Beehiiv is for the media entrepreneur scaling a business.",
        platA: "Beehiiv",
        platB: "Substack",
        content: `## Monetization and Growth

The biggest difference is the economic model.

### Beehiiv: The SaaS Model
Beehiiv charges a flat monthly fee. You keep 100% of your subscription revenue.

### Substack: The Network Model
Substack takes 10% of your revenue but gives you access to their massive discovery network.`
    }
  ];

  for (const comp of curatedComparisons) {
    const pA = getPlat(comp.platA);
    const pB = getPlat(comp.platB);
    if (pA && pB) {
      await prisma.comparison.create({
        data: {
          title: comp.title,
          slug: comp.slug,
          summary: comp.summary,
          introduction: comp.intro,
          conclusion: comp.conclusion,
          content: comp.content,
          published: true,
          platformAId: pA.id,
          platformBId: pB.id,
          categoryId: compCategory.id,
          lastVerifiedAt: new Date("2026-04-24"),
        }
      });
    }
  }

  console.log("\n🎉 Seeding finished successfully!");
}

export const seed = async (skipCleanup = false) => {
  try {
    await main(sharedClient, skipCleanup);
  } catch (e) {
    console.error("❌ Seed failed:", e);
  }
};

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed().then(() => {
    sharedClient.$disconnect();
    process.exit(0);
  });
}
