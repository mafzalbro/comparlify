"use server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

async function main() {
  console.log("Start seeding ...");

  const features = [
    "Integrated Video Hosting",
    "Assessments & Quizzes",
    "Drip Content",
    "Community Forum",
    "Affiliate Marketing Tools",
    "Custom Certificate",
    "Mobile App Access",
    "Advanced Analytics",
  ];

  for (const name of features) {
    await prisma.feature.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Seeded features.");

  const platforms = [
    {
      name: "Teachable",
      website: "https://teachable.com",
      description:
        "A popular platform that focuses on ease of use for creators just starting out. Great for simple course structures.",
      logoUrl: "/logos/teachable.svg",
      features: {
        "Integrated Video Hosting": { hasFeature: true },
        "Assessments & Quizzes": {
          hasFeature: true,
          details: "Basic quiz functionality.",
        },
        "Drip Content": { hasFeature: true },
        "Community Forum": { hasFeature: false },
        "Affiliate Marketing Tools": { hasFeature: true },
        "Custom Certificate": { hasFeature: true },
        "Mobile App Access": { hasFeature: true, details: "iOS only" },
        "Advanced Analytics": { hasFeature: false },
      },
    },
    {
      name: "Thinkific",
      website: "https://www.thinkific.com",
      description:
        "A powerful and flexible platform that offers more customization options and advanced features for growing businesses.",
      logoUrl: "/logos/thinkific.svg",
      features: {
        "Integrated Video Hosting": { hasFeature: true },
        "Assessments & Quizzes": {
          hasFeature: true,
          details: "Advanced options like question banks.",
        },
        "Drip Content": { hasFeature: true },
        "Community Forum": { hasFeature: true },
        "Affiliate Marketing Tools": { hasFeature: true },
        "Custom Certificate": { hasFeature: true },
        "Mobile App Access": {
          hasFeature: false,
          details: "Via 3rd party apps.",
        },
        "Advanced Analytics": { hasFeature: true },
      },
    },
    {
      name: "Kajabi",
      website: "https://kajabi.com",
      description:
        "An all-in-one platform that includes email marketing, website building, and sales funnels in addition to course hosting.",
      logoUrl: "/logos/kajabi.svg",
      features: {
        "Integrated Video Hosting": { hasFeature: true },
        "Assessments & Quizzes": { hasFeature: true },
        "Drip Content": { hasFeature: true },
        "Community Forum": {
          hasFeature: true,
          details: "Built-in community product.",
        },
        "Affiliate Marketing Tools": { hasFeature: true },
        "Custom Certificate": { hasFeature: true },
        "Mobile App Access": { hasFeature: true, details: "iOS and Android" },
        "Advanced Analytics": { hasFeature: true },
      },
    },
    {
      name: "Podia",
      website: "https://www.podia.com",
      description:
        "A creator-friendly platform for courses, digital downloads, and memberships with a focus on simplicity.",
      logoUrl: "/logos/podia.svg",
      features: {
        "Integrated Video Hosting": { hasFeature: true },
        "Assessments & Quizzes": {
          hasFeature: true,
          details: "Simple multiple-choice quizzes.",
        },
        "Drip Content": { hasFeature: true },
        "Community Forum": { hasFeature: true },
        "Affiliate Marketing Tools": { hasFeature: true },
        "Custom Certificate": { hasFeature: false },
        "Mobile App Access": { hasFeature: false },
        "Advanced Analytics": { hasFeature: false },
      },
    },
  ];

  const allFeatures = await prisma.feature.findMany();
  const featureMap = new Map(allFeatures.map((f) => [f.name, f.id]));

  for (const platformData of platforms) {
    const platform = await prisma.platform.upsert({
      where: { name: platformData.name },
      update: {
        website: platformData.website,
        description: platformData.description,
        logoUrl: platformData.logoUrl,
      },
      create: {
        name: platformData.name,
        website: platformData.website,
        description: platformData.description,
        logoUrl: platformData.logoUrl,
      },
    });

    for (const [featureName, featureDetails] of Object.entries(
      platformData.features
    )) {
      const featureId = featureMap.get(featureName);
      if (featureId) {
        await prisma.platformFeature.upsert({
          where: {
            platformId_featureId: {
              platformId: platform.id,
              featureId,
            },
          },
          update: {
            hasFeature: featureDetails.hasFeature,
            details: featureDetails.details,
          },
          create: {
            platformId: platform.id,
            featureId,
            hasFeature: featureDetails.hasFeature,
            details: featureDetails.details,
          },
        });
      }
    }
  }
  console.log("Seeded platforms and their features.");


  // Find the admin user to associate posts with.
  // If the admin user does not exist, the posts will not be created.
  const adminUser = await prisma.user.findUnique({
    where: { email: 'mafzalbro@gmail.com' },
  });

  if (adminUser) {
    const blogPosts: Omit<Prisma.PostCreateInput, "author">[] = [
      {
        slug: "choosing-the-right-platform",
        title: "10 Things to Consider When Choosing a Course Platform",
        description:
          "From pricing and features to scalability and support, here are the key factors to weigh before committing to a platform.",
        content: "This is the full content for choosing the right platform...",
        image: "https://picsum.photos/400/250?random=1",
        dataAiHint: "decision making choices",
        published: true,
      },
      {
        slug: "engaging-course-content",
        title: "5 Secrets to Creating Wildly Engaging Course Content",
        description:
          "Move beyond static videos. Discover interactive techniques that captivate students and boost completion rates.",
        content: "This is the full content for engaging course content...",
        image: "https://picsum.photos/400/250?random=2",
        dataAiHint: "creative content creation",
        published: true,
      },
      {
        slug: "marketing-your-online-course",
        title: "The Ultimate Guide to Marketing Your Online Course in 2024",
        description:
          "Explore the latest strategies for social media, email marketing, and SEO to attract your ideal students.",
        content: "This is the full content for marketing your course...",
        image: "https://picsum.photos/400/250?random=3",
        dataAiHint: "digital marketing strategy",
        published: true,
      },
      {
        slug: "ai-in-education",
        title: "How AI is Revolutionizing the E-Learning Industry",
        description:
          "Learn how artificial intelligence is personalizing learning paths, automating grading, and creating smarter content.",
        content: "This is the full content for AI in education...",
        image: "https://picsum.photos/400/250?random=4",
        dataAiHint: "artificial intelligence education",
        published: true,
      },
      {
        slug: "building-a-community",
        title: "Beyond the Course: Building a Thriving Student Community",
        description:
          "A strong community increases student retention and word-of-mouth marketing. Here’s how to build one from scratch.",
        content: "This is the full content for building a community...",
        image: "https://picsum.photos/400/250?random=5",
        dataAiHint: "online community students",
        published: true,
      },
      {
        slug: "pricing-strategies",
        title: "Pricing Your Course: Strategies for Maximum Profit and Impact",
        description:
          "Are you under-valuing your content? We break down different pricing models to help you find the sweet spot.",
        content: "This is the full content for pricing strategies...",
        image: "https://picsum.photos/400/250?random=6",
        dataAiHint: "pricing strategy chart",
        published: true,
      },
    ];

    for (const post of blogPosts) {
      await prisma.post.upsert({
        where: { slug: post.slug },
        update: { ...post, authorId: adminUser.id },
        create: { ...post, author: { connect: { id: adminUser.id } } },
      });
    }
    console.log("Seeded blog posts.");
  } else {
    console.log("Admin user not found, skipping blog post seeding.");
  }

  console.log("Seeding finished.");
}

export const seed = async () => {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
};
