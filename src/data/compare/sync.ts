import prisma from "@/lib/prisma";
import { allPlatforms } from "./platforms";
import { PlatformData } from "./types";

export async function syncComparisonData() {
  console.log("🔄 Starting comparison data sync...");

  for (const data of allPlatforms) {
    console.log(`📍 Syncing platform: ${data.name}`);

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
    // Delete existing tiers first or update them?
    // Usually easier to delete and recreate for static data sync if IDs aren't referenced elsewhere.
    // However, to be safe, we'll upsert by name for that platform.

    // Better strategy for tiers:
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

    // 3. Sync Features & Categories
    for (const feat of data.features) {
      const category = await prisma.featureCategory.upsert({
        where: { name: feat.categoryName },
        update: {},
        create: { name: feat.categoryName },
      });

      const feature = await prisma.feature.upsert({
        where: {
          id: `feat-${feat.featureName.toLowerCase().replace(/\s+/g, '-')}`,
        },
        update: {},
        create: {
          id: `feat-${feat.featureName.toLowerCase().replace(/\s+/g, '-')}`,
          name: feat.featureName,
          categoryId: category.id,
        },
      });

      // Let's find or create feature properly.
      let existingFeature = await prisma.feature.findFirst({
        where: { name: feat.featureName, categoryId: category.id }
      });

      if (!existingFeature) {
        existingFeature = await prisma.feature.create({
          data: { name: feat.featureName, categoryId: category.id }
        });
      }

      // 4. Link PlatformFeature
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

  console.log("✅ Comparison data sync complete.");
}
