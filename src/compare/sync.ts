import prisma from "@/lib/prisma";
import { allPlatforms } from "./platforms";
import { patreonVsTeachable } from "./comparisons/patreon-vs-teachable";

export const allComparisons = [patreonVsTeachable];

export async function syncComparisonData() {
  console.log("🔄 Starting comparison data sync...");

  for (const data of allPlatforms) {
    console.log("� Syncing platform: ", data.name);

    // 1. Upsert Platform
    const platform = await prisma.platform.upsert({
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
      },
    });

    // 2. Sync Pricing Tiers
    await prisma.pricingTier.deleteMany({
      where: { platformId: platform.id },
    });

    await prisma.pricingTier.createMany({
      data: data.tiers.map((t) => ({
        name: t.name,
        monthlyPrice: t.monthlyPrice,
        annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent,
        transactionFeePercent: t.transactionFeePercent,
        isPopular: t.isPopular || false,
        features: t.features,
        platformId: platform.id,
      })),
    });

    // 3. Sync Features & Categories
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

      // 4. Link PlatformFeature
      await prisma.platformFeature.upsert({
        where: {
          platformId_featureId: {
            platformId: platform.id,
            featureId: existingFeature.id,
          },
        },
        update: {
          hasFeature: feat.hasFeature,
          details: feat.details,
        },
        create: {
          platformId: platform.id,
          featureId: existingFeature.id,
          hasFeature: feat.hasFeature,
          details: feat.details,
        },
      });
    }
  }

  console.log("✅ Platform data sync complete.");

  console.log("🔄 Starting comparison data sync...");

  for (const data of allComparisons) {
    console.log("� Syncing comparison: ");

    const platformA = await prisma.platform.findUnique({
      where: { name: data.platformAName },
    });
    const platformB = await prisma.platform.findUnique({
      where: { name: data.platformBName },
    });
    const category = await prisma.comparisonCategory.findUnique({
      where: { name: data.categoryName } as any,
    });

    if (!platformA || !platformB) {
      console.error("Skipping comparison : One or both platforms not found.");
      continue;
    }
    // Attempt to create category if not found
    let comparisonCategory = category;
    if (!comparisonCategory) {
      comparisonCategory = await prisma.comparisonCategory.create({
        data: {
          name: data.categoryName,
          slug: data.categoryName.toLowerCase().replace(/\s+/g, "-"),
        },
      });
      console.log("Created new comparison category: ");
    }

    const comparison = await prisma.comparison.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        summary: data.summary,
        introduction: data.introduction,
        content: data.content,
        conclusion: data.conclusion,
        published: data.published,
        platformAId: platformA.id,
        platformBId: platformB.id,
        categoryId: comparisonCategory.id,
      },
      create: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        introduction: data.introduction,
        content: data.content,
        conclusion: data.conclusion,
        published: data.published,
        platformAId: platformA.id,
        platformBId: platformB.id,
        categoryId: comparisonCategory.id,
      },
    });

    // Sync Facts
    await prisma.fact.deleteMany({
      where: { comparisonId: comparison.id },
    });
    await prisma.fact.createMany({
      data: data.facts.map((fact) => ({
        ...fact,
        comparisonId: comparison.id,
      })),
    });

    // Sync FAQs
    await prisma.faq.deleteMany({
      where: { comparisonId: comparison.id },
    });
    await prisma.faq.createMany({
      data: data.faqs.map((faq) => ({
        ...faq,
        comparisonId: comparison.id,
      })),
    });
  }
  console.log("✅ Comparison data sync complete.");
}
