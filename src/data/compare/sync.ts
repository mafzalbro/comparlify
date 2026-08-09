import prisma from "@/lib/prisma";
import { allPlatforms } from "./platforms";
import { allComparisons } from "./comparisons";
import { PlatformData } from "./types";

export async function syncComparisonData() {
  console.log("🔄 Starting comparison data sync...");
  const isMongo = process.env.DATABASE_URL?.startsWith("mongodb://") || process.env.DATABASE_URL?.startsWith("mongodb+srv://") || process.env.DATABASE_PROVIDER === "mongodb";

  for (const data of allPlatforms) {
    console.log(`📍 Syncing platform: ${data.name}`);

    // 1. Upsert Platform
    let platform: any;
    if (isMongo) {
      const existing = await prisma.platform.findUnique({
        where: { name: data.name },
      });
      const updateData = {
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
      };
      if (existing) {
        platform = await prisma.platform.update({
          where: { id: existing.id },
          data: updateData,
        });
      } else {
        platform = await prisma.platform.create({
          data: {
            name: data.name,
            ...updateData,
          },
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
    }

    // 2. Sync Pricing Tiers
    if (isMongo) {
      await (prisma as any).$runCommandRaw({
        delete: "PricingTier",
        deletes: [{ q: { platformId: platform.id }, limit: 0 }]
      });
    } else {
      await prisma.pricingTier.deleteMany({
        where: { platformId: platform.id }
      });
    }

    const pricingTiersData = data.tiers.map(t => ({
      name: t.name,
      monthlyPrice: t.monthlyPrice,
      annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent,
      transactionFeePercent: t.transactionFeePercent,
      isPopular: t.isPopular || false,
      features: t.features,
      platformId: platform.id
    }));

    if (isMongo) {
      for (const item of pricingTiersData) {
        await prisma.pricingTier.create({ data: item });
      }
    } else {
      await prisma.pricingTier.createMany({
        data: pricingTiersData
      });
    }

    // 3. Sync Features & Categories
    for (const feat of data.features) {
      let category: any;
      if (isMongo) {
        category = await prisma.featureCategory.findUnique({
          where: { name: feat.categoryName },
        });
        if (!category) {
          category = await prisma.featureCategory.create({
            data: { name: feat.categoryName },
          });
        }
      } else {
        category = await prisma.featureCategory.upsert({
          where: { name: feat.categoryName },
          update: {},
          create: { name: feat.categoryName },
        });
      }

      const featId = `feat-${feat.featureName.toLowerCase().replace(/\s+/g, '-')}`;
      let feature: any;
      if (isMongo) {
        feature = await prisma.feature.findUnique({
          where: { id: featId },
        });
        if (!feature) {
          feature = await prisma.feature.create({
            data: {
              id: featId,
              name: feat.featureName,
              categoryId: category.id,
            },
          });
        }
      } else {
        feature = await prisma.feature.upsert({
          where: { id: featId },
          update: {},
          create: {
            id: featId,
            name: feat.featureName,
            categoryId: category.id,
          },
        });
      }

      let existingFeature = await prisma.feature.findFirst({
        where: { name: feat.featureName, categoryId: category.id }
      });

      if (!existingFeature) {
        existingFeature = await prisma.feature.create({
          data: { name: feat.featureName, categoryId: category.id }
        });
      }

      // 4. Link PlatformFeature
      if (isMongo) {
        const existingPf = await prisma.platformFeature.findUnique({
          where: {
            platformId_featureId: {
              platformId: platform.id,
              featureId: existingFeature.id
            }
          }
        });
        if (existingPf) {
          await prisma.platformFeature.update({
            where: { id: existingPf.id },
            data: {
              hasFeature: feat.hasFeature,
              details: feat.details
            }
          });
        } else {
          await prisma.platformFeature.create({
            data: {
              platformId: platform.id,
              featureId: existingFeature.id,
              hasFeature: feat.hasFeature,
              details: feat.details
            }
          });
        }
      } else {
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
  }

  // ── 5. Sync High-Fidelity Comparisons ──
  console.log("🆚 Syncing comparisons from comparisons directory...");
  for (const comp of allComparisons) {
    console.log(`🆚 Syncing comparison: ${comp.title}`);

    const resolvePlatformName = (name: string): string => {
      if (name === "GA4") return "Google Analytics 4";
      if (name === "Wix Studio") return "Wix";
      return name;
    };

    // Find platform A
    const nameA = resolvePlatformName(comp.platformA);
    let platA = await prisma.platform.findFirst({
      where: { name: nameA },
    });
    if (!platA) {
      console.log(`🌱 Creating placeholder platform: ${nameA}`);
      platA = await prisma.platform.create({
        data: {
          name: nameA,
          website: `https://www.${nameA.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          logoUrl: `/uploads/${nameA.toLowerCase().replace(/[^a-z0-9]/g, "")}_logo.png`,
          description: `A digital infrastructure provider for professional ${nameA} workflows.`,
          rating: 4.5,
          easeOfUse: 4.2,
          featuresRating: 4.5,
          support: 4.0,
          pros: ["Industry presence", "Highly secure transaction network"],
          cons: ["Premium transaction costs", "Locked-in cloud features"],
          lastVerifiedAt: new Date(),
        },
      });
    }

    // Find platform B
    const nameB = resolvePlatformName(comp.platformB);
    let platB = await prisma.platform.findFirst({
      where: { name: nameB },
    });
    if (!platB) {
      console.log(`🌱 Creating placeholder platform: ${nameB}`);
      platB = await prisma.platform.create({
        data: {
          name: nameB,
          website: `https://www.${nameB.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          logoUrl: `/uploads/${nameB.toLowerCase().replace(/[^a-z0-9]/g, "")}_logo.png`,
          description: `A digital infrastructure provider for professional ${nameB} workflows.`,
          rating: 4.5,
          easeOfUse: 4.2,
          featuresRating: 4.5,
          support: 4.0,
          pros: ["Industry presence", "Highly secure transaction network"],
          cons: ["Premium transaction costs", "Locked-in cloud features"],
          lastVerifiedAt: new Date(),
        },
      });
    }

    // Find or create category
    let categoryObj = await prisma.comparisonCategory.findFirst({
      where: { name: comp.category },
    });

    if (!categoryObj) {
      categoryObj = await prisma.comparisonCategory.create({
        data: {
          name: comp.category,
          slug: comp.category.toLowerCase().replace(/\s+/g, "-"),
        },
      });
    }

    const compData: any = {
      title: comp.title,
      summary: comp.summary,
      introduction: comp.introduction,
      content: comp.content,
      conclusion: comp.conclusion,
      published: comp.published ?? false,
      platformAId: platA.id,
      platformBId: platB.id,
      categoryId: categoryObj.id,
      authorName: comp.authorName || null,
      authorRole: comp.authorRole || null,
      authorBio: comp.authorBio || null,
      authorCredentials: comp.authorCredentials as any || null,
      metaTitle: comp.metaTitle || null,
      metaDescription: comp.metaDescription || null,
      sovereigntyScoreA: comp.sovereigntyScoreA || null,
      sovereigntyScoreB: comp.sovereigntyScoreB || null,
    };

    // Upsert Comparison
    const dbComp = await prisma.comparison.upsert({
      where: { slug: comp.slug },
      update: compData,
      create: {
        slug: comp.slug,
        ...compData,
      },
    });

    // Sync Facts
    await prisma.fact.deleteMany({
      where: { comparisonId: dbComp.id },
    });
    if (comp.facts && comp.facts.length > 0) {
      for (const fact of comp.facts) {
        await prisma.fact.create({
          data: {
            title: fact.title,
            platformAValue: fact.platformAValue,
            platformBValue: fact.platformBValue,
            comparisonId: dbComp.id,
          },
        });
      }
    }

    // Sync FAQs
    await prisma.faq.deleteMany({
      where: { comparisonId: dbComp.id },
    });
    if (comp.faqs && comp.faqs.length > 0) {
      for (const faq of comp.faqs) {
        await prisma.faq.create({
          data: {
            question: faq.question,
            answer: faq.answer,
            comparisonId: dbComp.id,
          },
        });
      }
    }
  }

  console.log("✅ Comparison data sync complete.");
}
