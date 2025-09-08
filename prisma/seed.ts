
"use server";
import prisma from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Start seeding...");

  // --- 1. Clean up existing data ---
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.platformFeature.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.featureCategory.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleaned up existing data.");

  // --- 2. Seed Users ---
  const usersData = [
    {
      name: "Afzal Creator",
      email: "mafzalbro@gmail.com",
      role: Role.ADMIN,
      onboarded: true,
    },
    {
      name: "Bob Builder",
      email: "maf415415@gmail.com",
      role: Role.USER,
      onboarded: false,
    },
    {
      name: "Charlie User",
      email: "ma4156250@gmail.com",
      role: Role.USER,
      onboarded: false,
    }
  ];
  await prisma.user.createMany({ data: usersData });
  
  const adminUser = await prisma.user.findUnique({ where: { email: 'mafzalbro@gmail.com' } });
  const bobUser = await prisma.user.findUnique({ where: { email: 'maf415415@gmail.com' } });
  const charlieUser = await prisma.user.findUnique({ where: { email: 'ma4156250@gmail.com' } });

  if (!adminUser || !bobUser || !charlieUser) {
    throw new Error("Failed to seed users correctly.");
  }
  
  console.log(`Seeded ${usersData.length} users.`);


  // --- 3. Seed Features and Categories ---
  const categoriesData = [
    { name: "Core Course Features", features: ["Course Builder", "Video Hosting", "Quizzes & Surveys", "Assignments", "Certificates of Completion", "Content Dripping"] },
    { name: "Site & Marketing", features: ["Website Builder", "Custom Domain", "Blogging", "Affiliate Marketing", "Email Marketing", "Sales & Coupons"] },
    { name: "Student Experience", features: ["Community Forum", "Mobile App Access", "Live Classes / Webinars", "Student Dashboard"] },
    { name: "Business & Analytics", features: ["Payment Gateways", "Advanced Analytics", "API Access", "App Integrations"] },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.featureCategory.create({
      data: { name: cat.name }
    });
    await prisma.feature.createMany({
      data: cat.features.map(name => ({ name, categoryId: category.id }))
    });
  }
  console.log("Seeded feature categories and features.");

  // --- 4. Seed Platforms ---
  const allFeatures = await prisma.feature.findMany();
  const featureMap = new Map(allFeatures.map(f => [f.name, f.id]));

  const platformsData: Omit<Prisma.PlatformCreateInput, 'createdAt' | 'updatedAt'>[] = [
    {
        name: "Teachable",
        website: "https://teachable.com",
        logoUrl: "/logos/teachable.svg",
        description: "A popular platform that focuses on ease of use for creators just starting out. Great for simple course structures.",
        rating: 4.2, easeOfUse: 4.8, featuresRating: 4.0, support: 4.1
    },
    {
        name: "Thinkific",
        website: "https://www.thinkific.com",
        logoUrl: "/logos/thinkific.svg",
        description: "A powerful and flexible platform that offers more customization options and advanced features for growing businesses.",
        rating: 4.6, easeOfUse: 4.5, featuresRating: 4.7, support: 4.6
    },
    {
        name: "Kajabi",
        website: "https://kajabi.com",
        logoUrl: "/logos/kajabi.svg",
        description: "An all-in-one platform that includes email marketing, website building, and sales funnels in addition to course hosting.",
        rating: 4.8, easeOfUse: 4.3, featuresRating: 4.9, support: 4.7
    },
    {
        name: "Podia",
        website: "https://www.podia.com",
        logoUrl: "/logos/podia.svg",
        description: "A creator-friendly platform for courses, digital downloads, and memberships with a focus on simplicity and affordability.",
        rating: 4.5, easeOfUse: 4.9, featuresRating: 4.2, support: 4.5
    }
  ];
  
  await prisma.platform.createMany({ data: platformsData });
  const createdPlatforms = await prisma.platform.findMany();
  console.log(`Seeded ${createdPlatforms.length} platforms.`);

  // --- 5. Seed Platform Features ---
  const platformFeatureData = {
    "Teachable": { "Course Builder": true, "Video Hosting": true, "Quizzes & Surveys": true, "Assignments": false, "Certificates of Completion": true, "Content Dripping": true, "Website Builder": true, "Custom Domain": true, "Blogging": true, "Affiliate Marketing": true, "Email Marketing": true, "Sales & Coupons": true, "Community Forum": false, "Mobile App Access": {hasFeature: true, details: "iOS only"}, "Live Classes / Webinars": false, "Student Dashboard": true, "Payment Gateways": true, "Advanced Analytics": true, "API Access": {hasFeature: true, details: "On Pro plan+"}, "App Integrations": true },
    "Thinkific": { "Course Builder": true, "Video Hosting": true, "Quizzes & Surveys": true, "Assignments": true, "Certificates of Completion": true, "Content Dripping": true, "Website Builder": true, "Custom Domain": true, "Blogging": false, "Affiliate Marketing": true, "Email Marketing": false, "Sales & Coupons": true, "Community Forum": true, "Mobile App Access": true, "Live Classes / Webinars": true, "Student Dashboard": true, "Payment Gateways": true, "Advanced Analytics": true, "API Access": true, "App Integrations": true },
    "Kajabi": { "Course Builder": true, "Video Hosting": true, "Quizzes & Surveys": true, "Assignments": true, "Certificates of Completion": true, "Content Dripping": true, "Website Builder": true, "Custom Domain": true, "Blogging": true, "Affiliate Marketing": true, "Email Marketing": true, "Sales & Coupons": true, "Community Forum": true, "Mobile App Access": true, "Live Classes / Webinars": true, "Student Dashboard": true, "Payment Gateways": true, "Advanced Analytics": true, "API Access": true, "App Integrations": true },
    "Podia": { "Course Builder": true, "Video Hosting": true, "Quizzes & Surveys": {hasFeature: true, details: "Simple quizzes"}, "Assignments": false, "Certificates of Completion": false, "Content Dripping": true, "Website Builder": true, "Custom Domain": true, "Blogging": false, "Affiliate Marketing": true, "Email Marketing": true, "Sales & Coupons": true, "Community Forum": true, "Mobile App Access": false, "Live Classes / Webinars": true, "Student Dashboard": true, "Payment Gateways": true, "Advanced Analytics": false, "API Access": false, "App Integrations": false }
  };

  for (const platform of createdPlatforms) {
    const features = platformFeatureData[platform.name as keyof typeof platformFeatureData];
    for (const [featureName, value] of Object.entries(features)) {
      const featureId = featureMap.get(featureName);
      if (featureId) {
        const hasFeature = typeof value === 'boolean' ? value : value.hasFeature;
        const details = typeof value === 'object' ? value.details : null;
        await prisma.platformFeature.create({
          data: { platformId: platform.id, featureId, hasFeature, details }
        });
      }
    }
  }
  console.log("Seeded platform features.");

  // --- 6. Seed Blog Posts ---
  const postsData: Omit<Prisma.PostCreateInput, "author">[] = [
      { slug: "choosing-the-right-platform", title: "10 Things to Consider When Choosing a Course Platform", description: "From pricing and features to scalability and support, here are the key factors to weigh before committing to a platform.", content: "Full content about choosing platforms...", image: "https://picsum.photos/400/250?random=1", dataAiHint: "decision making choices", published: true, authorId: adminUser.id },
      { slug: "engaging-course-content", title: "5 Secrets to Creating Wildly Engaging Course Content", description: "Move beyond static videos. Discover interactive techniques that captivate students and boost completion rates.", content: "Full content about engaging content...", image: "https://picsum.photos/400/250?random=2", dataAiHint: "creative content creation", published: true, authorId: adminUser.id },
      { slug: "marketing-your-online-course", title: "The Ultimate Guide to Marketing Your Online Course in 2024", description: "Explore the latest strategies for social media, email marketing, and SEO to attract your ideal students.", content: "Full content about marketing courses...", image: "https://picsum.photos/400/250?random=3", dataAiHint: "digital marketing strategy", published: true, authorId: adminUser.id },
      { slug: "ai-in-education", title: "How AI is Revolutionizing the E-Learning Industry", description: "Learn how artificial intelligence is personalizing learning paths, automating grading, and creating smarter content.", content: "Full content about AI in education...", image: "https://picsum.photos/400/250?random=4", dataAiHint: "artificial intelligence education", published: false, authorId: adminUser.id },
  ];
  
  let previousPostId: string | null = null;
  for (let i = 0; i < postsData.length; i++) {
    const post = await prisma.post.create({
        data: {
            ...postsData[i],
            previousId: previousPostId,
        }
    });
    if (previousPostId) {
        await prisma.post.update({
            where: { id: previousPostId },
            data: { nextId: post.id }
        });
    }
    previousPostId = post.id;
  }
  console.log("Seeded blog posts with navigation links.");

  const allPosts = await prisma.post.findMany();
  const post1 = allPosts.find(p => p.slug === 'choosing-the-right-platform')!;
  const post2 = allPosts.find(p => p.slug === 'engaging-course-content')!;

  // --- 7. Seed Comments ---
  await prisma.comment.createMany({
    data: [
        { content: "This was incredibly helpful! I was stuck between Teachable and Thinkific, and this breakdown made the choice clear.", postId: post1.id, authorId: charlieUser.id, status: 'APPROVED' },
        { content: "Great article. What are your thoughts on Kajabi's price point for new creators? Seems a bit steep.", postId: post1.id, authorId: bobUser.id, status: 'PENDING' },
        { content: "These are fantastic ideas for engagement. I'm definitely going to try adding more interactive quizzes.", postId: post2.id, authorId: charlieUser.id, status: 'APPROVED' },
        { content: "I don't agree with point #3.", postId: post2.id, authorId: bobUser.id, status: 'REJECTED' },
    ]
  });
  console.log("Seeded comments.");

  // --- 8. Seed Comparisons ---
  const platformTeachable = createdPlatforms.find(p => p.name === "Teachable")!;
  const platformThinkific = createdPlatforms.find(p => p.name === "Thinkific")!;

  await prisma.comparison.create({
    data: {
        title: "Teachable vs. Thinkific: The Ultimate 2024 Showdown",
        slug: "teachable-vs-thinkific",
        summary: "We dive deep into the features, pricing, and user experience of Teachable and Thinkific to help you decide which is the best fit for your course creation journey.",
        platformAId: platformTeachable.id,
        platformBId: platformThinkific.id,
        introduction: "### Introduction\nChoosing between Teachable and Thinkific is a common dilemma for course creators. Both are industry leaders, but they cater to slightly different needs. This comparison will break down the key differences.",
        conclusion: "### Conclusion\nFor beginners who prioritize simplicity, Teachable is a fantastic starting point. For those needing more customization and advanced features, Thinkific offers a more robust platform to grow into.",
        published: true,
        facts: {
            create: [
                { title: "Best For", platformAValue: "Beginners", platformBValue: "Entrepreneurs" },
                { title: "Free Plan", platformAValue: "Yes, limited", platformBValue: "Yes, limited" },
                { title: "Transaction Fees (on free plan)", platformAValue: "10% + $1", platformBValue: "0%" }
            ]
        },
        faqs: {
            create: [
                { question: "Which platform has better marketing tools?", answer: "Kajabi is generally considered to have the most comprehensive, all-in-one marketing suite." },
                { question: "Can I use my own domain with both?", answer: "Yes, both Teachable and Thinkific support custom domains on their paid plans." }
            ]
        }
    }
  });
  console.log("Seeded comparisons.");

  console.log("Seeding finished.");
}


export const seed = async () => {
  main()
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
};

// If this file is run directly, execute the seed function.
if (require.main === module) {
  seed();
}
