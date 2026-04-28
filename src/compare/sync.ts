import prisma from "@/lib/prisma";
import { allPlatforms } from "./platforms";
import { allComparisons } from "./comparisons";

export async function syncComparisonData() {
  console.log("🔄 Starting comparison data sync...");

  // 1. Sync Platforms
  for (const data of allPlatforms) {
    console.log(`📍 Syncing platform: ${data.name}`);

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

    // Sync Pricing Tiers (Delete and Recreate for simple sync)
    await prisma.pricingTier.deleteMany({
      where: { platformId: platform.id }
    });

    await prisma.pricingTier.createMany({
      data: data.tiers.map(t => ({
        name: t.name,
        monthlyPrice: t.monthlyPrice,
        annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent,
        transactionFeePercent: t.transactionFeePercent,
        isPopular: t.isPopular || false,
        features: t.features,
        platformId: platform.id
      }))
    });

    // Sync Features & Categories
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

      await prisma.platformFeature.upsert({
        where: {
          platformId_featureId: {
            platformId: platform.id,
            featureId: existingFeature.id
          }
        },
        update: {
          hasFeature: feat.hasFeature,
          details: feat.details
        },
        create: {
          platformId: platform.id,
          featureId: existingFeature.id,
          hasFeature: feat.hasFeature,
          details: feat.details
        }
      });
    }
  }

  // 2. Sync Curated Comparisons
  console.log("🆚 Syncing curated flagship comparisons...");
  for (const cData of allComparisons) {
    const platformA = await prisma.platform.findUnique({ where: { name: cData.platformA } });
    const platformB = await prisma.platform.findUnique({ where: { name: cData.platformB } });

    if (!platformA || !platformB) {
      console.warn(`⚠️ Skipping comparison ${cData.title}: Platform ${!platformA ? cData.platformA : cData.platformB} not found.`);
      continue;
    }

    const category = await prisma.comparisonCategory.upsert({
      where: { slug: cData.category.toLowerCase().replace(/\s+/g, '-') },
      update: { name: cData.category },
      create: { name: cData.category, slug: cData.category.toLowerCase().replace(/\s+/g, '-') },
    });

    const comparison = await prisma.comparison.upsert({
      where: { slug: cData.slug },
      update: {
        title: cData.title,
        summary: cData.summary,
        introduction: cData.introduction,
        content: cData.content,
        conclusion: cData.conclusion,
        published: cData.published,
        platformAId: platformA.id,
        platformBId: platformB.id,
        categoryId: category.id,
      },
      create: {
        title: cData.title,
        slug: cData.slug,
        summary: cData.summary,
        introduction: cData.introduction,
        content: cData.content,
        conclusion: cData.conclusion,
        published: cData.published,
        platformAId: platformA.id,
        platformBId: platformB.id,
        categoryId: category.id,
      }
    });

    // Sync Facts
    await prisma.fact.deleteMany({ where: { comparisonId: comparison.id } });
    await prisma.fact.createMany({
      data: cData.facts.map(f => ({
        title: f.title,
        platformAValue: f.a,
        platformBValue: f.b,
        comparisonId: comparison.id
      }))
    });

    // Sync FAQs
    if (cData.faqs) {
      await prisma.faq.deleteMany({ where: { comparisonId: comparison.id } });
      await prisma.faq.createMany({
        data: cData.faqs.map(f => ({
          question: f.question,
          answer: f.answer,
          comparisonId: comparison.id
        }))
      });
    }
  }

  console.log("✅ Comparison data sync complete.");
}
