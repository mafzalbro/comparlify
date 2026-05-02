import "dotenv/config";
import {
  PrismaClient,
  Prisma,
  Role,
  ToolCategory,
  CommentStatus,
  ContentType,
  Post,
} from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

import { promises as fs } from "fs";
import path from "path";
import { syncComparisonData } from "../src/compare/sync";
import { syncBlogData } from "../src/blog/sync";

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
      // This might fail if the model doesn't exist in some versions, so we just log it.
      if (e.code !== "P2025") {
        // P2025 = Record to delete does not exist.
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

  // --- 2. Seed Users ---
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
  await prisma.user.createMany({ data: usersData });

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

  // --- 3. Seed Features and Categories ---
  console.log("\n✨ Seeding Features & Categories...");
  const categoriesData = [
    {
      name: "Core Course Features",
      features: [
        "Course Builder",
        "Video Hosting",
        "Quizzes & Surveys",
        "Assignments",
        "Certificates of Completion",
        "Content Dripping",
      ],
    },
    {
      name: "Site & Marketing",
      features: [
        "Website Builder",
        "Custom Domain",
        "Blogging",
        "Affiliate Marketing",
        "Email Marketing",
        "Sales & Coupons",
      ],
    },
    {
      name: "Student Experience",
      features: [
        "Community Forum",
        "Mobile App Access",
        "Live Classes / Webinars",
        "Student Dashboard",
      ],
    },
    {
      name: "Business & Analytics",
      features: [
        "Payment Gateways",
        "Advanced Analytics",
        "API Access",
        "App Integrations",
      ],
    },
  ];

  let totalFeatures = 0;
  for (const cat of categoriesData) {
    const category = await prisma.featureCategory.create({
      data: { name: cat.name },
    });
    await prisma.feature.createMany({
      data: cat.features.map((name) => ({ name, categoryId: category.id })),
    });
    totalFeatures += cat.features.length;
  }
  console.log(
    `   ✓ Seeded ${categoriesData.length} feature categories and ${totalFeatures} features.`,
  );

  // --- 4. Seed Platforms ---
  console.log("\n🚀 Seeding Platforms...");
  const allFeatures = await prisma.feature.findMany();
  const featureMap = new Map(allFeatures.map((f) => [f.name, f.id]));

  const platformsData: Omit<
    Prisma.PlatformCreateInput,
    "createdAt" | "updatedAt"
  >[] = [
    {
      name: "Teachable",
      website: "https://teachable.com",
      logoUrl: "/logos/teachable.svg",
      description:
        "Focuses on ease of use for starting creators. Great for simple course structures with solid marketing tools.",
      rating: 4.2,
      easeOfUse: 4.8,
      featuresRating: 4.0,
      support: 4.1,
    },
    {
      name: "Thinkific",
      website: "https://www.thinkific.com",
      logoUrl: "/logos/thinkific.svg",
      description:
        "Powerful and flexible platform with 0% transaction fees. Offers deep customization and an extensive app store.",
      rating: 4.6,
      easeOfUse: 4.5,
      featuresRating: 4.7,
      support: 4.6,
    },
    {
      name: "Kajabi",
      website: "https://kajabi.com",
      logoUrl: "/logos/kajabi.svg",
      description:
        "The premier all-in-one platform. Includes email marketing, funnels, and CRM in a premium closed ecosystem.",
      rating: 4.8,
      easeOfUse: 4.3,
      featuresRating: 4.9,
      support: 4.7,
    },
    {
      name: "Podia",
      website: "https://www.podia.com",
      logoUrl: "/logos/podia.svg",
      description:
        "Creator-friendly platform for courses and downloads. Focused on simplicity, affordability, and clean design.",
      rating: 4.5,
      easeOfUse: 4.9,
      featuresRating: 4.2,
      support: 4.5,
    },
    {
      name: "Skool",
      website: "https://www.skool.com",
      logoUrl: "/logos/skool.svg",
      description:
        "Community-first platform focused on gamification and engagement. Minimalist design with maximum social impact.",
      rating: 4.7,
      easeOfUse: 5.0,
      featuresRating: 3.8,
      support: 4.4,
    },
    {
      name: "Circle",
      website: "https://circle.so",
      logoUrl: "/logos/circle.svg",
      description:
        "The modern community platform for creators. Seamlessly combines discussions, events, and courses.",
      rating: 4.6,
      easeOfUse: 4.4,
      featuresRating: 4.5,
      support: 4.3,
    },
    {
      name: "LearnWorlds",
      website: "https://www.learnworlds.com",
      logoUrl: "/logos/learnworlds.svg",
      description:
        "Advanced course authoring with interactive video and SCORM support. Ideal for professional training sites.",
      rating: 4.4,
      easeOfUse: 3.5,
      featuresRating: 5.0,
      support: 4.2,
    },
    {
      name: "Gumroad",
      website: "https://gumroad.com",
      logoUrl: "/logos/gumroad.svg",
      description:
        "The simplest way to sell digital products and courses. Lightweight with a focus on quick setup and commerce.",
      rating: 4.1,
      easeOfUse: 4.9,
      featuresRating: 3.5,
      support: 3.8,
    },
    {
      name: "Mighty Networks",
      website: "https://www.mightynetworks.com",
      logoUrl: "/logos/mightynetworks.svg",
      description:
        "Build communities and courses on your own branded mobile apps. Strong focus on network effects.",
      rating: 4.3,
      easeOfUse: 3.8,
      featuresRating: 4.6,
      support: 4.1,
    },
  ];

  await prisma.platform.createMany({ data: platformsData });
  const createdPlatforms = await prisma.platform.findMany();
  console.log(`   ✓ Seeded ${createdPlatforms.length} platforms.`);

  // --- 4.1 Seed Pricing Tiers ---
  console.log("💳 Seeding Pricing Tiers...");
  const tiersData = {
    Teachable: [
      {
        name: "Free",
        monthlyPrice: 0,
        transactionFeePercent: 10,
        isPopular: false,
      },
      {
        name: "Basic",
        monthlyPrice: 39,
        transactionFeePercent: 5,
        isPopular: true,
        annualPriceMonthlyEquivalent: 33,
      },
      {
        name: "Pro",
        monthlyPrice: 119,
        transactionFeePercent: 0,
        isPopular: false,
        annualPriceMonthlyEquivalent: 99,
      },
    ],
    Thinkific: [
      {
        name: "Free",
        monthlyPrice: 0,
        transactionFeePercent: 0,
        isPopular: false,
      },
      {
        name: "Basic",
        monthlyPrice: 39,
        transactionFeePercent: 0,
        isPopular: false,
        annualPriceMonthlyEquivalent: 33,
      },
      {
        name: "Start",
        monthlyPrice: 74,
        transactionFeePercent: 0,
        isPopular: true,
        annualPriceMonthlyEquivalent: 62,
      },
      {
        name: "Grow",
        monthlyPrice: 149,
        transactionFeePercent: 0,
        isPopular: false,
        annualPriceMonthlyEquivalent: 124,
      },
    ],
    Kajabi: [
      {
        name: "Basic",
        monthlyPrice: 149,
        transactionFeePercent: 0,
        isPopular: true,
        annualPriceMonthlyEquivalent: 119,
      },
      {
        name: "Growth",
        monthlyPrice: 199,
        transactionFeePercent: 0,
        isPopular: false,
        annualPriceMonthlyEquivalent: 159,
      },
      {
        name: "Pro",
        monthlyPrice: 399,
        transactionFeePercent: 0,
        isPopular: false,
        annualPriceMonthlyEquivalent: 319,
      },
    ],
    Podia: [
      {
        name: "Free",
        monthlyPrice: 0,
        transactionFeePercent: 8,
        isPopular: false,
      },
      {
        name: "Mover",
        monthlyPrice: 39,
        transactionFeePercent: 0,
        isPopular: true,
        annualPriceMonthlyEquivalent: 33,
      },
      {
        name: "Shaker",
        monthlyPrice: 89,
        transactionFeePercent: 0,
        isPopular: false,
        annualPriceMonthlyEquivalent: 75,
      },
    ],
    Skool: [
      {
        name: "All-in-One",
        monthlyPrice: 99,
        transactionFeePercent: 0,
        isPopular: true,
      },
    ],
    Circle: [
      {
        name: "Basic",
        monthlyPrice: 49,
        transactionFeePercent: 4,
        isPopular: false,
      },
      {
        name: "Professional",
        monthlyPrice: 99,
        transactionFeePercent: 0,
        isPopular: true,
      },
      {
        name: "Business",
        monthlyPrice: 219,
        transactionFeePercent: 0,
        isPopular: false,
      },
    ],
    LearnWorlds: [
      {
        name: "Starter",
        monthlyPrice: 29,
        transactionFeePercent: 5,
        isPopular: false,
      },
      {
        name: "Pro Trainer",
        monthlyPrice: 99,
        transactionFeePercent: 0,
        isPopular: true,
      },
      {
        name: "Learning Center",
        monthlyPrice: 299,
        transactionFeePercent: 0,
        isPopular: false,
      },
    ],
    Gumroad: [
      {
        name: "Simple",
        monthlyPrice: 0,
        transactionFeePercent: 10,
        isPopular: true,
      },
    ],
    "Mighty Networks": [
      {
        name: "Community",
        monthlyPrice: 39,
        transactionFeePercent: 3,
        isPopular: false,
      },
      {
        name: "Business",
        monthlyPrice: 119,
        transactionFeePercent: 2,
        isPopular: true,
      },
    ],
  };

  let tierCount = 0;
  for (const platform of createdPlatforms) {
    const platformTiers = tiersData[platform.name as keyof typeof tiersData];
    if (platformTiers) {
      await prisma.pricingTier.createMany({
        data: platformTiers.map((t) => ({ ...t, platformId: platform.id })),
      });
      tierCount += platformTiers.length;
    }
  }
  console.log(`   ✓ Seeded ${tierCount} pricing tiers.`);

  // --- 5. Seed Platform Features ---
  console.log("🔗 Seeding Platform Features...");
  const platformFeatureData = {
    Teachable: {
      "Course Builder": true,
      "Video Hosting": true,
      "Quizzes & Surveys": true,
      Assignments: false,
      "Certificates of Completion": true,
      "Content Dripping": true,
      "Website Builder": true,
      "Custom Domain": true,
      Blogging: true,
      "Affiliate Marketing": true,
      "Email Marketing": true,
      "Sales & Coupons": true,
      "Community Forum": false,
      "Mobile App Access": { hasFeature: true, details: "iOS only" },
      "Live Classes / Webinars": false,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": true,
      "API Access": { hasFeature: true, details: "On Pro plan+" },
      "App Integrations": true,
    },
    Thinkific: {
      "Course Builder": true,
      "Video Hosting": true,
      "Quizzes & Surveys": true,
      Assignments: true,
      "Certificates of Completion": true,
      "Content Dripping": true,
      "Website Builder": true,
      "Custom Domain": true,
      Blogging: false,
      "Affiliate Marketing": true,
      "Email Marketing": false,
      "Sales & Coupons": true,
      "Community Forum": true,
      "Mobile App Access": true,
      "Live Classes / Webinars": true,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": true,
      "API Access": true,
      "App Integrations": true,
    },
    Kajabi: {
      "Course Builder": true,
      "Video Hosting": true,
      "Quizzes & Surveys": true,
      Assignments: true,
      "Certificates of Completion": true,
      "Content Dripping": true,
      "Website Builder": true,
      "Custom Domain": true,
      Blogging: true,
      "Affiliate Marketing": true,
      "Email Marketing": true,
      "Sales & Coupons": true,
      "Community Forum": true,
      "Mobile App Access": true,
      "Live Classes / Webinars": true,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": true,
      "API Access": true,
      "App Integrations": true,
    },
    Podia: {
      "Course Builder": true,
      "Video Hosting": true,
      "Quizzes & Surveys": { hasFeature: true, details: "Simple quizzes" },
      Assignments: false,
      "Certificates of Completion": false,
      "Content Dripping": true,
      "Website Builder": true,
      "Custom Domain": true,
      Blogging: false,
      "Affiliate Marketing": true,
      "Email Marketing": true,
      "Sales & Coupons": true,
      "Community Forum": true,
      "Mobile App Access": false,
      "Live Classes / Webinars": true,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": false,
      "API Access": false,
      "App Integrations": false,
    },
    Skool: {
      "Course Builder": true,
      "Video Hosting": false,
      "Quizzes & Surveys": false,
      Assignments: false,
      "Certificates of Completion": false,
      "Content Dripping": true,
      "Website Builder": false,
      "Custom Domain": true,
      Blogging: false,
      "Affiliate Marketing": false,
      "Email Marketing": false,
      "Sales & Coupons": false,
      "Community Forum": true,
      "Mobile App Access": true,
      "Live Classes / Webinars": false,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": true,
      "API Access": true,
      "App Integrations": true,
    },
    Circle: {
      "Course Builder": true,
      "Video Hosting": true,
      "Quizzes & Surveys": true,
      Assignments: true,
      "Certificates of Completion": true,
      "Content Dripping": true,
      "Website Builder": true,
      "Custom Domain": true,
      Blogging: false,
      "Affiliate Marketing": false,
      "Email Marketing": true,
      "Sales & Coupons": true,
      "Community Forum": true,
      "Mobile App Access": true,
      "Live Classes / Webinars": true,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": true,
      "API Access": true,
      "App Integrations": true,
    },
    LearnWorlds: {
      "Course Builder": true,
      "Video Hosting": true,
      "Quizzes & Surveys": true,
      Assignments: true,
      "Certificates of Completion": true,
      "Content Dripping": true,
      "Website Builder": true,
      "Custom Domain": true,
      Blogging: true,
      "Affiliate Marketing": true,
      "Email Marketing": true,
      "Sales & Coupons": true,
      "Community Forum": true,
      "Mobile App Access": true,
      "Live Classes / Webinars": true,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": true,
      "API Access": true,
      "App Integrations": true,
    },
    Gumroad: {
      "Course Builder": true,
      "Video Hosting": true,
      "Quizzes & Surveys": false,
      Assignments: false,
      "Certificates of Completion": false,
      "Content Dripping": false,
      "Website Builder": false,
      "Custom Domain": true,
      Blogging: false,
      "Affiliate Marketing": true,
      "Email Marketing": true,
      "Sales & Coupons": true,
      "Community Forum": false,
      "Mobile App Access": false,
      "Live Classes / Webinars": false,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": true,
      "API Access": true,
      "App Integrations": true,
    },
    "Mighty Networks": {
      "Course Builder": true,
      "Video Hosting": true,
      "Quizzes & Surveys": true,
      Assignments: true,
      "Certificates of Completion": true,
      "Content Dripping": true,
      "Website Builder": true,
      "Custom Domain": true,
      Blogging: false,
      "Affiliate Marketing": false,
      "Email Marketing": true,
      "Sales & Coupons": true,
      "Community Forum": true,
      "Mobile App Access": true,
      "Live Classes / Webinars": true,
      "Student Dashboard": true,
      "Payment Gateways": true,
      "Advanced Analytics": true,
      "API Access": true,
      "App Integrations": true,
    },
  };

  let platformFeatureCount = 0;
  for (const platform of createdPlatforms) {
    const features =
      platformFeatureData[platform.name as keyof typeof platformFeatureData];
    for (const [featureName, value] of Object.entries(features)) {
      const featureId = featureMap.get(featureName);
      if (featureId) {
        const hasFeature =
          typeof value === "boolean" ? value : value.hasFeature;
        const details =
          typeof value === "object" && value.details ? value.details : null;
        await prisma.platformFeature.create({
          data: { platformId: platform.id, featureId, hasFeature, details },
        });
        platformFeatureCount++;
      }
    }
  }
  console.log(`   ✓ Seeded ${platformFeatureCount} platform features.`);

  // --- 6. Seed Blog Post Categories ---
  console.log("\n📚 Seeding Blog Post Categories...");
  const postCategoryData = [
    { name: "Platform Guides", slug: "platform-guides" },
    { name: "Course Creation", slug: "course-creation" },
    { name: "Marketing", slug: "marketing" },
    { name: "Tech Trends", slug: "tech-trends" },
  ];
  await prisma.postCategory.createMany({ data: postCategoryData });
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
    const { categoryName, authorId, ...rest } = postsData[i];
    const categoryId = postCategoryMap.get(categoryName);
    if (!categoryId) {
      console.warn(
        `Category '${categoryName}' not found for post '${postsData[i].title}'. Skipping post.`,
      );
      continue;
    }
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
      authorId: charlieUser.id,
      status: CommentStatus.APPROVED,
    },
    {
      content:
        "Great article. What are your thoughts on Kajabi's price point for new creators? Seems a bit steep.",
      postId: post1.id,
      authorId: bobUser.id,
      status: CommentStatus.PENDING,
    },
    {
      content:
        "These are fantastic ideas for engagement. I'm definitely going to try adding more interactive quizzes.",
      postId: post2.id,
      authorId: charlieUser.id,
      status: CommentStatus.APPROVED,
    },
    {
      content: "I don't agree with point #3.",
      postId: post2.id,
      authorId: bobUser.id,
      status: CommentStatus.REJECTED,
    },
  ];
  await prisma.comment.createMany({ data: commentData });
  console.log(`   ✓ Seeded ${commentData.length} comments.`);

  // --- 9. Seed Comparison Categories ---
  console.log("\n⚖️ Seeding Comparison Categories...");
  const compCategoryData = [
    { name: "Flagship Showdowns", slug: "flagship-showdowns" },
    { name: "All-in-One vs. Standalone", slug: "all-in-one-vs-standalone" },
  ];
  await prisma.comparisonCategory.createMany({ data: compCategoryData });
  const compCategories = await prisma.comparisonCategory.findMany();
  console.log(`   ✓ Seeded ${compCategories.length} comparison categories.`);
  const compCategoryMap = new Map(compCategories.map((c) => [c.name, c.id]));

  // --- 10. Seed Comparisons ---
  console.log("🆚 Seeding Comparisons...");
  const platformTeachable = createdPlatforms.find(
    (p) => p.name === "Teachable",
  )!;
  const platformThinkific = createdPlatforms.find(
    (p) => p.name === "Thinkific",
  )!;

  const explicitComparisons = [
    {
      title: "Teachable vs. Thinkific: The Ultimate 2024 Showdown",
      slug: "teachable-vs-thinkific",
      summary:
        "Battle of the industry giants: ease of use vs. 0% transaction fees.",
      platformA: "Teachable",
      platformB: "Thinkific",
      category: "Flagship Showdowns",
      introduction:
        "Choosing between Teachable and Thinkific is a common dilemma...",
      conclusion:
        "For beginners, Teachable is great. For scaling, Thinkific wins on fees.",
      facts: [
        { title: "Best For", a: "Beginners", b: "Scaling Schools" },
        { title: "Transaction Fees", a: "1% - 10%", b: "0%" },
        { title: "Custom Domain", a: "Paid Plans", b: "All Plans" },
      ],
    },
    {
      title: "Skool vs. Circle: The Community Battle",
      slug: "skool-vs-circle",
      summary:
        "Gamification and simplicity vs. Enterprise-grade community features.",
      platformA: "Skool",
      platformB: "Circle",
      category: "Flagship Showdowns",
      introduction:
        "Community-led growth is the current meta. But should you choose Skool or Circle?",
      conclusion:
        "Choose Skool for high engagement, Circle for professional branding.",
      facts: [
        { title: "Gamification", a: "Native leaderboards", b: "Moderate" },
        { title: "App Experience", a: "Highly Rated", b: "IOS/Android" },
        { title: "Course Engine", a: "Sleek/Basic", b: "Advanced/Modular" },
      ],
    },
    {
      title: "Kajabi vs. Podia: The All-in-One Choice",
      slug: "kajabi-vs-podia",
      summary:
        "High-end marketing automation vs. the creator-friendly affordable alternative.",
      platformA: "Kajabi",
      platformB: "Podia",
      category: "All-in-One vs. Standalone",
      introduction:
        "Do you need a Ferrari or a reliable Tesla? We compare the two most popular all-in-one platforms.",
      conclusion:
        "Kajabi for those with a high budget, Podia for everyone else.",
      facts: [
        { title: "Email Marketing", a: "Full Automation", b: "Standard" },
        { title: "Pricing", a: "$149+/mo", b: "$39+/mo" },
        { title: "Complexity", a: "High", b: "Very Low" },
      ],
    },
    {
      title: "Gumroad vs. Teachable: Digital Sales Faceoff",
      slug: "gumroad-vs-teachable",
      summary: "Lightweight sales vs. structured course hosting.",
      platformA: "Gumroad",
      platformB: "Teachable",
      category: "All-in-One vs. Standalone",
      introduction:
        "Selling your first digital product? Gumroad is the easy choice, but Teachable offers more growth.",
      conclusion:
        "Start on Gumroad, migrate to Teachable once you have a curriculum.",
      facts: [
        { title: "Platform Fee", a: "10% Flat", b: "Tiered" },
        { title: "Quizzes/Exams", a: "No", b: "Yes" },
        { title: "Setup Speed", a: "Instant", b: "Fast" },
      ],
    },
  ];

  const comparisonsToCreate = [...explicitComparisons];

  for (let i = 0; i < createdPlatforms.length; i++) {
    for (let j = i + 1; j < createdPlatforms.length; j++) {
      const pA = createdPlatforms[i];
      const pB = createdPlatforms[j];

      const exists = comparisonsToCreate.find(
        (c) =>
          (c.platformA === pA.name && c.platformB === pB.name) ||
          (c.platformA === pB.name && c.platformB === pA.name),
      );

      if (!exists) {
        comparisonsToCreate.push({
          title: `${pA.name} vs. ${pB.name}: Which is Better?`,
          slug: `${pA.name.toLowerCase().replace(/\s+/g, "-")}-vs-${pB.name.toLowerCase().replace(/\s+/g, "-")}`,
          summary: `A comprehensive comparison between ${pA.name} and ${pB.name} for modern course creators and community builders.`,
          platformA: pA.name,
          platformB: pB.name,
          category: "All-in-One vs. Standalone",
          introduction: `Deciding whether to use ${pA.name} or ${pB.name} depends heavily on your specific needs, budget, and future growth plans.`,
          conclusion: `Both ${pA.name} and ${pB.name} offer excellent features, but the right choice depends on your prioritization of ease of use and pricing.`,
          facts: [
            { title: "Users Rating", a: `${pA.rating}/5`, b: `${pB.rating}/5` },
            {
              title: "Ease of Use",
              a: `${pA.easeOfUse}/5`,
              b: `${pB.easeOfUse}/5`,
            },
            {
              title: "Features Rating",
              a: `${pA.featuresRating}/5`,
              b: `${pB.featuresRating}/5`,
            },
          ],
        });
      }
    }
  }

  for (const cData of comparisonsToCreate) {
    const pA = createdPlatforms.find((p) => p.name === cData.platformA);
    const pB = createdPlatforms.find((p) => p.name === cData.platformB);
    const catId = compCategoryMap.get(cData.category);

    if (pA && pB && catId) {
      await prisma.comparison.create({
        data: {
          title: cData.title,
          slug: cData.slug,
          summary: cData.summary,
          platformAId: pA.id,
          platformBId: pB.id,
          categoryId: catId,
          introduction: cData.introduction,
          conclusion: cData.conclusion,
          published: true,
          facts: {
            create: cData.facts.map((f) => ({
              title: f.title,
              platformAValue: f.a,
              platformBValue: f.b,
            })),
          },
        },
      });
    }
  }

  console.log(`   ✓ Seeded ${comparisonsToCreate.length} comparisons.`);

  // --- 11. Seed AI Tools ---
  console.log("\n🤖 Seeding AI Tools...");
  const toolsData: Omit<
    Prisma.ToolCreateInput,
    "id" | "createdAt" | "updatedAt"
  >[] = [
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
  await prisma.tool.createMany({ data: toolsData });
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
      await prisma.siteContent.upsert({
        where: { key: content.key },
        update: content as any,
        create: content as any,
      });
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
    authorId: adminUser.id,
  };
  await prisma.newsArticle.create({ data: newsData });
  console.log(`   ✓ Seeded 1 news article.`);

  // --- 14. Seed Community ---
  console.log("\n💬 Seeding Community Forums...");
  const generalCategory = await prisma.forumCategory.create({
    data: {
      name: "General Discussion",
      slug: "general-discussion",
      description: "Talk about anything related to course creation.",
    },
  });
  console.log(`   ✓ Seeded 1 forum category.`);

  const introductionsTopic = await prisma.forumTopic.create({
    data: {
      title: "Welcome! Introduce Yourself",
      content:
        "Welcome to the community! Take a moment to introduce yourself and tell us what you're working on.",
      authorId: adminUser.id,
      categoryId: generalCategory.id,
      status: "APPROVED",
    },
  });
  console.log(`   ✓ Seeded 1 forum topic.`);

  await prisma.forumPost.createMany({
    data: [
      {
        content:
          "Hey everyone! I'm Bob, and I'm building a course on woodworking for beginners. Excited to learn from you all!",
        authorId: bobUser.id,
        topicId: introductionsTopic.id,
        status: "APPROVED",
      },
      {
        content: "Welcome, Bob! Glad to have you here.",
        authorId: adminUser.id,
        topicId: introductionsTopic.id,
        status: "APPROVED",
      },
    ],
  });
  console.log(`   ✓ Seeded 2 forum posts.`);

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

  console.log("\n🔄 Starting industrial data sync (Platforms, Comparisons, Blogs)...");
  await syncComparisonData();
  await syncBlogData();

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
