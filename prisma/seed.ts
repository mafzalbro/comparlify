import "dotenv/config";
import { fileURLToPath } from "url";
import { allPlatforms } from "../src/compare/platforms";
import {
  PrismaClient,
  Prisma,
  Role,
  CommentStatus,
  ContentType,
  Post,
} from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
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
  // --- 2.1 Seed High-Fidelity Platforms (36 Entities) ---
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
    });

    for (const feat of data.features) {
      const category = await prisma.featureCategory.upsert({
        where: { name: feat.categoryName },
        update: {},
        create: { name: feat.categoryName },
      });

      let existingFeature = await prisma.feature.findFirst({
        where: { name: feat.featureName, categoryId: category.id },
      });

      if (!existingFeature) {
        existingFeature = await prisma.feature.create({
          data: { name: feat.featureName, categoryId: category.id },
        });
      }

      await prisma.platformFeature.create({
        data: {
          platformId: platform.id,
          featureId: existingFeature.id,
          hasFeature: feat.hasFeature,
          details: feat.details,
        },
      });
    }
  }

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
        "Choosing between Teachable and Thinkific is the 'original' creator dilemma. In 2026, the landscape has shifted, but these two remain the foundation of the online school model. We analyze which infrastructure best supports your long-term sovereignty.",
      content: `## The Institutional Battle: User Experience vs. Profit Margins

For over a decade, the choice between Teachable and Thinkific has defined the "Online School" market. While they appear similar on the surface, their underlying philosophies regarding **Transaction Fees** and **Customization** create vastly different economic outcomes for the creator.

### The Teachable Philosophy: Speed to Market
Teachable is built for the creator who wants to launch *yesterday*. Its interface is famously intuitive, allowing a new educator to upload their first module and start accepting payments in under an hour. 

However, this speed comes with a "Tax." Teachable's lower tiers include transaction fees (ranging from 1% to 10%), which can significantly eat into your margins as you scale. In 2026, Teachable's **"Smart-Checkout"** technology helps mitigate this by increasing conversion rates through AI-driven upsells and one-click payments, often recapturing the revenue lost to fees through sheer volume.

### The Thinkific Philosophy: Operational Control
Thinkific is the platform for the "Scaling School." Its most famous advantage is the **0% Transaction Fee** across all paid plans. If you are doing $10,000+ per month in revenue, the savings on Thinkific compared to Teachable's lower tiers can pay for your entire tech stack.

Thinkific’s 2026 **"App Store"** ecosystem is another major differentiator. While Teachable is a "walled garden," Thinkific allows you to plug in hundreds of third-party apps for marketing, student engagement, and analytics. It is the platform for the creator who wants to build a custom-engineered academy rather than a standardized shop.

---

## Scenario Analysis: Strategic Paths to Sovereignty

### Scenario A: The First-Time Course Creator (The Bootstrapper)
**Profile:** A creator with an audience but no product, looking to test the waters with a small course.
**The Solution:** **Teachable**.

You don't need a complex app store; you need a dashboard that doesn't confuse you. Teachable’s "Free" and "Basic" plans allow you to start with minimal upfront investment. The transaction fees are a fair trade for the lack of technical headache.

### Scenario B: The Established Academy (The Scaler)
**Profile:** An educator with multiple courses and a high volume of monthly sales.
**The Solution:** **Thinkific**.

Once you have a predictable revenue stream, 0% fees become a non-negotiable requirement. Thinkific's robust site builder also allows you to create a more "Institutional" feel, which is critical for selling to B2B or high-end corporate clients.

---

## Technical Architecture & Fee Comparison

| Metric | Teachable | Thinkific |
|--------|-----------|-----------|
| **Transaction Fees** | 1% to 10% (Lower Tiers) | 0% (All Paid Plans) |
| **Custom Domain** | Paid Plans | All Plans |
| **Site Builder** | Simple / Clean | Advanced / Modular |
| **Integrations** | Moderate (Zapier-heavy) | High (Native App Store) |
| **Bulk Student Import**| High-End Plans | All Paid Plans |

---

## The Verdict: The Scaling Score for 2026

In 2026, **Teachable** is the winner for **Velocity and Ease**, while **Thinkific** is the winner for **Profit Optimization and Scalability**.

### Conclusion
Choose **Teachable** if you want the most frictionless path to your first $1,000.
Choose **Thinkific** if you are planning to build a $100,000+ per year educational empire.`,
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
        "In 2026, the creator economy has shifted from 'Content-First' to 'Community-First'. But where should you host your movement? We analyze Skool and Circle—the two dominant architectures for community-led growth.",
      content: `## The Community Thesis: Engagement vs. Branding

The choice between Skool and Circle is a choice between **Psychology** and **Aesthetics**. Skool is designed to keep people *doing* things, while Circle is designed to keep people *belonging* to things.

### The Skool Philosophy: Gamification as Core Utility
Skool, founded by Sam Ovens, is built on a singular, obsessive goal: **Engagement**. It stripped away every feature that didn't contribute to the "Community Feedback Loop." There are no custom fonts, no complex sidebar layouts, and no third-party app integrations that distract from the feed. 

In 2026, Skool's **"Engagement Games"** are the industry benchmark. By turning the community into a leaderboard-driven experience, it creates a "Dopamine-Laced" learning environment. Students don't just consume content; they compete to unlock it. This gamified architecture is perfect for creators who want to build "High-Velocity" masterminds where student results are the primary marketing asset.

### The Circle Philosophy: The White-Label Infrastructure
Circle is built for the "Modern Brand." It views community as a sophisticated, multi-modal asset that should look and feel like a proprietary social network. It is ideal for the established brand or the high-end membership site that requires a specific aesthetic and deep technical integration.

Circle’s 2026 update, **"Circle Enterprise,"** allows for deep white-labeling, custom CSS, and a sophisticated API that connects to your existing SaaS stack. It is the platform for the creator who wants their community to feel like a "Private Club" rather than a gamified app.

---

## Scenario Analysis: Strategic Paths to Community Sovereignty

### Scenario A: The High-Ticket Coach (The Results Architect)
**Profile:** A coach selling a $5,000+ program where student completion is everything.
**The Solution:** **Skool**.

If your business relies on students actually finishing the work and getting results, Skool’s simplicity is your greatest weapon. There is no technical friction. Every student sees the same feed, the same calendar, and the same leaderboards. The "Course" is secondary to the "Community."

### Scenario B: The Legacy Brand (The Membership Hub)
**Profile:** An established company with an existing ecosystem (e.g., a software company, a professional association) looking to add a social layer.
**The Solution:** **Circle**.

You need your community to look like *you*, not like Skool. Circle allows you to maintain brand continuity. Features like "Spaces," "Groups," and the ability to host live streams natively make it a complete ecosystem. For the legacy brand, Circle provides the professional polish required for corporate-level membership.

---

## Technical Architecture & Feature Comparison

| Feature | Skool | Circle |
|---------|-------|--------|
| **Gamification** | Level-based unlocking (Native) | Basic badges |
| **Course Engine** | Ultra-Simple / Integrated | Advanced / Modular |
| **Live Streaming** | Via Zoom/YouTube | Native high-fidelity |
| **Customization** | Zero (Strategic Minimalism) | High (White-Label) |
| **Mobile App** | World-Class (Native) | Custom-Branded (Enterprise) |

---

## The Verdict: The Engagement Score for 2026

In 2026, **Skool** is the undisputed king of **User Retention and Engagement**, while **Circle** is the leader in **Brand Customization and Modular Growth**.

### Conclusion
Choose **Skool** if you want to run a "Game" that your students love to play.
Choose **Circle** if you want to build a "Digital Home" that your members are proud to belong to.`,
      conclusion:
        "Choose Skool for high engagement and 'Game' mechanics; Choose Circle for professional white-labeling and multi-modal community building.",
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
        "Do you need a Ferrari or a reliable Tesla? We compare the two most popular all-in-one platforms in 2026. This intelligence report breaks down the financial and operational reality of running your business on Kajabi vs Podia.",
      content: `## The All-in-One Thesis: Automation vs. Simplicity

The "All-in-One" market is divided between two philosophies: **Industrial Power** and **Creator Zen**. Kajabi represents the industrial-strength marketing machine, while Podia represents the streamlined, intuitive cockpit.

### The Kajabi Philosophy: The Marketing Engine
Kajabi is the undisputed heavyweight champion of the all-in-one space. It doesn't just host your courses; it builds your entire sales machine. In 2026, its **"Pipeline Mastery"** feature allows you to build multi-step, high-conversion funnels that would usually require three separate SaaS tools (ClickFunnels, ActiveCampaign, and Teachable).

Kajabi's architecture is built for the "High-LTV" creator—those whose students are worth $1,000 to $10,000. Every pixel is optimized for conversion. With its 2026 **"AI Sales Agent"** integration, Kajabi can automatically adjust your email sequences based on student behavior, creating a "Silent Salesman" that operates 24/7.

### The Podia Philosophy: The Frictionless Office
Podia is built for the creator who hates tech. It views software as a utility that should "get out of the way." Podia's 2026 update, **"Podia Creator Site,"** has made it the fastest way to launch a beautiful, professional digital storefront. 

While Kajabi focuses on "The Funnel," Podia focuses on "The Connection." It includes everything—courses, webinars, downloads, and community—in a single, beautiful interface that requires zero design skills. It is the platform for the "Sovereign Solopreneur" who wants a professional home without the $149/month price tag or the steep learning curve.

---

## Scenario Analysis: Strategic Paths to All-in-One Sovereignty

### Scenario A: The Scaling Entrepreneur (The Funnel Expert)
**Profile:** A creator with a proven offer who needs to scale through complex automation and webinars.
**The Solution:** **Kajabi**.

If your business lives or dies by your email automation and landing page conversion rates, Kajabi is the only choice. The cost ($149+) is easily justified by the replacement of other tools. You gain a level of "Marketing Intelligence" that Podia cannot match, allowing you to track exactly where every dollar of revenue is coming from.

### Scenario B: The Creative Multipotentialite (The Digital Shopkeeper)
**Profile:** A creator selling a mix of small courses, digital downloads, and coaching sessions.
**The Solution:** **Podia**.

You don't need a complex funnel; you need a beautiful shop. Podia allows you to launch new products in minutes. The "Unlimited Everything" model on their higher tiers means you can experiment with 10 different course ideas without increasing your monthly overhead. For the creator who values speed and aesthetic simplicity, Podia is the superior asset.

---

## Technical Architecture & Operational Comparison

| Feature | Kajabi | Podia |
|---------|--------|-------|
| **Marketing Automation** | High (Visual Pipelines) | Moderate (Sequences) |
| **Website Builder** | Enterprise-Grade | Minimalist / Beautiful |
| **Email Marketing** | Built-in (Advanced) | Built-in (Friendly) |
| **Transaction Fees** | 0% | 0% (Paid Plans) |
| **Complexity** | High (Powerful) | Low (Intuitive) |

---

## The Verdict: The ROI Score for 2026

In 2026, **Kajabi** remains the leader for **Conversion Performance**, while **Podia** is the leader for **Operational Speed and Value**.

### Conclusion
Choose **Kajabi** if you are building an "Industrial Sales Machine."
Choose **Podia** if you are building a "Sovereign Digital Storefront."`,
      conclusion:
        "Kajabi for high-end automation and complex funnels; Podia for simplicity, aesthetics, and affordable all-in-one hosting.",
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
        "Selling your first digital product? We compare Gumroad’s radical simplicity with Teachable’s institutional depth. In 2026, the choice depends entirely on whether you are selling a 'File' or a 'Future'.",
      content: `## The Fulfillment Thesis: Delivery vs. Transformation

The choice between Gumroad and Teachable is the choice between **Commerce** and **Education**. Gumroad is a checkout page; Teachable is a classroom.

### The Gumroad Philosophy: Radical Frictionless Selling
Gumroad’s 2026 architecture is focused on one thing: **The Buy Button**. It is the absolute fastest way to put a price tag on a PDF, a video file, or a zip folder. There is no "Learning Management System" (LMS) to configure. You upload a file, set a price, and tweet the link.

Gumroad's **10% Flat Fee** (plus processing) is the "Sovereignty Tax" you pay for zero monthly subscriptions. For a creator with irregular launches or small digital products, this model is the most capital-efficient way to operate.

### The Teachable Philosophy: The Educational Journey
Teachable views the sale as the *beginning* of the relationship, not the end. When a student buys on Teachable, they aren't just downloading a file; they are entering a structured environment. Features like **Lesson Progress Tracking**, **Certificates**, and **Drip Content** are designed to ensure the student actually finishes the material.

In 2026, Teachable’s **"Outcome-Based Pricing"** tools allow creators to charge higher prices by proving the transformational nature of their content—something that is difficult to do on a simple file-delivery platform like Gumroad.

---

## Scenario Analysis: Strategic Paths to Sales Sovereignty

### Scenario A: The Digital Nomad (The Product Spitter)
**Profile:** A creator who launches 5-10 small products a year (templates, guides, short videos).
**The Solution:** **Gumroad**.

You don't need a course dashboard for a $19 PDF. Gumroad’s simplicity and lack of monthly fees allow you to be prolific without financial pressure.

### Scenario B: The Transformational Expert (The Teacher)
**Profile:** An expert selling a high-priced curriculum that requires student engagement.
**The Solution:** **Teachable**.

If you are selling a $497 "Video Editing Masterclass," your students will feel short-changed if they just get a download link. They need the "Academy" experience to justify the price point.

---

## Technical Architecture & Operational Comparison

| Feature | Gumroad | Teachable |
|---------|---------|-----------|
| **Primary Focus** | Sales Velocity | Student Success |
| **Course Player** | Minimalist / Linear | Advanced / Interactive |
| **Pricing Model** | 10% Flat (No Sub) | Monthly Sub + Variable Fees |
| **Affiliate System** | Built-in (Simple) | Built-in (Professional) |
| **Discovery** | High (Gumroad Discover) | Low (Sovereign Brand) |

---

## The Verdict: The Transaction Score for 2026

In 2026, **Gumroad** is the king of **Digital Commerce**, while **Teachable** is the king of **Online Education**.

### Conclusion
Choose **Gumroad** if you want to sell **Products**.
Choose **Teachable** if you want to sell **Transformations**.`,
      conclusion:
        "Start on Gumroad for small digital products; migrate to Teachable once you have a structured curriculum and high-ticket goals.",
      facts: [
        { title: "Platform Fee", a: "10% Flat", b: "Tiered" },
        { title: "Quizzes/Exams", a: "No", b: "Yes" },
        { title: "Setup Speed", a: "Instant", b: "Fast" },
      ],
    },
  ];

  const platforms_lookup = await prisma.platform.findMany();

  // 10.1 Create explicit comparisons
  for (const compData of explicitComparisons) {
    const pA = platforms_lookup.find((p) => p.name === compData.platformA);
    const pB = platforms_lookup.find((p) => p.name === compData.platformB);
    const categoryId = compCategoryMap.get(compData.category);

    if (pA && pB && categoryId) {
      await prisma.comparison.upsert({
        where: { slug: compData.slug },
        update: {
          title: compData.title,
          summary: compData.summary,
          platformAId: pA.id,
          platformBId: pB.id,
          categoryId: categoryId,
          introduction: compData.introduction,
          content: compData.content,
          conclusion: compData.conclusion,
          published: true,
        },
        create: {
          title: compData.title,
          slug: compData.slug,
          summary: compData.summary,
          platformAId: pA.id,
          platformBId: pB.id,
          categoryId: categoryId,
          introduction: compData.introduction,
          content: compData.content,
          conclusion: compData.conclusion,
          published: true,
        },
      });
    }
  }

  // Curated Strategic Comparison
  const get_plat = (name: string) =>
    platforms_lookup.find((p) => p.name === name);
  const pA_tp = get_plat("Teachable");
  const pB_tp = get_plat("Patreon");

  if (pA_tp && pB_tp) {
    await prisma.comparison.create({
      data: {
        title: "Teachable vs Patreon: The Definitive Creator Strategy Guide",
        slug: "teachable-vs-patreon",
        summary:
          "Direct Courses vs. Membership Communities. Which model scales your sovereignty?",
        platformAId: pA_tp.id,
        platformBId: pB_tp.id,
        categoryId:
          compCategoryMap.get("Flagship Showdowns") ||
          Array.from(compCategoryMap.values())[0],
        introduction:
          "Choosing between Teachable and Patreon is more than just a software decision; it is a choice between two fundamentally different business architectures. In 2026, the successful creator must decide whether they are building a school or a movement.",
        conclusion:
          "Use Teachable if you have a structured curriculum and want to sell high-ticket transformational assets. Use Patreon if you are a creative building a long-term membership community where the product is the recurring relationship.",
        published: true,
        content: `## The Strategic Divergence: Assets vs. Access

Choosing between Teachable and Patreon is more than just a software decision; it is a choice between two fundamentally different business architectures. In 2026, the successful creator must decide whether they are building a **School (Institutional Model)** or a **Movement (Community Model)**. This deep-dive intelligence report analyzes the economic, technical, and psychological factors that define these two giants.

### The Teachable Philosophy: Institutional Scaling
Teachable is built for the "Expert Economy." It views content as a structured, transformational asset that should be packaged, certified, and sold as a journey. It is ideal for the teacher who wants to build an academy. The infrastructure is designed to handle high-intent students who are investing significantly in their future. Features like lesson locking, course completion certificates, and advanced quiz logic ensure a pedagogical rigor that justifica premium pricing.

In 2026, Teachable has doubled down on its **"Sovereign Brand"** initiative. This means creators have unprecedented control over their data, checkout flows, and tax compliance. For the professional educator, Teachable isn't just a host; it's a back-office partner that handles the "unglamorous" side of education—VAT, global payouts, and student management—allowing the expert to focus on the curriculum.

### The Patreon Philosophy: Relationship Velocity
Patreon is built for the "Fan Economy." It views content as fuel for membership. It is optimized for creators who have a consistent creative output (artists, podcasters, writers) and want to monetize their most loyal 1% through recurring support. On Patreon, the value isn't just in the 'lesson'; it's in the 'proximity.' Supporters pay for early access, behind-the-scenes insights, and the feeling of being part of an inner circle. 

The technical friction is near-zero, focusing on a continuous stream of engagement rather than a static curriculum. Patreon's 2026 update introduced the **"Community Stream,"** a real-time engagement layer that allows creators to host audio-only rooms and private chat threads directly within the app, further distancing it from the "one-and-done" course model of Teachable.

---

## Scenario Analysis: Strategic Paths to Sovereignty

### Scenario A: The Career Transitioner (The Aspiring Teacher)
**Profile:** A former corporate leader transitioning to online education with a high-value skill set (e.g., Enterprise Sales, Data Science, Executive Coaching).
**The Solution:** **Teachable**.

If you are selling your professional expertise, you need to provide the professional infrastructure that matches your background. A student paying $997 for a "Data Engineering Masterclass" expects a structured dashboard, a clear roadmap, and a professional receipt for tax purposes. Patreon’s low-barrier entry ($5-$20) might inadvertently devalue your high-end intellectual property. Teachable allows you to maintain "Brand Gravitas" and implement complex sales funnels that move cold traffic to a high-ticket enrollment. 

**Expert Insight:** For the transitioner, the **LMS-native certificates** on Teachable are a critical psychological trigger for high-ticket buyers, providing tangible proof of investment that a Patreon "shout-out" simply cannot match.

### Scenario B: The Expanding Artist (The Scaler)
**Profile:** A creator with a massive existing audience on YouTube, TikTok, or Instagram looking for a home base to monetize loyal fans.
**The Solution:** **Patreon**.

You are already producing regular content and want a way to monetize that output directly without relying on fickle ad revenue. Patreon handles the complex psychology of "supporting the creator" better than any LMS. It turns your audience into a predictable monthly revenue stream. In 2026, the integration between Patreon and platforms like Discord or Spotify means you can provide "Multi-Channel Access" as a single perk, creating a social stickiness that a static course platform cannot replicate.

**Expert Insight:** The **"Recurring Revenue Floor"** provided by Patreon allows artists to take creative risks that would be too dangerous if they were reliant on individual course launches. It provides the "Creative Safety Net" required for long-term growth.

### Scenario C: The Failed Businessman (The Restructuring)
**Profile:** An entrepreneur who previously attempted to build a complex SaaS or a physical product business and hit a wall.
**The Solution:** **Teachable (Consulting-Hybrid)**.

Moving to a Teachable-based academy allows you to monetize your "Lessons Learned." This is a classic "Sell the Shovel" strategy. You can package your failures and successes into a consulting-heavy course. Teachable allows you to focus 100% on the curriculum and 0% on the engineering. For the entrepreneur looking to rebuild capital quickly, the "High-Ticket Course" model on Teachable offers significantly higher margins than the "High-Volume Membership" model on Patreon.

---

## Technical Architecture & Monetization Engine Deep-Dive

### Data Sovereignty and Audience Ownership
In 2026, the "Golden Metric" for any creator is **Data Control**. 
- **Teachable** provides a full export of student data, including progress tracking and detailed engagement metrics. You own the relationship entirely, and you can pipe this data into external CRMs like HubSpot or ActiveCampaign.
- **Patreon** provides subscriber emails, but the "interaction data" is largely locked within their ecosystem. While you can message your fans, you are ultimately operating within Patreon's "rented space."

### The "Tax Nightmare" Solution
Global tax compliance is the silent killer of creator businesses.
- **Teachable:pay** acts as a tax gateway, handling VAT and sales tax in over 100 countries. For a solo creator, this feature alone is worth the subscription price.
- **Patreon** acts as the **Merchant of Record (MoR)**, meaning they are legally responsible for the transaction. This offers the ultimate "set it and forget it" tax peace of mind, although their percentage cut reflects this service.

---

## Industrial Facts and Economic Realities (2026 Data)

| Metric | Teachable | Patreon |
|--------|-----------|---------|
| **Monetization Model** | One-time / Installments | Monthly / Per-Creation |
| **Average Transaction** | $250 - $1,200 | $5 - $50 |
| **Platform Fees** | 0% (Pro) to 10% (Free) | 5% to 12% + Processing |
| **Global Tax Compliance** | Integrated (Teachable:pay) | Merchant of Record (Full) |
| **Video Infrastructure** | High-Fidelity LMS Native | External (Vimeo/YT/Upload) |
| **Custom Domain** | Yes (Sovereign Brand) | No (Platform Dependent) |

---

## The Verdict: The Sovereignty Score for 2026

In 2026, **Teachable** scores higher for **Financial Sovereignty** (High margin, brand ownership, data control), while **Patreon** scores higher for **Social Leverage** (Community energy, direct feedback loops, audience intimacy).

### Conclusion for the Modern Creator
If your business is built on **Transformation**, go with **Teachable**. You are selling a "Before and After."
If your business is built on **Relationship**, go with **Patreon**. You are selling "Proximity and Support."

Final Verdict: For those building a high-ticket educational empire, Teachable remains the gold standard for sovereign infrastructure. For those building a direct-to-fan creative engine, Patreon's simplicity and network effect are unbeatable.`,
        facts: {
          create: [
            {
              title: "Primary Model",
              platformAValue: "Academy/LMS",
              platformBValue: "Membership/Fan-Club",
            },
            {
              title: "Pricing Philosophy",
              platformAValue: "High-Ticket/Asset-Based",
              platformBValue: "Micro-Payments/Recurring",
            },
          ],
        },
      },
    });
  }

  console.log(`   ✓ Seeded ${explicitComparisons.length} comparisons.`);

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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}
