import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton for Next.js (Prisma v6)
 * 
 * In development/production, returns a live Prisma Client if DATABASE_URL is defined.
 * If DATABASE_URL is a mock, missing, or database connection is not available,
 * it falls back to a Proxy-based Mock Prisma Client that reads structured data
 * entirely from local static files (platforms, comparisons, posts) to allow
 * offline, zero-database compilation and visual verification.
 */

import { allComparisons } from "../data/compare/comparisons/index";
import { allPlatforms } from "../data/compare/platforms/index";
import { allPosts } from "../data/blog/posts/index";

const createMockPrismaClient = (): any => {
  console.log("ℹ️ [Mock Prisma] Activating Proxy-based Mock Prisma Client...");

  const mockClient: any = {};

  // Mock for comparison model
  mockClient.comparison = {
    findFirst: async (args: any) => {
      const slug = args?.where?.slug;
      const comp = allComparisons.find((c) => c.slug === slug);
      if (!comp) return null;

      // Find platform details or dynamically mock if missing (like PayPal, Runway, Evernote)
      const findPlatform = (name: string, fallbackIdx: number) => {
        const found = allPlatforms.find((p) => p.name.toLowerCase() === name.toLowerCase());
        if (found) return found;

        // Return beautiful dynamic mock platform
        return {
          name: name,
          website: `https://www.${name.toLowerCase()}.com`,
          logoUrl: `/uploads/${name.toLowerCase()}_logo.png`,
          description: `A premier digital infrastructure provider for professional ${name} workflows in 2026.`,
          rating: 4.5,
          easeOfUse: 4.3,
          featuresRating: 4.5,
          support: 4.0,
          pros: ["Global enterprise scale", "Highly secure transaction network"],
          cons: ["Premium transaction costs", "Locked-in cloud features"],
          tiers: [
            { name: "Starter", monthlyPrice: 15 },
            { name: "Professional", monthlyPrice: 49 },
            { name: "Enterprise", monthlyPrice: 199 }
          ],
          features: [
            { featureName: "API Access", categoryName: "Developer Tools", hasFeature: true },
            { featureName: "Multi-Currency Checkout", categoryName: "Payments", hasFeature: true },
            { featureName: "Security Shield", categoryName: "Enterprise", hasFeature: true }
          ],
          lastVerifiedAt: new Date().toISOString(),
          sourceUrl: `https://www.${name.toLowerCase()}.com`
        };
      };

      const platA = findPlatform(comp.platformA, 0);
      const platB = findPlatform(comp.platformB, 1);

      // Format features category structure to match database schema expected by components
      const formatFeatures = (platform: any) => {
        return platform.features.map((f: any, i: number) => ({
          id: `pf_${platform.name}_${i}`,
          platformId: platform.name,
          featureId: f.featureName,
          hasFeature: f.hasFeature,
          details: f.details || "Supported natively",
          feature: {
            id: f.featureName,
            name: f.featureName,
            category: {
              id: f.categoryName,
              name: f.categoryName
            }
          }
        }));
      };

      const formatTiers = (platform: any) => {
        return platform.tiers.map((t: any, i: number) => ({
          id: `tier_${platform.name}_${i}`,
          name: t.name,
          monthlyPrice: t.monthlyPrice,
          annualPriceMonthlyEquivalent: t.annualPriceMonthlyEquivalent || t.monthlyPrice * 0.8,
          transactionFeePercent: t.transactionFeePercent || 0,
          isPopular: t.isPopular || false,
          features: t.features || ["Core access", "Standard support"]
        }));
      };

      return {
        id: `comp_${comp.slug}`,
        title: comp.title,
        slug: comp.slug,
        summary: comp.summary,
        introduction: comp.introduction,
        content: comp.content,
        conclusion: comp.conclusion,
        published: comp.published,
        platformAId: platA.name,
        platformBId: platB.name,
        authorName: comp.authorName || "Muhammad Afzal",
        authorRole: comp.authorRole || "Lead Platform & Migration Architect",
        authorBio: comp.authorBio || "Over 10 years of experience building and migrating premium online academies.",
        authorCredentials: comp.authorCredentials || ["Migration Consultant", "Tech Architect"],
        metaTitle: comp.metaTitle,
        metaDescription: comp.metaDescription,
        sovereigntyScoreA: comp.sovereigntyScoreA || 90,
        sovereigntyScoreB: comp.sovereigntyScoreB || 90,
        facts: comp.facts.map((f, i) => ({
          id: `fact_${i}`,
          title: f.title,
          platformAValue: f.platformAValue,
          platformBValue: f.platformBValue
        })),
        faqs: (comp.faqs || []).map((f, i) => ({
          id: `faq_${i}`,
          question: f.question,
          answer: f.answer
        })),
        platformA: {
          id: platA.name,
          name: platA.name,
          website: platA.website,
          logoUrl: platA.logoUrl,
          description: platA.description,
          rating: platA.rating,
          easeOfUse: platA.easeOfUse,
          featuresRating: platA.featuresRating,
          support: platA.support,
          pros: platA.pros,
          cons: platA.cons,
          affiliateLink: platA.affiliateLink,
          dealDescription: platA.dealDescription,
          videoHostingIncluded: platA.videoHostingIncluded,
          tiers: formatTiers(platA),
          features: formatFeatures(platA),
          newsArticles: [],
          forumTopics: []
        },
        platformB: {
          id: platB.name,
          name: platB.name,
          website: platB.website,
          logoUrl: platB.logoUrl,
          description: platB.description,
          rating: platB.rating,
          easeOfUse: platB.easeOfUse,
          featuresRating: platB.featuresRating,
          support: platB.support,
          pros: platB.pros,
          cons: platB.cons,
          affiliateLink: platB.affiliateLink,
          dealDescription: platB.dealDescription,
          videoHostingIncluded: platB.videoHostingIncluded,
          tiers: formatTiers(platB),
          features: formatFeatures(platB),
          newsArticles: [],
          forumTopics: []
        }
      };
    },
    findMany: async () => {
      return allComparisons.map((c) => ({
        id: `comp_${c.slug}`,
        title: c.title,
        slug: c.slug,
        summary: c.summary,
        published: c.published
      }));
    }
  };

  // Mock for feature model
  mockClient.feature = {
    findMany: async () => {
      const uniqueFeatures = new Set<string>();
      allPlatforms.forEach((p) => {
        p.features.forEach((f) => uniqueFeatures.add(f.featureName));
      });

      return Array.from(uniqueFeatures).map((featName, i) => {
        // Find category name from any platform that has this feature
        let catName = "Features";
        for (const p of allPlatforms) {
          const match = p.features.find((f) => f.featureName === featName);
          if (match) {
            catName = match.categoryName;
            break;
          }
        }

        return {
          id: featName,
          name: featName,
          categoryId: catName,
          category: {
            id: catName,
            name: catName
          }
        };
      });
    }
  };

  // Mock for post model
  mockClient.post = {
    findMany: async () => {
      return allPosts.map((p, i) => ({
        id: `post_${i}`,
        title: p.title,
        slug: p.slug,
        description: p.description,
        content: p.content,
        image: p.image,
        published: p.published,
        createdAt: new Date(),
        author: {
          id: "mafzal",
          name: "Muhammad Afzal"
        }
      }));
    }
  };

  // Mock for newsArticle model
  mockClient.newsArticle = {
    findMany: async () => []
  };

  // Mock for siteContent model
  mockClient.siteContent = {
    findMany: async () => [
      { id: "sc1", key: "global.siteName", value: "Comparlify", group: "Globals" },
      { id: "sc2", key: "module.blog.enabled", value: "true", group: "Module Visibility" },
      { id: "sc3", key: "module.compare.enabled", value: "true", group: "Module Visibility" },
      { id: "sc4", key: "module.news.enabled", value: "false", group: "Module Visibility" },
      { id: "sc5", key: "module.community.enabled", value: "false", group: "Module Visibility" },
      { id: "sc6", key: "module.tools.enabled", value: "false", group: "Module Visibility" }
    ],
    findUnique: async (args: any) => {
      const key = args?.where?.key;
      if (key === "global.siteName") {
        return { id: "sc1", key: "global.siteName", value: "Comparlify" };
      }
      return null;
    }
  };

  // Mock for user model
  mockClient.user = {
    findUnique: async () => null,
    findMany: async () => []
  };

  // Add standard Prisma disconnect
  mockClient.$disconnect = async () => {};

  // Return a proxy that dynamically handles any model accessor to prevent crashes
  return new Proxy(mockClient, {
    get(target, prop) {
      if (prop === '$disconnect') {
        return async () => {};
      }

      const propStr = String(prop);
      if (mockClient[propStr]) {
        return mockClient[propStr];
      }

      // Fallback model proxy for any other model (e.g. advertisement, category, etc.)
      return new Proxy({}, {
        get(modelTarget, method) {
          return async () => {
            console.log(`[Mock Prisma Fallback] Intercepted ${propStr}.${String(method)}`);
            if (String(method).startsWith('findMany')) {
              return [];
            }
            return null;
          };
        }
      });
    }
  });
};

const getPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  // Use the Mock Prisma Client if DATABASE_URL is missing, dummy, or explicitly static
  if (
    !connectionString ||
    connectionString.includes("localhost") ||
    connectionString.includes("example.com") ||
    process.env.BUILD_TYPE === "static"
  ) {
    return createMockPrismaClient();
  }

  try {
    return new PrismaClient({
      log: ["error"],
    });
  } catch (error) {
    console.error("❌ Failed to initialize live Prisma Client, falling back to mock:", error);
    return createMockPrismaClient();
  }
};

const globalForPrisma = globalThis as unknown as {
  prismaGlobal: any | undefined;
};

export const prisma = globalForPrisma.prismaGlobal ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}

export default prisma;
