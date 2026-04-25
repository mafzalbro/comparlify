import "dotenv/config";
import {
  PrismaClient,
  Prisma,
  Role,
  CommentStatus,
  ContentType,
  Post,
} from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { allPlatforms } from "../src/compare/platforms";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

import { promises as fs } from "fs";
import path from "path";

export async function cleanupDatabase() {
  console.log("🧹 Starting database cleanup...");

  const models = Object.keys(prisma).filter(
    (key) =>
      !key.startsWith("_") &&
      !key.endsWith("Delegate") &&
      typeof (prisma as any)[key].deleteMany === "function",
  );

  // Break circular dependencies first
  console.log("  - Breaking Post navigation links...");
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE Post SET nextId = NULL, previousId = NULL`,
    );
  } catch (e: any) {
    console.warn(`  - Could not break Post links: ${e.message}`);
  }

  // Deletion order matters due to foreign key constraints.
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
    "PricingTier",
    "Platform"
  ];

  // Add any models not in the explicit order to the end
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
  } else {
    console.log("Skipping cleanup as requested.");
  }

  // --- 1. Seed Users ---
  console.log("\n👤 Seeding Users...");
  const usersData = [
    {
      name: "Afzal Creator",
      email: "mafzalbro@gmail.com",
      role: Role.ADMIN,
      onboarded: true,
      newsletter: true,
    },
    {
      name: "Bob Builder",
      email: "maf415415@gmail.com",
      role: Role.AUTHOR,
      onboarded: false,
      newsletter: true,
    },
    {
      name: "Charlie User",
      email: "ma4156250@gmail.com",
      role: Role.USER,
      onboarded: false,
      newsletter: false,
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: "mafzalbro@gmail.com" },
  });
  const bobUser = await prisma.user.findUnique({
    where: { email: "maf415415@gmail.com" },
  });
  const charlieUser = await prisma.user.findUnique({
    where: { email: "ma4156250@gmail.com" },
  });

  if (!adminUser || !bobUser || !charlieUser) {
    throw new Error("Failed to seed users correctly.");
  }

  console.log(`   ✓ Seeded ${usersData.length} users.`);

  // --- 2. Seed Platforms from High-Fidelity Dataset ---
  console.log("\n📍 Seeding 36 high-fidelity platforms...");
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

  const createdPlatforms = await prisma.platform.findMany();
  console.log(`   ✓ Seeded ${createdPlatforms.length} platforms.`);

  // --- 3. Seed Blog Post Categories ---
  console.log("\n📚 Seeding Blog Post Categories...");
  const postCategoryData = [
    { name: "Platform Guides", slug: "platform-guides" },
    { name: "Course Creation", slug: "course-creation" },
    { name: "Marketing", slug: "marketing" },
    { name: "Tech Trends", slug: "tech-trends" },
  ];
  for (const cat of postCategoryData) {
    await prisma.postCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  const postCategories = await prisma.postCategory.findMany();
  console.log(`   ✓ Seeded ${postCategories.length} post categories.`);
  const postCategoryMap = new Map(postCategories.map((c) => [c.name, c.id]));

  // --- 4. Seed Blog Posts ---
  console.log("📝 Seeding Blog Posts...");
  const postsData = [
    {
      slug: "choosing-the-right-platform",
      title: "10 Things to Consider When Choosing a Course Platform",
      description:
        "From pricing and features to scalability and support, here are the key factors to weigh before committing to a platform.",
      content: "Full content about choosing platforms...",
      image: "https://picsum.photos/400/250?random=1",
      dataAiHint: "decision making choices",
      published: true,
      authorId: adminUser.id,
      categoryName: "Platform Guides",
    },
    {
      slug: "engaging-course-content",
      title: "5 Secrets to Creating Wildly Engaging Course Content",
      description:
        "Move beyond static videos. Discover interactive techniques that captivate students and boost completion rates.",
      content: "Full content about engaging content...",
      image: "https://picsum.photos/400/250?random=2",
      dataAiHint: "creative content creation",
      published: true,
      authorId: adminUser.id,
      categoryName: "Course Creation",
    },
    {
      slug: "marketing-your-online-course",
      title: "The Ultimate Guide to Marketing Your Online Course in 2024",
      description:
        "Explore the latest strategies for social media, email marketing, and SEO to attract your ideal students.",
      content: "Full content about marketing courses...",
      image: "https://picsum.photos/400/250?random=3",
      dataAiHint: "digital marketing strategy",
      published: true,
      authorId: adminUser.id,
      categoryName: "Marketing",
    },
    {
      slug: "ai-in-education",
      title: "How AI is Revolutionizing the E-Learning Industry",
      description:
        "Learn how artificial intelligence is personalizing learning paths, automating grading, and creating smarter content.",
      content: "Full content about AI in education...",
      image: "https://picsum.photos/400/250?random=4",
      dataAiHint: "artificial intelligence education",
      published: false,
      authorId: adminUser.id,
      categoryName: "Tech Trends",
    },
  ];

  let previousPostId: string | null = null;
  for (let i = 0; i < postsData.length; i++) {
    const { categoryName, authorId, ...rest } = postsData[i];
    const categoryId = postCategoryMap.get(categoryName);
    if (!categoryId) continue;

    const createdPost: Post = await prisma.post.create({
      data: {
        ...rest,
        author: { connect: { id: authorId } },
        category: { connect: { id: categoryId } },
        previous: previousPostId
          ? { connect: { id: previousPostId } }
          : undefined,
      },
    });
    if (previousPostId) {
      await prisma.post.update({
        where: { id: previousPostId },
        data: { nextId: createdPost.id },
      });
    }
    previousPostId = createdPost.id;
  }
  console.log(`   ✓ Seeded ${postsData.length} blog posts with navigation links.`);

  const allPosts = await prisma.post.findMany();
  const post1 = allPosts.find((p) => p.slug === "choosing-the-right-platform")!;
  const post2 = allPosts.find((p) => p.slug === "engaging-course-content")!;

  // --- 5. Seed Comments ---
  console.log("💬 Seeding Comments...");
  const commentData = [
    {
      content: "This was incredibly helpful!",
      postId: post1.id,
      authorId: charlieUser.id,
      status: CommentStatus.APPROVED,
    },
    {
      content: "Great article.",
      postId: post1.id,
      authorId: bobUser.id,
      status: CommentStatus.PENDING,
    },
  ];
  await prisma.comment.createMany({ data: commentData });

  // --- 6. Seed Comparison Categories ---
  console.log("\n⚖️ Seeding Comparison Categories...");
  const compCategoryData = [
    { name: "Platform Showdowns", slug: "platform-showdowns" },
    { name: "Flagship Showdowns", slug: "flagship-showdowns" },
    { name: "All-in-One vs. Standalone", slug: "all-in-one-vs-standalone" },
  ];
  for (const cat of compCategoryData) {
    await prisma.comparisonCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  const compCategories = await prisma.comparisonCategory.findMany();
  const compCategoryMap = new Map(compCategories.map((c) => [c.name, c.id]));

  // --- 7. Seed Curated Comparison Guides ---
  console.log("🆚 Seeding Comparisons...");
  const curatedComparisons = [
    {
      slug: "kajabi-vs-skool",
      title: "Kajabi vs Skool: The Ultimate 2026 Comparison Guide",
      summary: "Marketing Powerhouse vs. Engagement Engine.",
      intro: "Choosing between Kajabi and Skool is the most critical decision for course creators today.",
      conclusion: "If you need an all-in-one machine, Kajabi is the choice. If you want high engagement, Skool wins.",
      platA: "Kajabi",
      platB: "Skool",
      category: "Platform Showdowns",
      content: `## Architecture and Philosophy: Stability vs. Velocity\n\nIn 2026, the lines between course hosting and community management have blurred...`
    },
    {
        slug: "beehiiv-vs-substack",
        title: "Beehiiv vs Substack 2026: The Battle for Newsletter Supremacy",
        summary: "Growth Tools vs. Recommendation Networks.",
        intro: "The newsletter economy has matured.",
        conclusion: "Substack is for the writer starting from zero. Beehiiv is for the media entrepreneur.",
        platA: "Beehiiv",
        platB: "Substack",
        category: "Platform Showdowns",
        content: `## Monetization and Growth\n\nThe biggest difference is the economic model...`
    }
  ];

  for (const comp of curatedComparisons) {
    const pA = createdPlatforms.find(p => p.name === comp.platA);
    const pB = createdPlatforms.find(p => p.name === comp.platB);
    const catId = compCategoryMap.get(comp.category);
    if (pA && pB && catId) {
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
          categoryId: catId,
          lastVerifiedAt: new Date("2026-04-24"),
        }
      });
    }
  }

  // --- 8. Seed AI Tools ---
  console.log("\n🤖 Seeding AI Tools...");
  const toolsData = [
    {
      slug: "title-generator",
      title: "AI Title Generator",
      description: "Craft catchy, SEO-friendly titles for your course.",
      Icon: "Lightbulb",
      category: "Marketing",
      enabled: true,
      inputTopicLabel: "Course Description",
      inputContextLabel: "",
      prompt: "You are an expert... {{{topic}}}",
    },
  ];
  for (const tool of toolsData) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: tool,
      create: tool,
    });
  }

  // --- 9. Seed Site Content ---
  console.log("\n🌐 Seeding Site Content...");
  const siteContent = [
    { key: "global.siteName", group: "Globals", value: "Comparlify" },
  ];
  for (const content of siteContent) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: content as any,
      create: content as any,
    });
  }

  // --- 10. Seed News ---
  console.log("\n📰 Seeding News...");
  const newsData = {
    title: "Comparlify Launches New AI-Powered Tool Suite",
    slug: "comparlify-launches-ai-tools",
    content: "We're excited to announce a major update...",
    image: "https://picsum.photos/400/250?random=10",
    dataAiHint: "technology launch announcement",
    published: true,
    authorId: adminUser.id,
  };
  await prisma.newsArticle.upsert({
    where: { slug: newsData.slug },
    update: newsData,
    create: newsData,
  });

  // --- 11. Seed Community ---
  console.log("\n💬 Seeding Community Forums...");
  const generalCategory = await prisma.forumCategory.upsert({
    where: { slug: "general-discussion" },
    update: {
      name: "General Discussion",
      description: "Talk about anything related to course creation.",
    },
    create: {
      name: "General Discussion",
      slug: "general-discussion",
      description: "Talk about anything related to course creation.",
    },
  });

  // --- 12. Seed Images from /public/uploads ---
  console.log("\n🖼️ Seeding existing images from public/uploads...");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter((file) =>
      /\.(jpe?g|png|gif|webp|svg)$/i.test(file),
    );
    for (const filename of imageFiles) {
      const existingImage = await prisma.image.findFirst({
        where: { filename },
      });
      if (!existingImage) {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);
        await prisma.image.create({
          data: {
            filename,
            url: `/uploads/${filename}`,
            altText: filename.split(".").slice(0, -1).join(".").replace(/[-_]/g, " "),
            size: stats.size,
            authorId: adminUser.id,
          },
        });
      }
    }
  } catch (error: any) {}

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
