import { allPlatforms } from "../src/data/compare/platforms";
import "dotenv/config";
import {
  PrismaClient,
  Prisma,
  Role,
  CommentStatus,
  ContentType,
  Post,
} from "@prisma/client";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const isMongo = connectionString.startsWith("mongodb://") || connectionString.startsWith("mongodb+srv://") || process.env.DATABASE_PROVIDER?.toLowerCase().trim() === "mongodb";

const prisma = new PrismaClient({ log: ["error"] });

import { promises as fs } from "fs";
import path from "path";
import { syncComparisonData } from "../src/data/compare/sync";
import { syncBlogData } from "../src/data/blog/sync";

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
    if (isMongo) {
      const posts = await prisma.post.findMany({ select: { id: true } });
      for (const p of posts) {
        await (prisma as any).$runCommandRaw({
          update: "Post",
          updates: [
            {
              q: { _id: p.id },
              u: { $set: { nextId: null, previousId: null } }
            }
          ]
        });
      }
    } else {
      await (prisma as any).$executeRawUnsafe(
        `UPDATE Post SET nextId = NULL, previousId = NULL`,
      );
    }
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
  ];

  // Add any models not in the explicit order to the end
  const remainingModels = models.filter((m) => !deletionOrder.includes(m));
  const finalDeletionOrder = [...deletionOrder, ...remainingModels];

  for (const model of finalDeletionOrder) {
    try {
      if ((prisma as any)[model]) {
        if (isMongo) {
          await (prisma as any).$runCommandRaw({
            delete: model,
            deletes: [{ q: {}, limit: 0 }],
          });
        } else if ((prisma as any)[model].deleteMany) {
          const { count } = await (prisma as any)[model].deleteMany({});
          if (count > 0) {
            console.log(`  🔥 Deleted ${count} records from ${model}`);
          }
        }
      }
    } catch (e: any) {
      // This might fail if the model doesn't exist in some versions, so we just log it.
      if (e.code !== "P2025") {
        // P2025 = Record to delete does not exist.
        console.warn(`  - Could not delete from ${model}: ${e.message}`);
      }
    }
  }

  console.log("✅ Database cleanup complete.");
}

async function main(skipCleanup = true) {
  console.log("🌱 Starting database seeding...");

  if (!skipCleanup) {
    await cleanupDatabase();
  } else {
    console.log("Skipping cleanup as requested.");
  }

  function getModelDelegate(modelName: string): any {
    const keys = Object.keys(prisma);
    const target = modelName.toLowerCase();
    const foundKey = keys.find(k => k.toLowerCase() === target);
    if (foundKey) {
      return (prisma as any)[foundKey];
    }
    return (prisma as any)[modelName.toLowerCase()];
  }

  async function safeUpdate(modelName: string, id: string, data: any) {
    if (isMongo) {
      const doc = { ...data };
      delete doc.id;
      delete doc._id;

      // Convert Date objects and strings to Extended JSON
      for (const key of Object.keys(doc)) {
        if (doc[key] instanceof Date) {
          doc[key] = { $date: doc[key].toISOString() };
        } else if (typeof doc[key] === "string" && (key.endsWith("At") || key === "emailVerified" || key === "expires")) {
          const d = new Date(doc[key]);
          if (!isNaN(d.getTime())) {
            doc[key] = { $date: d.toISOString() };
          }
        }
      }

      await (prisma as any).$runCommandRaw({
        update: modelName,
        updates: [
          {
            q: { _id: id },
            u: { $set: doc },
            upsert: false
          }
        ]
      });

      return { id, ...doc };
    } else {
      return await getModelDelegate(modelName).update({
        where: { id },
        data,
      });
    }
  }

  // Transaction-free direct raw insert strategy for MongoDB standalone
  async function safeCreate(modelName: string, data: any) {
    if (isMongo) {
      const doc = { ...data };

      if (!doc._id) {
        doc._id = doc.id || `c${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
      }
      delete doc.id;

      // Populate database defaults for MongoDB raw insertion to prevent conversion errors
      if (!doc.createdAt) doc.createdAt = new Date();
      if (!doc.updatedAt) doc.updatedAt = new Date();

      if (modelName === "User") {
        if (doc.onboarded === undefined) doc.onboarded = false;
        if (doc.newsletter === undefined) doc.newsletter = false;
        if (doc.suspended === undefined) doc.suspended = false;
        if (doc.role === undefined) doc.role = "USER";
      }
      if (modelName === "Post" || modelName === "Comparison" || modelName === "NewsArticle") {
        if (doc.published === undefined) doc.published = false;
      }
      if (modelName === "ForumTopic" || modelName === "ForumPost" || modelName === "Comment") {
        if (doc.status === undefined) doc.status = "PENDING";
      }
      if (modelName === "Tool") {
        if (doc.enabled === undefined) doc.enabled = true;
      }
      if (modelName === "PricingTier") {
        if (doc.isPopular === undefined) doc.isPopular = false;
      }

      const relationKeys = ["platformA", "platformB", "category", "author", "topic", "posts", "facts", "faqs"];
      for (const rKey of relationKeys) {
        delete doc[rKey];
      }

      // Convert date strings and Date objects to standard MongoDB Extended JSON Date representation so that MongoDB stores them as real BSON Date types
      for (const key of Object.keys(doc)) {
        if (doc[key] instanceof Date) {
          doc[key] = { $date: doc[key].toISOString() };
        } else if (typeof doc[key] === "string" && (key.endsWith("At") || key === "emailVerified" || key === "expires")) {
          const d = new Date(doc[key]);
          if (!isNaN(d.getTime())) {
            doc[key] = { $date: d.toISOString() };
          }
        }
      }

      // Use MongoDB's raw insert command to bypass Prisma transactions entirely
      await (prisma as any).$runCommandRaw({
        insert: modelName,
        documents: [doc],
      });
      return { id: doc._id, ...doc };
    } else {
      return await getModelDelegate(modelName).create({ data });
    }
  }

  async function safeCreateMany(modelName: string, dataArray: any[]) {
    if (isMongo) {
      for (const item of dataArray) {
        await safeCreate(modelName, item);
      }
    } else {
      await getModelDelegate(modelName).createMany({ data: dataArray });
    }
  }

  // --- 2. Seed Users ---
  console.log("\n👤 Seeding Users...");
  const usersData = [
    {
      name: "Muhammad Afzal",
      email: "mafzalbro@gmail.com",
      role: Role.ADMIN,
      username: "muhammad_afzal",
      bio: "Over 10 years of experience building and migrating premium online academies. Muhammad focuses on zero-friction migrations, high-LTV student retention, and helping creators own their platform destiny.",
      website: "https://comparlify.com",
      onboarded: true,
      newsletter: true,
    },
    {
      name: "Comparlify Admin",
      email: "admin@comparlify.com",
      role: Role.ADMIN,
      onboarded: true,
      newsletter: true,
    },
  ];

  for (const u of usersData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await safeCreate("User", u);
    }
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: "mafzalbro@gmail.com" },
  });
  const comparlifyAdmin = await prisma.user.findUnique({
    where: { email: "admin@comparlify.com" },
  });

  if (!adminUser || !comparlifyAdmin) {
    throw new Error("Failed to seed users correctly.");
  }

  console.log(`   ✓ Seeded ${usersData.length} users.`);
  // --- 2.1 Seed High-Fidelity Platforms (36 Entities) ---
  console.log("📍 Seeding 36 high-fidelity platforms...");
  for (const data of allPlatforms) {
    const platExists = await prisma.platform.findUnique({
      where: { name: data.name },
    });
    if (platExists) {
      console.log(`   ⏩ Platform '${data.name}' already seeded, skipping.`);
      continue;
    }

    let platform: any;
    if (isMongo) {
      const existing = await prisma.platform.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        const updateData = { ...data };
        delete (updateData as any).tiers;
        delete (updateData as any).features;
        platform = await safeUpdate("Platform", existing.id, {
          website: updateData.website,
          logoUrl: updateData.logoUrl,
          description: updateData.description,
          rating: updateData.rating,
          easeOfUse: updateData.easeOfUse,
          featuresRating: updateData.featuresRating,
          support: updateData.support,
          pros: updateData.pros,
          cons: updateData.cons,
          affiliateLink: updateData.affiliateLink,
          dealDescription: updateData.dealDescription,
          videoHostingIncluded: updateData.videoHostingIncluded,
          lastVerifiedAt: new Date(updateData.lastVerifiedAt),
        });
      } else {
        const createData = { ...data };
        delete (createData as any).tiers;
        delete (createData as any).features;
        platform = await safeCreate("Platform", {
          name: createData.name,
          website: createData.website,
          logoUrl: createData.logoUrl,
          description: createData.description,
          rating: createData.rating,
          easeOfUse: createData.easeOfUse,
          featuresRating: createData.featuresRating,
          support: createData.support,
          pros: createData.pros,
          cons: createData.cons,
          affiliateLink: createData.affiliateLink,
          dealDescription: createData.dealDescription,
          videoHostingIncluded: createData.videoHostingIncluded,
          lastVerifiedAt: new Date(createData.lastVerifiedAt),
        });
      }

      // Delete existing tiers for this platform
      const existingTiers = await prisma.pricingTier.findMany({
        where: { platformId: platform.id }
      });
      for (const t of existingTiers) {
        await prisma.pricingTier.delete({ where: { id: t.id } });
      }

      // Create new tiers
      for (const t of data.tiers) {
        await safeCreate("PricingTier", {
          name: t.name,
          monthlyPrice: t.monthlyPrice,
          annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent,
          transactionFeePercent: t.transactionFeePercent,
          isPopular: t.isPopular || false,
          features: t.features,
          platformId: platform.id,
        });
      }
    } else {
      platform = await prisma.platform.upsert({
        where: { name: data.name },
        update: {
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
            deleteMany: {},
            create: data.tiers.map((t) => ({
              name: t.name,
              monthlyPrice: t.monthlyPrice,
              annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent,
              transactionFeePercent: t.transactionFeePercent,
              isPopular: t.isPopular || false,
              features: t.features,
            })),
          },
        },
        create: {
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
            create: data.tiers.map((t) => ({
              name: t.name,
              monthlyPrice: t.monthlyPrice,
              annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent,
              transactionFeePercent: t.transactionFeePercent,
              isPopular: t.isPopular || false,
              features: t.features,
            })),
          }
        }
      });
    }

    for (const feat of data.features) {
      let category: any;
      if (isMongo) {
        category = await prisma.featureCategory.findUnique({
          where: { name: feat.categoryName },
        });
        if (!category) {
          category = await safeCreate("FeatureCategory", { name: feat.categoryName });
        }
      } else {
        category = await prisma.featureCategory.upsert({
          where: { name: feat.categoryName },
          update: {},
          create: { name: feat.categoryName },
        });
      }

      let existingFeature = await prisma.feature.findFirst({
        where: { name: feat.featureName, categoryId: category.id }
      });

      if (!existingFeature) {
        if (isMongo) {
          existingFeature = await safeCreate("Feature", { name: feat.featureName, categoryId: category.id }) as any;
        } else {
          existingFeature = await prisma.feature.create({
            data: { name: feat.featureName, categoryId: category.id }
          });
        }
      }

      if (isMongo) {
        const existingPf = await prisma.platformFeature.findFirst({
          where: { platformId: platform.id, featureId: existingFeature!.id }
        });
        if (existingPf) {
          await safeUpdate("PlatformFeature", existingPf.id, {
            hasFeature: feat.hasFeature,
            details: feat.details
          });
        } else {
          await safeCreate("PlatformFeature", {
            platformId: platform.id,
            featureId: existingFeature!.id,
            hasFeature: feat.hasFeature,
            details: feat.details
          });
        }
      } else {
        await prisma.platformFeature.create({
          data: {
            platformId: platform.id,
            featureId: existingFeature!.id,
            hasFeature: feat.hasFeature,
            details: feat.details
          }
        });
      }
    }
  }


  // --- 6. Seed Blog Post Categories ---
  console.log("\n📚 Seeding Blog Post Categories...");
  const postCategoryData = [
    { name: "Platform Guides", slug: "platform-guides" },
    { name: "Course Creation", slug: "course-creation" },
    { name: "Marketing", slug: "marketing" },
    { name: "Tech Trends", slug: "tech-trends" },
  ];
  for (const cat of postCategoryData) {
    const existing = await prisma.postCategory.findFirst({ where: { slug: cat.slug } });
    if (!existing) {
      await safeCreate("PostCategory", cat);
    }
  }
  const postCategories = await prisma.postCategory.findMany();
  console.log(`   ✓ Seeded ${postCategories.length} post categories.`);
  const postCategoryMap = new Map(postCategories.map((c) => [c.name, c.id]));

  // --- 7. Seed Blog Posts ---
  console.log("📝 Seeding Blog Posts...");
  const postsData: (Omit<Prisma.PostCreateInput, "author" | "category"> & {
    categoryName: string;
    authorId: string;
  })[] = [
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
    const existingPost = await prisma.post.findUnique({ where: { slug: postsData[i].slug } });
    if (existingPost) {
      console.log(`   ⏩ Post '${postsData[i].title}' already seeded, skipping.`);
      previousPostId = existingPost.id;
      continue;
    }
    const { categoryName, authorId, ...rest } = postsData[i];
    const categoryId = postCategoryMap.get(categoryName);
    if (!categoryId) {
      console.warn(
        `Category '${categoryName}' not found for post '${postsData[i].title}'. Skipping post.`,
      );
      continue;
    }

    let createdPost: Post;
    if (isMongo) {
      createdPost = await safeCreate("Post", {
        ...rest,
        authorId,
        categoryId,
      }) as Post;
    } else {
      createdPost = await prisma.post.create({
        data: {
          ...rest,
          author: { connect: { id: authorId } },
          category: { connect: { id: categoryId } },
        },
      });
    }

    if (previousPostId) {
      if (isMongo) {
        await (prisma as any).$runCommandRaw({
          update: "Post",
          updates: [
            {
              q: { _id: previousPostId },
              u: { $set: { nextId: createdPost.id } }
            }
          ]
        });
      } else {
        await prisma.post.update({
          where: { id: previousPostId },
          data: { nextId: createdPost.id },
        });
      }
    }
    previousPostId = createdPost.id;
  }
  console.log(
    `   ✓ Seeded ${postsData.length} blog posts with navigation links.`,
  );

  const allPosts = await prisma.post.findMany();
  const post1 = allPosts.find((p) => p.slug === "choosing-the-right-platform")!;
  const post2 = allPosts.find((p) => p.slug === "engaging-course-content")!;

  // --- 8. Seed Comments ---
  console.log("💬 Seeding Comments...");
  const commentData = [
    {
      content:
        "This was incredibly helpful! I was stuck between Teachable and Thinkific, and this breakdown made the choice clear.",
      postId: post1.id,
      authorId: comparlifyAdmin.id,
      status: CommentStatus.APPROVED,
    },
    {
      content:
        "Great article. What are your thoughts on Kajabi's price point for new creators? Seems a bit steep.",
      postId: post1.id,
      authorId: adminUser.id,
      status: CommentStatus.PENDING,
    },
    {
      content:
        "These are fantastic ideas for engagement. I'm definitely going to try adding more interactive quizzes.",
      postId: post2?.id,
      authorId: comparlifyAdmin.id,
      status: CommentStatus.APPROVED,
    },
    {
      content: "I don't agree with point #3.",
      postId: post2?.id,
      authorId: adminUser.id,
      status: CommentStatus.REJECTED,
    },
  ];
  await safeCreateMany("Comment", commentData);
  console.log(`   ✓ Seeded ${commentData.length} comments.`);

  // --- 9. Seed Comparison Categories & Comparisons ---
  console.log("\n⚖️ Seeding Comparisons dynamically from comparisons folder...");
  // Seeding handled directly by syncComparisonData() at the end to guarantee high-fidelity data

  // --- 11. Seed AI Tools ---
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
      prompt:
        "You are an expert in creating engaging and effective course titles. Based on the provided course description, generate a title that will attract more students and increase enrollment.\n\nCourse Description: {{{topic}}}",
    },
    {
      slug: "course-outliner",
      title: "AI Course Outliner",
      description:
        "Generate a comprehensive, structured outline for your course.",
      Icon: "FileText",
      category: "CurriculumDesign",
      enabled: true,
      inputTopicLabel: "Course Description",
      inputContextLabel: "Existing Outline (optional)",
      prompt:
        "You are an expert curriculum designer. Based on the provided course description, create a comprehensive and well-structured course outline. Use headings for modules and nested lists for lessons within each module. Each lesson should have a brief, one-sentence description.\n\nCourse Description: {{{topic}}}\n{{#if context}}\n\nExisting Outline:\n{{{context}}}\n\nContinue From There:{{/if}}",
    },
    {
      slug: "video-scripter",
      title: "AI Video Script Assistant",
      description: "Create engaging scripts for your video lessons.",
      Icon: "Video",
      category: "ContentCreation",
      enabled: true,
      inputTopicLabel: "Lesson Topic",
      inputContextLabel: "Existing Script (optional)",
      prompt:
        'You are an expert scriptwriter for educational videos. Based on the lesson topic, write a complete, word-for-word video script. Include cues for the presenter\'s tone (e.g., "[enthusiastically]") and suggestions for on-screen visuals (e.g., "[Show B-roll of...]").\n\nLesson Topic: {{{topic}}}\n{{#if context}}\n\nExisting Script:\n{{{context}}}\n\nContinue writing from here:{{/if}}',
    },
    {
      slug: "lesson-summarizer",
      title: "AI Lesson Summarizer",
      description: "Automatically generate key takeaways for your lessons.",
      Icon: "BookOpen",
      category: "Productivity",
      enabled: true,
      inputTopicLabel: "Lesson Content",
      inputContextLabel: "Existing Summary (optional)",
      prompt:
        "You are an expert at distilling information. Based on the lesson content, create a concise summary. It should be a short paragraph followed by the 3-5 most important key takeaways as a bulleted list.\n\nLesson Content: {{{topic}}}\n{{#if context}}\n\nExisting Summary:\n{{{context}}}\n\nContinue From There:{{/if}}",
    },
    {
      slug: "blog-post-idea-generator",
      title: "Blog Post Idea Generator",
      description:
        "Generate a list of blog post ideas to attract your target audience.",
      Icon: "FilePenLine",
      category: "SEO",
      enabled: true,
      inputTopicLabel: "Course Topic",
      inputContextLabel: "Target Audience (optional)",
      prompt:
        "You are a content marketing strategist. Generate a list of 5-7 blog post ideas that are relevant to the given course topic and target audience. The ideas should be engaging and designed to attract potential students.\n\nCourse Topic: {{{topic}}}\n{{#if context}}Target Audience: {{{context}}}{{/if}}",
    },
  ];
  for (const tool of toolsData) {
    const existing = await prisma.tool.findUnique({
      where: { slug: tool.slug },
      select: { id: true },
    });
    if (!existing) {
      await safeCreate("Tool", tool);
    }
  }
  console.log(`   ✓ Seeded ${toolsData.length} AI tools.`);

  // --- 12. Seed Site Content ---
  console.log("\n🌐 Seeding Site Content...");
  const siteContent = [
    // Globals
    { key: "global.siteName", group: "Globals", value: "Comparlify" },
    {
      key: "global.banner.text",
      group: "Globals",
      value: "🎉 New AI Tools added! Supercharge your workflow now.",
    },
    {
      key: "global.banner.link.text",
      group: "Globals",
      value: "Explore Tools",
    },
    { key: "global.banner.link.href", group: "Globals", value: "/tools" },
    { key: "global.banner.enabled", group: "Globals", value: "true" },

    // SEO Settings
    { key: "seo.default.title", group: "SEO Settings", value: "Comparlify" },
    {
      key: "seo.default.description",
      group: "SEO Settings",
      type: ContentType.TEXTAREA,
      value:
        "Unbiased comparisons, AI-powered tools, and community insights to help course creators succeed.",
    },
    {
      key: "seo.default.keywords",
      group: "SEO Settings",
      type: ContentType.TEXTAREA,
      value:
        "online course platform, course creation, e-learning, ai tools for creators, teachable vs thinkific, course marketing",
    },
    { key: "seo.default.twitter", group: "SEO Settings", value: "@comparlify" },
    {
      key: "seo.default.url",
      group: "SEO Settings",
      value: "https://comparlify.com",
    },
    {
      key: "seo.og.image",
      group: "SEO Settings",
      value: "https://comparlify.com/og-image.png",
    },
    {
      key: "seo.twitter.image",
      group: "SEO Settings",
      value: "https://comparlify.com/twitter-image.png",
    },

    // Organization Settings
    {
      key: "seo.org.name",
      group: "Organization Settings",
      value: "Comparlify",
    },
    {
      key: "seo.org.logo",
      group: "Organization Settings",
      value: "https://comparlify.com/logo.png",
    },

    // Theme Settings: Light Mode
    { key: "theme.light.background", group: "Theme", value: "48 100% 98%" },
    { key: "theme.light.foreground", group: "Theme", value: "35 33% 20%" },
    { key: "theme.light.card", group: "Theme", value: "48 100% 98%" },
    { key: "theme.light.card-foreground", group: "Theme", value: "35 33% 20%" },
    { key: "theme.light.popover", group: "Theme", value: "48 100% 98%" },
    {
      key: "theme.light.popover-foreground",
      group: "Theme",
      value: "35 33% 20%",
    },
    { key: "theme.light.primary", group: "Theme", value: "45 93% 58%" },
    {
      key: "theme.light.primary-foreground",
      group: "Theme",
      value: "35 33% 15%",
    },
    { key: "theme.light.secondary", group: "Theme", value: "48 95% 91%" },
    {
      key: "theme.light.secondary-foreground",
      group: "Theme",
      value: "35 33% 20%",
    },
    { key: "theme.light.muted", group: "Theme", value: "48 95% 94%" },
    {
      key: "theme.light.muted-foreground",
      group: "Theme",
      value: "35 33% 45%",
    },
    { key: "theme.light.accent", group: "Theme", value: "45 93% 85%" },
    {
      key: "theme.light.accent-foreground",
      group: "Theme",
      value: "35 33% 15%",
    },
    { key: "theme.light.destructive", group: "Theme", value: "0 84.2% 60.2%" },
    {
      key: "theme.light.destructive-foreground",
      group: "Theme",
      value: "0 0% 98%",
    },
    { key: "theme.light.border", group: "Theme", value: "45 80% 92%" },
    { key: "theme.light.input", group: "Theme", value: "45 80% 92%" },
    { key: "theme.light.ring", group: "Theme", value: "45 93% 58%" },

    // Theme Settings: Dark Mode
    { key: "theme.dark.background", group: "Theme", value: "30 10% 10%" },
    { key: "theme.dark.foreground", group: "Theme", value: "45 60% 95%" },
    { key: "theme.dark.card", group: "Theme", value: "30 10% 12%" },
    { key: "theme.dark.card-foreground", group: "Theme", value: "45 60% 95%" },
    { key: "theme.dark.popover", group: "Theme", value: "30 10% 10%" },
    {
      key: "theme.dark.popover-foreground",
      group: "Theme",
      value: "45 60% 95%",
    },
    { key: "theme.dark.primary", group: "Theme", value: "45 93% 58%" },
    {
      key: "theme.dark.primary-foreground",
      group: "Theme",
      value: "35 33% 15%",
    },
    { key: "theme.dark.secondary", group: "Theme", value: "30 10% 18%" },
    {
      key: "theme.dark.secondary-foreground",
      group: "Theme",
      value: "45 60% 95%",
    },
    { key: "theme.dark.muted", group: "Theme", value: "30 10% 18%" },
    { key: "theme.dark.muted-foreground", group: "Theme", value: "45 60% 75%" },
    { key: "theme.dark.accent", group: "Theme", value: "30 10% 22%" },
    {
      key: "theme.dark.accent-foreground",
      group: "Theme",
      value: "45 60% 95%",
    },
    { key: "theme.dark.destructive", group: "Theme", value: "0 62.8% 30.6%" },
    {
      key: "theme.dark.destructive-foreground",
      group: "Theme",
      value: "0 0% 98%",
    },
    { key: "theme.dark.border", group: "Theme", value: "30 10% 25%" },
    { key: "theme.dark.input", group: "Theme", value: "30 10% 25%" },
    { key: "theme.dark.ring", group: "Theme", value: "45 93% 58%" },

    // Module Visibility
    { key: "module.blog.enabled", group: "Module Visibility", value: "true" },
    {
      key: "module.compare.enabled",
      group: "Module Visibility",
      value: "true",
    },
    { key: "module.news.enabled", group: "Module Visibility", value: "true" },
    {
      key: "module.community.enabled",
      group: "Module Visibility",
      value: "true",
    },
    { key: "module.tools.enabled", group: "Module Visibility", value: "true" },

    // Homepage
    {
      key: "homepage.hero.supertitle",
      group: "Homepage",
      value: "The Ultimate Co-pilot for Course Creators",
    },
    {
      key: "homepage.hero.title",
      group: "Homepage",
      value: "Build, Market & Sell\nSmarter, Not Harder",
    },
    {
      key: "homepage.hero.subtitle",
      group: "Homepage",
      value:
        "Comparlify provides the tools, comparisons, and insights you need to turn your expertise into a thriving online business.",
    },
    {
      key: "homepage.cta.primary",
      group: "Homepage",
      value: "Explore AI Tools",
    },
    {
      key: "homepage.cta.secondary",
      group: "Homepage",
      value: "Compare Platforms",
    },
    {
      key: "homepage.whyus.title",
      group: "Homepage",
      value: "Your All-In-One Creator Hub",
    },
    {
      key: "homepage.whyus.subtitle",
      group: "Homepage",
      value:
        "Stop juggling dozens of apps. Get everything you need to succeed from a single, powerful dashboard.",
    },
    {
      key: "homepage.whyus.comparisons.title",
      group: "Homepage",
      value: "Unbiased Comparisons",
    },
    {
      key: "homepage.whyus.comparisons.description",
      group: "Homepage",
      value:
        "Get in-depth, data-driven comparisons of the top platforms. We dig into the details so you can choose with absolute confidence.",
    },
    {
      key: "homepage.whyus.aitools.title",
      group: "Homepage",
      value: "Powerful AI Tools",
    },
    {
      key: "homepage.whyus.aitools.description",
      group: "Homepage",
      value:
        "From generating catchy titles to outlining entire courses, our suite of AI tools is designed to save you time and spark your creativity.",
    },
    {
      key: "homepage.whyus.strategies.title",
      group: "Homepage",
      value: "Growth Strategies",
    },
    {
      key: "homepage.whyus.strategies.description",
      group: "Homepage",
      value:
        "Access our regularly updated blog for expert tips, marketing strategies, and insights to help you scale your course business effectively.",
    },
    {
      key: "homepage.tools.title",
      group: "Homepage",
      value: "Supercharge Your Workflow",
    },
    {
      key: "homepage.tools.subtitle",
      group: "Homepage",
      value:
        "Our suite of AI-powered tools is designed to handle the tedious tasks, so you can focus on creating.",
    },
    {
      key: "homepage.blog.title",
      group: "Homepage",
      value: "Creator Insights",
    },
    {
      key: "homepage.blog.subtitle",
      group: "Homepage",
      value: "The latest strategies, tips, and news from our blog.",
    },
    {
      key: "homepage.testimonials.title",
      group: "Homepage",
      value: "Loved by Creators Worldwide",
    },
    {
      key: "homepage.testimonials.subtitle",
      group: "Homepage",
      value:
        "Don't just take our word for it. Here's what creators are saying about Comparlify.",
    },
    {
      key: "homepage.finalCta.title",
      group: "Homepage",
      value: "Ready to Elevate Your Course Business?",
    },
    {
      key: "homepage.finalCta.subtitle",
      group: "Homepage",
      value:
        "Join thousands of successful creators. Access all our tools and resources for free.",
    },
    {
      key: "homepage.finalCta.button",
      group: "Homepage",
      value: "Sign Up for Free",
    },

    // Header & Footer
    {
      key: "header.navLinks",
      group: "Header",
      type: "TEXTAREA",
      value: JSON.stringify(
        [
          { href: "/", label: "Home" },
          { href: "/compare", label: "Comparisons" },
          { href: "/blog", label: "Blog" },
          { href: "/news", label: "News" },
          { href: "/community", label: "Community" },
          { href: "/tools", label: "Tools" },
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ],
        null,
        2,
      ),
    },
    {
      key: "footer.tagline",
      group: "Footer",
      value:
        "Helping course creators thrive with better tools and expert insights.",
    },
    { key: "footer.newsletter.title", group: "Footer", value: "Stay Updated" },
    {
      key: "footer.newsletter.subtitle",
      group: "Footer",
      value: "Get the latest tips and tool updates straight to your inbox.",
    },
    {
      key: "footer.navLinks.navigate",
      group: "Footer",
      type: "TEXTAREA",
      value: JSON.stringify(
        [
          { label: "Comparisons", href: "/compare" },
          { label: "Blog", href: "/blog" },
          { label: "Tools", href: "/tools" },
        ],
        null,
        2,
      ),
    },
    {
      key: "footer.navLinks.company",
      group: "Footer",
      type: "TEXTAREA",
      value: JSON.stringify(
        [
          { label: "About Us", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/legal/terms-of-service" },
          { label: "Sponsor Policy", href: "/legal/sponsor-policy" },
        ],
        null,
        2,
      ),
    },

    // About Page
    {
      key: "about.hero.title",
      group: "About Page",
      value: "We're Here to Help Creators Thrive",
    },
    {
      key: "about.hero.subtitle",
      group: "About Page",
      value: "Discover the story, mission, and people behind Comparlify.",
    },
    {
      key: "about.story.content",
      group: "About Page",
      type: "MARKDOWN",
      value: `## Our Story\n\nComparlify was born from a simple observation: the world of online course creation is both exciting and overwhelming. With countless platforms, tools, and strategies available, creators often find themselves lost in a sea of options, spending more time on research than on what they do best—creating amazing content.\n\nWe decided to change that. Our mission is to be the trusted guide for every course creator. We provide unbiased, in-depth comparisons, innovative AI-powered tools, and actionable insights to help you make informed decisions, save time, and accelerate your growth.\n\n> "We believe that every creator, regardless of their technical skill or budget, deserves a clear path to success."`,
    },
    {
      key: "about.values.title",
      group: "About Page",
      value: "Our Core Values",
    },
    {
      key: "about.values.subtitle",
      group: "About Page",
      value: "These principles guide everything we do.",
    },
    {
      key: "about.values.clarity.title",
      group: "About Page",
      value: "Clarity",
    },
    {
      key: "about.values.clarity.description",
      group: "About Page",
      value:
        "We cut through the noise, providing clear, unbiased information to help you make confident decisions.",
    },
    {
      key: "about.values.community.title",
      group: "About Page",
      value: "Community",
    },
    {
      key: "about.values.community.description",
      group: "About Page",
      value:
        "We believe in the power of creators helping creators. We're building a space for support and growth.",
    },
    {
      key: "about.values.empowerment.title",
      group: "About Page",
      value: "Empowerment",
    },
    {
      key: "about.values.empowerment.description",
      group: "About Page",
      value:
        "Our goal is to give you the tools and insights you need to turn your passion into a thriving business.",
    },
    {
      key: "about.team.title",
      group: "About Page",
      value: "Meet the Creators",
    },
    {
      key: "about.team.subtitle",
      group: "About Page",
      value: "We're a small, passionate team dedicated to your success.",
    },
    {
      key: "about.team.members",
      group: "About Page",
      type: "TEXTAREA",
      value: JSON.stringify(
        [
          {
            name: "Marcus Sterling",
            role: "Chief Executive Architect",
            avatar: "/ceo_avatar_1773077297883.png",
            dataAiHint: "ceo high-end portrait professional suit",
          },
          {
            name: "Elena Vance",
            role: "Head of Digital Strategy",
            avatar: "/marketing_avatar_1773077331514.png",
            dataAiHint: "marketing expert professional portrait",
          },
          {
            name: "Dr. Aris Thorne",
            role: "Chief Technology Officer",
            avatar: "/cto_avatar_1773077313648.png",
            dataAiHint: "cto tech expert professional portrait",
          },
        ],
        null,
        2,
      ),
    },
    { key: "about.cta.title", group: "About Page", value: "Ready to Join Us?" },
    {
      key: "about.cta.subtitle",
      group: "About Page",
      value:
        "Become part of a community of forward-thinking creators. Explore our tools and insights today.",
    },
    {
      key: "about.cta.button",
      group: "About Page",
      value: "Get Started for Free",
    },

    // Contact Page
    { key: "contact.hero.title", group: "Contact Page", value: "Get in Touch" },
    {
      key: "contact.hero.subtitle",
      group: "Contact Page",
      value:
        "We'd love to hear from you! Whether you have a question, feedback, or a partnership proposal, feel free to reach out.",
    },
    { key: "contact.email.title", group: "Contact Page", value: "Email" },
    {
      key: "contact.email.description",
      group: "Contact Page",
      value: "Send us an email for general inquiries.",
    },
    {
      key: "contact.email.value",
      group: "Contact Page",
      value: "hello@comparlify.com",
    },
    { key: "contact.phone.title", group: "Contact Page", value: "Phone" },
    {
      key: "contact.phone.description",
      group: "Contact Page",
      value: "Give us a call during business hours.",
    },
    {
      key: "contact.phone.value",
      group: "Contact Page",
      value: "+1 (234) 567-890",
    },
    { key: "contact.office.title", group: "Contact Page", value: "Office" },
    {
      key: "contact.office.description",
      group: "Contact Page",
      value: "123 Creator Lane, Suite 100\nInnovation City, 12345",
    },

    // Privacy Page
    {
      key: "privacy.policy",
      group: "Privacy Page",
      type: "MARKDOWN",
      value: `
Your privacy is important to us. It is Comparlify's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.

## 1. Information We Collect
We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.

### Log Data
When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.

### Personal Information
We may ask for personal information, such as your: Name, Email, Social media profiles, Date of birth, Phone/mobile number.

## 2. How We Use Your Information
We may use the information we collect for various purposes, including to:
<ul>
  <li>Provide, operate, and maintain our website</li>
  <li>Improve, personalize, and expand our website</li>
  <li>Understand and analyze how you use our website</li>
  <li>Develop new products, services, features, and functionality</li>
  <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
  <li>Send you emails</li>
  <li>Find and prevent fraud</li>
</ul>

## 3. Security of Your Personal Information
We retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.

## 4. Links to Other Sites
Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.

## 5. Changes to Our Privacy Policy
We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website.

## 6. Contact Us
If you have any questions about our privacy policy, please contact us at <a href="mailto:privacy@comparlify.com">privacy@comparlify.com</a>.
`,
    },

    // Blog Page Content
    { key: "blog.hero.title", group: "Blog Page", value: "Creator Insights" },
    {
      key: "blog.hero.subtitle",
      group: "Blog Page",
      value:
        "Actionable advice, deep dives, and growth strategies for the modern course creator.",
    },
    { key: "blog.empty.title", group: "Blog Page", value: "No Posts Found" },
    {
      key: "blog.empty.subtitle",
      group: "Blog Page",
      value: "Try adjusting your search or filters. Or check back soon!",
    },
    { key: "blog.post.backLink", group: "Blog Page", value: "Back to Blog" },
    {
      key: "blog.post.relatedTitle",
      group: "Blog Page",
      value: "Related Posts",
    },
    {
      key: "blog.post.preview.title",
      group: "Blog Page",
      value: "Preview Mode",
    },
    {
      key: "blog.post.preview.subtitle",
      group: "Blog Page",
      value: "This is a draft post and is not visible to the public.",
    },
    {
      key: "blog.post.preview.exitButton",
      group: "Blog Page",
      value: "Exit Preview",
    },

    // Comparison Page Content
    {
      key: "compare.hero.title",
      group: "Comparison Page",
      value: "Course Platform Face-Off",
    },
    {
      key: "compare.hero.subtitle",
      group: "Comparison Page",
      value:
        "We've put the top platforms head-to-head. Get unbiased, in-depth analysis to make the right choice.",
    },
    {
      key: "compare.empty.title",
      group: "Comparison Page",
      value: "No Comparisons Found",
    },
    {
      key: "compare.empty.subtitle",
      group: "Comparison Page",
      value: "Try adjusting your search or filters. Or check back soon!",
    },
    {
      key: "compare.detail.backLink",
      group: "Comparison Page",
      value: "Back to All Comparisons",
    },
    {
      key: "compare.detail.glance.title",
      group: "Comparison Page",
      value: "At a Glance",
    },
    {
      key: "compare.detail.ratings.title",
      group: "Comparison Page",
      value: "Ratings Breakdown",
    },
    {
      key: "compare.detail.ratings.chartTitle",
      group: "Comparison Page",
      value: "Side-by-Side Ratings",
    },
    {
      key: "compare.detail.features.title",
      group: "Comparison Page",
      value: "Feature Comparison",
    },
    {
      key: "compare.detail.faq.title",
      group: "Comparison Page",
      value: "Frequently Asked Questions",
    },

    // Admin Settings
    {
      key: "settings.email.fromName",
      group: "Email Settings",
      value: "Comparlify",
    },
    {
      key: "settings.email.fromEmail",
      group: "Email Settings",
      value: "noreply@comparlify.com",
    },
    {
      key: "settings.code.head",
      group: "Code Injection",
      type: "TEXTAREA",
      value: "",
    },
    {
      key: "settings.code.body",
      group: "Code Injection",
      type: "TEXTAREA",
      value: "",
    },

    // Legal Pages
    {
      key: "legal.terms-of-service",
      group: "Legal Pages",
      type: "MARKDOWN",
      value: `
# Terms of Service

**Last Updated:** ${new Date().toLocaleDateString()}

Welcome to Comparlify! These terms and conditions outline the rules and regulations for the use of Comparlify's Website, located at comparlify.com.

By accessing this website we assume you accept these terms and conditions. Do not continue to use Comparlify if you do not agree to take all of the terms and conditions stated on this page.

... (full terms content) ...
`,
    },
    {
      key: "legal.sponsor-policy",
      group: "Legal Pages",
      type: "MARKDOWN",
      value: `
# Sponsor & Affiliate Policy

**Last Updated:** ${new Date().toLocaleDateString()}

At Comparlify, our mission is to provide clear, unbiased, and valuable information to course creators. To support our work and keep our content free, we may partner with companies through sponsorships or affiliate links. This policy outlines our commitment to transparency.

## Our Principles

1.  **Editorial Independence:** Our content is created independently. Sponsors do not influence our reviews, comparisons, or opinions.
2.  **Transparency:** We will always clearly disclose sponsored content or affiliate relationships.
3.  **Relevance:** We only partner with companies whose products or services we believe are genuinely valuable to our audience.

... (full policy content) ...
`,
    },
  ];
  for (const content of siteContent) {
    try {
      const existing = await prisma.siteContent.findUnique({
        where: { key: content.key },
      });
      if (existing) {
        continue;
      }
      if (isMongo) {
        await safeCreate("SiteContent", content);
      } else {
        await prisma.siteContent.create({
          data: content as any,
        });
      }
    } catch (e: any) {
      console.error(
        `   ❌ Failed to seed site content key '${content.key}': ${e.message}`,
      );
    }
  }
  console.log(`   ✓ Seeded ${siteContent.length} site content records.`);

  // --- 13. Seed News ---
  console.log("\n📰 Seeding News...");
  const newsData = {
    title: "Comparlify Launches New AI-Powered Tool Suite",
    slug: "comparlify-launches-ai-tools",
    content:
      "We're excited to announce a major update to our platform. Our new suite of AI-powered tools is designed to help course creators streamline their workflow and produce higher-quality content faster than ever before. From generating course outlines to scripting video lessons, these tools are your new creative co-pilot.",
    image: "https://picsum.photos/400/250?random=10",
    dataAiHint: "technology launch announcement",
    published: true,
  };
  const existingNews = await prisma.newsArticle.findUnique({ where: { slug: newsData.slug } });
  if (!existingNews) {
    if (isMongo) {
      await safeCreate("NewsArticle", { ...newsData, authorId: adminUser.id });
    } else {
      await prisma.newsArticle.create({ data: { ...newsData, authorId: adminUser.id } });
    }
    console.log(`   ✓ Seeded 1 news article.`);
  } else {
    console.log(`   ⏩ News article already seeded, skipping.`);
  }

  // --- 14. Seed Community ---
  console.log("\n💬 Seeding Community Forums...");
  let generalCategory: any = await prisma.forumCategory.findUnique({
    where: { slug: "general-discussion" },
  });
  if (!generalCategory) {
    if (isMongo) {
      generalCategory = await safeCreate("ForumCategory", {
        name: "General Discussion",
        slug: "general-discussion",
        description: "Talk about anything related to course creation.",
      });
    } else {
      generalCategory = await prisma.forumCategory.create({
        data: {
          name: "General Discussion",
          slug: "general-discussion",
          description: "Talk about anything related to course creation.",
        },
      });
    }
    console.log(`   ✓ Seeded 1 forum category.`);
  } else {
    console.log(`   ⏩ Forum category already seeded, skipping.`);
  }

  let introductionsTopic: any = await prisma.forumTopic.findFirst({
    where: { title: "Welcome! Introduce Yourself" },
  });

  if (!introductionsTopic) {
    if (isMongo) {
      introductionsTopic = await safeCreate("ForumTopic", {
        title: "Welcome! Introduce Yourself",
        content:
          "Welcome to the community! Take a moment to introduce yourself and tell us what you're working on.",
        authorId: adminUser.id,
        categoryId: generalCategory.id,
        status: "APPROVED",
      });
    } else {
      introductionsTopic = await prisma.forumTopic.create({
        data: {
          title: "Welcome! Introduce Yourself",
          content:
            "Welcome to the community! Take a moment to introduce yourself and tell us what you're working on.",
          authorId: adminUser.id,
          categoryId: generalCategory.id,
          status: "APPROVED",
        },
      });
    }
    console.log(`   ✓ Seeded 1 forum topic.`);

    if (isMongo) {
      await safeCreate("ForumPost", {
        content:
          "Hey everyone! I'm Comparlify Admin, and I'm building a course on woodworking for beginners. Excited to learn from you all!",
        authorId: comparlifyAdmin.id,
        topicId: introductionsTopic.id,
        status: "APPROVED",
      });
      await safeCreate("ForumPost", {
        content: "Welcome, Admin! Glad to have you here.",
        authorId: adminUser.id,
        topicId: introductionsTopic.id,
        status: "APPROVED",
      });
    } else {
      await prisma.forumPost.createMany({
        data: [
          {
            content:
              "Hey everyone! I'm Comparlify Admin, and I'm building a course on woodworking for beginners. Excited to learn from you all!",
            authorId: comparlifyAdmin.id,
            topicId: introductionsTopic.id,
            status: "APPROVED",
          },
          {
            content: "Welcome, Admin! Glad to have you here.",
            authorId: adminUser.id,
            topicId: introductionsTopic.id,
            status: "APPROVED",
          },
        ],
      });
    }
    console.log(`   ✓ Seeded 2 forum posts.`);
  } else {
    console.log(`   ⏩ Forum topic and posts already seeded, skipping.`);
  }

  // --- 15. Seed Images from /public/uploads ---
  console.log("\n🖼️ Seeding existing images from public/uploads...");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter((file) =>
      /\.(jpe?g|png|gif|webp|svg)$/i.test(file),
    );
    let newImagesCount = 0;

    for (const filename of imageFiles) {
      const existingImage = await prisma.image.findFirst({
        where: { filename },
      });

      if (!existingImage) {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);

        if (isMongo) {
          await safeCreate("Image", {
            filename,
            url: `/uploads/${filename}`,
            altText: filename
              .split(".")
              .slice(0, -1)
              .join(".")
              .replace(/[-_]/g, " "),
            size: stats.size,
            authorId: adminUser.id,
          });
        } else {
          await prisma.image.create({
            data: {
              filename,
              url: `/uploads/${filename}`,
              altText: filename
                .split(".")
                .slice(0, -1)
                .join(".")
                .replace(/[-_]/g, " "),
              size: stats.size,
              authorId: adminUser.id,
            },
          });
        }
        newImagesCount++;
      }
    }
    console.log(
      `   ✓ Found ${imageFiles.length} images, added ${newImagesCount} new records to the database.`,
    );
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log(
        "   - public/uploads directory not found, skipping image seeding.",
      );
    } else {
      console.error("   - Error seeding images from public/uploads:", error);
    }
  }

  // --- 16. Seed Initial Basic Creator Reviews ---
  console.log("\n📝 Seeding Initial Basic Creator Reviews...");
  const ghostPlat = await prisma.platform.findFirst({ where: { name: "Ghost" } });
  const substackPlat = await prisma.platform.findFirst({ where: { name: "Substack" } });
  const kajabiPlat = await prisma.platform.findFirst({ where: { name: "Kajabi" } });
  const teachablePlat = await prisma.platform.findFirst({ where: { name: "Teachable" } });

  if (ghostPlat) {
    const initialReviews = [
      {
        creatorName: "Independent Publisher",
        creatorEmail: "publisher@example.com",
        creatorSegment: "Newsletter Writer",
        audienceRange: "10K-50K",
        usageDurationMonths: 14,
        spendRange: "$50-$200/mo",
        currentPlatformId: ghostPlat.id,
        previousPlatformId: substackPlat?.id || null,
        selectionReason: "Eliminated the 10% Substack platform take fee and gained full HTML/CSS design sovereignty.",
        bottleneck: "Requires custom setup for complex multi-tier automated email sequences.",
        recommendationScore: 4.8,
        status: "PUBLISHED" as const,
        verificationStatus: "VERIFIED" as const,
        sourceType: "SEED" as const,
      },
      ...(kajabiPlat ? [{
        creatorName: "Academy Founder",
        creatorEmail: "academy@example.com",
        creatorSegment: "Course Creator",
        audienceRange: "10K-50K",
        usageDurationMonths: 24,
        spendRange: "$200-$500/mo",
        currentPlatformId: kajabiPlat.id,
        previousPlatformId: teachablePlat?.id || null,
        selectionReason: "Unified course hosting, email marketing, and landing pages into a single pipeline.",
        bottleneck: "Higher base tier monthly cost compared to individual specialized plugins.",
        recommendationScore: 4.6,
        status: "PUBLISHED" as const,
        verificationStatus: "VERIFIED" as const,
        sourceType: "SEED" as const,
      }] : [])
    ];

    for (const rev of initialReviews) {
      const existing = await prisma.creatorReview.findFirst({
        where: { currentPlatformId: rev.currentPlatformId, creatorName: rev.creatorName }
      });
      if (!existing) {
        await safeCreate("CreatorReview", rev);
      }
    }
  }

  console.log("\n🔄 Starting industrial data sync (Platforms, Comparisons, Blogs)...");
  await syncComparisonData();
  await syncBlogData();

  console.log("\n🎉 Seeding finished successfully!");
}

export const seed = async (skipCleanup = true) => {
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
