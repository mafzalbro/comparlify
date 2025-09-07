"use server";
import prisma from "@/lib/prisma";

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
