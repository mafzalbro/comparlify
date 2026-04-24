import {
  PrismaClient,
  Role,
} from "@prisma/client";
import { prisma as sharedClient } from "../src/lib/prisma";

/**
 * SEED SCRIPT
 * Uses the application's Prisma singleton to avoid connection pool leaks.
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
    "Session", "VerificationToken",
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

  // --- 2. Feature Categories & Features ---
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
      await prisma.feature.upsert({
        where: { id: `feat-${fName.toLowerCase().replace(/\s+/g, '-')}` },
        update: { name: fName, categoryId: category.id },
        create: { id: `feat-${fName.toLowerCase().replace(/\s+/g, '-')}`, name: fName, categoryId: category.id }
      });
    }
  }

  // --- 3. Seed Comparison Category ---
  const compCategory = await prisma.comparisonCategory.upsert({
    where: { slug: "lms-platforms" },
    update: {},
    create: {
      name: "LMS Platforms",
      slug: "lms-platforms",
      description: "In-depth comparisons of Learning Management Systems."
    }
  });

  // --- 4. Seed Platforms for the Comparison ---
  const kajabiPlat = await prisma.platform.upsert({
    where: { name: "Kajabi" },
    update: {},
    create: {
      name: "Kajabi",
      website: "https://kajabi.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/46/Kajabi_Vertical_Logo_Transparent.png",
      description: "All-in-one business platform.",
      rating: 4.7,
      easeOfUse: 4.3,
      featuresRating: 4.9,
      support: 4.8,
      lastVerifiedAt: new Date("2026-04-24"),
    }
  });

  const skoolPlat = await prisma.platform.upsert({
    where: { name: "Skool" },
    update: {},
    create: {
      name: "Skool",
      website: "https://skool.com",
      logoUrl: "https://www.skool.com/assets/favicon.ico",
      description: "Community-first platform.",
      rating: 4.8,
      easeOfUse: 5.0,
      featuresRating: 4.5,
      support: 4.7,
      lastVerifiedAt: new Date("2026-04-24"),
    }
  });

  const beehiivPlat = await prisma.platform.upsert({
    where: { name: "Beehiiv" },
    update: {},
    create: {
      name: "Beehiiv",
      website: "https://www.beehiiv.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Beehiiv_logo.png",
      description: "The newsletter platform built for growth.",
      rating: 4.8,
      easeOfUse: 4.5,
      featuresRating: 4.9,
      support: 4.7,
      lastVerifiedAt: new Date("2026-04-24"),
    }
  });

  const substackPlat = await prisma.platform.upsert({
    where: { name: "Substack" },
    update: {},
    create: {
      name: "Substack",
      website: "https://substack.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Substack_logo.svg/1200px-Substack_logo.svg.png",
      description: "The home for independent writing.",
      rating: 4.6,
      easeOfUse: 4.9,
      featuresRating: 4.1,
      support: 4.3,
      lastVerifiedAt: new Date("2026-04-24"),
    }
  });

  // --- 5. Seed SEO-Based Full Comparison Guides ---
  await prisma.comparison.upsert({
    where: { slug: "kajabi-vs-skool" },
    update: {},
    create: {
      title: "Kajabi vs Skool: The Ultimate 2026 Comparison Guide",
      slug: "kajabi-vs-skool",
      summary: "A deep dive into the two industry giants. Which one is right for your community and courses in 2026?",
      introduction: "Choosing between Kajabi and Skool is one of the most critical decisions for course creators today. While one offers a robust all-in-one marketing suite, the other focuses on high-engagement community gamification.",
      conclusion: "If you need a marketing machine, go with Kajabi. If you want a community that stays engaged and loves the experience, Skool is the clear winner.",
      content: `## The Battle of Architecture: All-in-One vs. Community-First

In 2026, the lines between course hosting and community management have blurred, but Kajabi and Skool represent two fundamentally different philosophies.

### Kajabi: The Marketing Powerhouse
Kajabi remains the gold standard for those who want a single login to manage their entire business. Its pipeline builders, advanced email sequences, and highly customizable landing pages allow for sophisticated marketing funnels that Skool simply isn't designed to compete with.

**Key Strengths of Kajabi:**
- **Pipelines:** Complex visual funnel builders.
- **Email Marketing:** Native automation that replaces the need for ActiveCampaign or Kit.
- **Customization:** Full control over every pixel of your website.

### Skool: The Engagement Machine
Skool, founded by Sam Ovens, has doubled down on what matters most in modern education: completion rates. By combining a clean, social-media-like feed with gamified leaderboards, Skool creates an environment where students actually *want* to show up every day.

| Feature | Kajabi | Skool |
|---------|--------|-------|
| Community | Traditional Forum | Modern Feed |
| Gamification | Basic | Advanced (Leaderboards/Gems) |
| Email Marketing | Advanced Native | Basic Notifications Only |
| Website Builder | Comprehensive | Minimalist |

## Pricing & Hidden Costs

Kajabi starts at $149/mo (Basic) but often requires moving to the $199/mo Growth plan for affiliate features. Skool maintains a refreshingly simple flat fee of $99/mo for everything.

### Deep Dive into Features
While Kajabi offers more "tools," Skool offers more "connection." If your business relies on high-ticket sales through complex webinars, Kajabi's infrastructure supports that better. However, if you are building a recurring membership where the community *is* the product, Skool's low friction and high speed are unbeatable.`,
      published: true,
      platformAId: kajabiPlat.id,
      platformBId: skoolPlat.id,
      categoryId: compCategory.id,
      lastVerifiedAt: new Date("2026-04-24"),
      facts: {
        create: [
          { title: "Best For", platformAValue: "Marketing-heavy businesses", platformBValue: "Community-driven groups" },
          { title: "Learning Curve", platformAValue: "Steep (many features)", platformBValue: "None (ultra-simple)" },
        ]
      },
      faqs: {
        create: [
          { question: "Does Skool have email marketing?", answer: "No, Skool focuses on community. You will need an external tool like Kit for newsletters." },
          { question: "Can I host my website on Kajabi?", answer: "Yes, Kajabi includes a full website builder and hosting." }
        ]
      }
    }
  });

  await prisma.comparison.upsert({
    where: { slug: "beehiiv-vs-substack" },
    update: {},
    create: {
      title: "Beehiiv vs Substack 2026: Which Newsletter Platform Wins?",
      slug: "beehiiv-vs-substack",
      summary: "Comparing the two dominant forces in the newsletter space. One is for network effects, the other for growth tools.",
      introduction: "The newsletter boom of the early 2020s has matured. Today, Beehiiv and Substack dominate the landscape, but they serve very different types of creators.",
      conclusion: "Substack is the best place to start if you have no audience. Beehiiv is the best place to scale if you are serious about growth and monetization control.",
      content: `## Growth Tools vs. Network Effects

The fundamental difference between Beehiiv and Substack is how you find your readers.

### Substack: The Discovery Engine
Substack's greatest asset is its recommendation network. When a reader subscribes to one publication, they are prompted to subscribe to others. This "internal economy" drives a massive percentage of new signups for creators, especially those just starting out.

**Substack Pros:**
- **Zero Cost Upfront:** They only make money when you do (10% fee).
- **Network Effects:** 40%+ of growth often comes from other Substack writers.
- **Simplicity:** Focus on writing, nothing else.

### Beehiiv: The Growth Specialist
Beehiiv was built by the team behind Morning Brew, and it shows. It is packed with features designed to help you scale: a referral program (like the one that built Morning Brew), an ad network, and advanced segmentation.

| Feature | Beehiiv | Substack |
|---------|---------|----------|
| Fee | Monthly SaaS Fee | 10% Revenue Share |
| Referral Program | Advanced Built-in | Basic |
| Ad Network | Native Integration | None (Manual Only) |
| SEO | Robust & Custom | Limited |

## Monetization Comparison

Beehiiv takes 0% of your subscription revenue, charging only a flat monthly fee. Substack takes a flat 10%.

**The Math:**
- If you make $5,000/mo, Substack takes **$500**.
- On Beehiiv, you pay **$99/mo** (Scale plan), saving you over $400 every month.`,
      published: true,
      platformAId: beehiivPlat.id,
      platformBId: substackPlat.id,
      categoryId: compCategory.id,
      lastVerifiedAt: new Date("2026-04-24"),
      facts: {
        create: [
          { title: "Monetization", platformAValue: "0% Revenue Share (SaaS)", platformBValue: "10% Revenue Share" },
          { title: "Primary Growth", platformAValue: "Referrals & Ads", platformBValue: "Recommendation Network" },
        ]
      },
      faqs: {
        create: [
          { question: "Can I use a custom domain on Substack?", answer: "Yes, but there is a one-time fee to set it up." },
          { question: "Does Beehiiv have an app?", answer: "Yes, Beehiiv has a mobile app for readers." }
        ]
      }
    }
  });

  // --- 6. Sync Uploads ---
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
