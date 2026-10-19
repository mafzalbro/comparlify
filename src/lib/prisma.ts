import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton for Next.js (Prisma v6)
 * 
 * In development/production, returns a live Prisma Client if DATABASE_URL is defined
 * AND BYPASS_MOCK === "true".
 * 
 * Otherwise, it falls back to a comprehensive Proxy-based Mock Prisma Client that
 * reads structured data from local static files AND a live MongoDB dump snapshot,
 * enabling zero-database builds, static exports, and full production deployments
 * without any external database or OAuth provider.
 */

import { allComparisons } from "../data/compare/comparisons/index";
import { allPlatforms } from "../data/compare/platforms/index";
import { allPosts } from "../data/blog/posts/index";
import { mockSiteContent, mockAdPlacements, mockUsers } from "./mock-data";

const createMockPrismaClient = (): any => {
  console.log("ℹ️ [Mock Prisma] Activating Proxy-based Mock Prisma Client...");

  const mockClient: any = {};

  // ─────────────────────────────────────────────────
  // SITE CONTENT — All 139 entries from live MongoDB
  // ─────────────────────────────────────────────────
  const siteContentItems = mockSiteContent.map((sc) => ({
    ...sc,
    createdAt: new Date(sc.createdAt),
    updatedAt: new Date(sc.updatedAt),
  }));

  mockClient.siteContent = {
    findMany: async (args?: any) => {
      let results = [...siteContentItems];
      if (args?.where?.group) {
        results = results.filter((r) => r.group === args.where.group);
      }
      if (args?.where?.key) {
        if (typeof args.where.key === "string") {
          results = results.filter((r) => r.key === args.where.key);
        } else if (args.where.key.startsWith) {
          results = results.filter((r) => r.key.startsWith(args.where.key.startsWith));
        }
      }
      if (args?.orderBy) {
        const key = Object.keys(args.orderBy)[0];
        const dir = args.orderBy[key];
        results.sort((a: any, b: any) => {
          if (dir === "asc") return String(a[key]).localeCompare(String(b[key]));
          return String(b[key]).localeCompare(String(a[key]));
        });
      }
      return results;
    },
    findUnique: async (args: any) => {
      const key = args?.where?.key || args?.where?.id;
      return siteContentItems.find((sc) => sc.key === key || sc.id === key) || null;
    },
    findFirst: async (args: any) => {
      if (args?.where?.key) {
        return siteContentItems.find((sc) => sc.key === args.where.key) || null;
      }
      return siteContentItems[0] || null;
    },
    count: async () => siteContentItems.length,
    create: async (args: any) => ({ id: `sc_new_${Date.now()}`, ...args?.data, createdAt: new Date(), updatedAt: new Date() }),
    update: async (args: any) => ({ id: args?.where?.id || args?.where?.key, ...args?.data, updatedAt: new Date() }),
    upsert: async (args: any) => ({ id: args?.where?.key || `sc_${Date.now()}`, ...args?.create, ...args?.update, updatedAt: new Date() }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
    updateMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // ADVERTISEMENTS — Live ads + mock placeholder ads for every slot
  // ─────────────────────────────────────────────────
  const adItems = mockAdPlacements.map((ad) => ({
    ...ad,
    createdAt: new Date(ad.createdAt),
    updatedAt: new Date(ad.updatedAt),
  }));

  mockClient.advertisement = {
    findFirst: async (args: any) => {
      const placement = args?.where?.placement;
      const active = args?.where?.active;
      let results = [...adItems];
      if (placement) results = results.filter((a) => a.placement === placement);
      if (active !== undefined) results = results.filter((a) => a.active === active);
      return results[0] || null;
    },
    findMany: async (args?: any) => {
      let results = [...adItems];
      if (args?.where?.placement) results = results.filter((a) => a.placement === args.where.placement);
      if (args?.where?.active !== undefined) results = results.filter((a) => a.active === args.where.active);
      return results;
    },
    findUnique: async (args: any) => {
      return adItems.find((a) => a.id === args?.where?.id) || null;
    },
    count: async () => adItems.length,
    create: async (args: any) => ({ id: `ad_${Date.now()}`, ...args?.data, createdAt: new Date(), updatedAt: new Date() }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data, updatedAt: new Date() }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // USERS — Live users from MongoDB dump
  // ─────────────────────────────────────────────────
  const userItems = mockUsers.map((u) => ({
    ...u,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  }));

  mockClient.user = {
    findUnique: async (args: any) => {
      const id = args?.where?.id;
      const email = args?.where?.email;
      return userItems.find((u) => u.id === id || u.email === email) || null;
    },
    findFirst: async (args?: any) => {
      if (args?.where?.email) return userItems.find((u) => u.email === args.where.email) || null;
      if (args?.where?.role) return userItems.find((u) => u.role === args.where.role) || null;
      return userItems[0] || null;
    },
    findMany: async (args?: any) => {
      let results = [...userItems];
      if (args?.where?.role) results = results.filter((u) => u.role === args.where.role);
      if (args?.where?.posts) return results; // Return all users when filtering by posts relation
      return results;
    },
    count: async () => userItems.length,
    update: async (args: any) => {
      const user = userItems.find((u) => u.id === args?.where?.id || u.email === args?.where?.email);
      return { ...(user || userItems[0]), ...args?.data, updatedAt: new Date() };
    },
    create: async (args: any) => ({ id: `user_${Date.now()}`, ...args?.data, createdAt: new Date(), updatedAt: new Date() }),
    upsert: async (args: any) => ({ id: args?.where?.id || `user_${Date.now()}`, ...args?.create, ...args?.update }),
    delete: async () => ({}),
  };

  // ─────────────────────────────────────────────────
  // ACCOUNT & SESSION — Auth adapter models (mock no-ops)
  // ─────────────────────────────────────────────────
  mockClient.account = {
    findFirst: async () => null,
    findUnique: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `acct_${Date.now()}`, ...args?.data }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  mockClient.session = {
    findFirst: async () => null,
    findUnique: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `sess_${Date.now()}`, ...args?.data }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  mockClient.verificationToken = {
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (args: any) => ({ ...args?.data }),
    delete: async () => ({}),
  };

  // ─────────────────────────────────────────────────
  // COMPARISON — from static TS data files
  // ─────────────────────────────────────────────────
  // ─────────────────────────────────────────────────
  // COMPARISON — from static TS data files
  // ─────────────────────────────────────────────────

  // Shared helper: resolve a platform by name, falling back to a mocked
  // shell object if the platform isn't in allPlatforms (e.g. PayPal, Runway).
  const resolveMockPlatform = (name: string) => {
    const found = allPlatforms.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    if (found) return found;

    const lower = name.toLowerCase();
    let logo = `/uploads/${lower}_logo.png`;
    if (lower === "trello") {
      logo =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Trello-logo-blue.svg/512px-Trello-logo-blue.svg.png";
    } else if (lower === "magento") {
      logo =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Magento_Logo.svg/512px-Magento_Logo.svg.png";
    }

    return {
      name,
      website: `https://www.${lower}.com`,
      logoUrl: logo,
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
        { name: "Enterprise", monthlyPrice: 199 },
      ],
      features: [
        {
          featureName: "API Access",
          categoryName: "Developer Tools",
          hasFeature: true,
        },
        {
          featureName: "Multi-Currency Checkout",
          categoryName: "Payments",
          hasFeature: true,
        },
        {
          featureName: "Security Shield",
          categoryName: "Enterprise",
          hasFeature: true,
        },
      ],
      lastVerifiedAt: new Date().toISOString(),
      sourceUrl: `https://www.${lower}.com`,
    };
  };

  // Shared helper: build the "full" comparison shape that consumers
  // (e.g. blog/[slug], news/[slug], /compare) expect.
  const buildComparisonObject = (comp: (typeof allComparisons)[number]) => {
    const platA = resolveMockPlatform(comp.platformA);
    const platB = resolveMockPlatform(comp.platformB);

    const formatFeatures = (platform: any) =>
      platform.features.map((f: any, i: number) => ({
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
            name: f.categoryName,
          },
        },
      }));

    const formatTiers = (platform: any) =>
      platform.tiers.map((t: any, i: number) => ({
        id: `tier_${platform.name}_${i}`,
        name: t.name,
        monthlyPrice: t.monthlyPrice,
        annualPriceMonthlyEquivalent:
          t.annualPriceMonthlyEquivalent || t.monthlyPrice * 0.8,
        transactionFeePercent: t.transactionFeePercent || 0,
        isPopular: t.isPopular || false,
        features: t.features || ["Core access", "Standard support"],
      }));

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
      authorRole:
        comp.authorRole || "Lead Platform & Migration Architect",
      authorBio:
        comp.authorBio ||
        "Over 10 years of experience building and migrating premium online academies.",
      authorCredentials: comp.authorCredentials || [
        "Migration Consultant",
        "Tech Architect",
      ],
      metaTitle: comp.metaTitle,
      metaDescription: comp.metaDescription,
      sovereigntyScoreA: comp.sovereigntyScoreA || 90,
      sovereigntyScoreB: comp.sovereigntyScoreB || 90,
      createdAt: new Date(),
      updatedAt: new Date(),
      facts: comp.facts.map((f, i) => ({
        id: `fact_${i}`,
        title: f.title,
        platformAValue: f.platformAValue,
        platformBValue: f.platformBValue,
      })),
      faqs: (comp.faqs || []).map((f, i) => ({
        id: `faq_${i}`,
        question: f.question,
        answer: f.answer,
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
        forumTopics: [],
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
        forumTopics: [],
      },
    };
  };

  mockClient.comparison = {
    findFirst: async (args: any) => {
      const slug = args?.where?.slug;
      const comp = allComparisons.find((c) => c.slug === slug);
      if (!comp) return null;
      return buildComparisonObject(comp);
    },
    findMany: async (args?: any) => {
      let matches = [...allComparisons];

      // where: { published }
      if (args?.where?.published !== undefined) {
        matches = matches.filter((c) => c.published === args.where.published);
      }

      // orderBy: { createdAt: "desc" | "asc" } — mock data has no real
      // createdAt, so this is a stable no-op ordering (reversed for asc)
      if (args?.orderBy?.createdAt === "asc") {
        matches = matches.slice().reverse();
      }

      // take / skip
      if (args?.skip) matches = matches.slice(args.skip);
      if (args?.take) matches = matches.slice(0, args.take);

      const include = args?.include || {};
      const select = args?.select;

      return matches.map((c) => {
        // If a `select` is provided, honor it (compare/browse pages).
        if (select) {
          const base = {
            id: `comp_${c.slug}`,
            title: c.title,
            slug: c.slug,
            summary: c.summary,
            published: c.published,
            platformAId: c.platformA,
            platformBId: c.platformB,
            createdAt: new Date(),
          };
          const picked: any = {};
          for (const key of Object.keys(select)) {
            if (select[key] && key in base) {
              picked[key] = (base as any)[key];
            }
          }
          // Nested include inside select (rare) — fall back to full
          if (select.platformA || select.platformB) {
            const full = buildComparisonObject(c);
            return {
              ...picked,
              ...(select.platformA ? { platformA: full.platformA } : {}),
              ...(select.platformB ? { platformB: full.platformB } : {}),
            };
          }
          return picked;
        }

        // No select — build the base row, then attach includes
        const row: any = {
          id: `comp_${c.slug}`,
          title: c.title,
          slug: c.slug,
          summary: c.summary,
          published: c.published,
          platformAId: c.platformA,
          platformBId: c.platformB,
          createdAt: new Date(),
        };

        if (include.platformA || include.platformB) {
          const full = buildComparisonObject(c);
          if (include.platformA) row.platformA = full.platformA;
          if (include.platformB) row.platformB = full.platformB;
        }
        if (include.facts) {
          row.facts = c.facts.map((f, i) => ({
            id: `fact_${i}`,
            title: f.title,
            platformAValue: f.platformAValue,
            platformBValue: f.platformBValue,
          }));
        }
        if (include.faqs) {
          row.faqs = (c.faqs || []).map((f, i) => ({
            id: `faq_${i}`,
            question: f.question,
            answer: f.answer,
          }));
        }
        return row;
      });
    },
    findUnique: async (args: any) => {
      const slug = args?.where?.slug;
      const id = args?.where?.id;
      const comp = allComparisons.find(
        (c) => c.slug === slug || `comp_${c.slug}` === id,
      );
      if (!comp) return null;
      return buildComparisonObject(comp);
    },
    count: async (args?: any) => {
      let matches = [...allComparisons];
      if (args?.where?.published !== undefined) {
        matches = matches.filter((c) => c.published === args.where.published);
      }
      return matches.length;
    },
    create: async (args: any) => ({
      id: `comp_new_${Date.now()}`,
      ...args?.data,
    }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    upsert: async (args: any) => ({
      id: args?.where?.slug || `comp_${Date.now()}`,
      ...args?.create,
      ...args?.update,
    }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // FEATURE — derived from static platform data
  // ─────────────────────────────────────────────────
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
    },
    findUnique: async (args: any) => {
      const name = args?.where?.name || args?.where?.id;
      for (const p of allPlatforms) {
        const match = p.features.find((f) => f.featureName === name);
        if (match) return { id: name, name, categoryId: match.categoryName, category: { id: match.categoryName, name: match.categoryName } };
      }
      return null;
    },
    findFirst: async (args: any) => {
      const name = args?.where?.name;
      for (const p of allPlatforms) {
        const match = p.features.find((f) => f.featureName === name);
        if (match) return { id: name, name, categoryId: match.categoryName, category: { id: match.categoryName, name: match.categoryName } };
      }
      return null;
    },
    count: async () => {
      const uniqueFeatures = new Set<string>();
      allPlatforms.forEach((p) => p.features.forEach((f) => uniqueFeatures.add(f.featureName)));
      return uniqueFeatures.size;
    },
    create: async (args: any) => ({ id: `feat_${Date.now()}`, ...args?.data }),
    upsert: async (args: any) => ({ id: args?.where?.name || `feat_${Date.now()}`, ...args?.create, ...args?.update }),
  };

  // ─────────────────────────────────────────────────
  // POST — from static blog TS data files
  // ─────────────────────────────────────────────────
  const mockPostItems = allPosts.map((p, i) => ({
    id: `post_${i}`,
    title: p.title,
    slug: p.slug,
    description: p.description,
    content: p.content,
    image: p.image,
    dataAiHint: p.dataAiHint || "",
    published: p.published !== false,
    createdAt: new Date(Date.now() - i * 86400000), // Stagger dates
    updatedAt: new Date(),
    authorId: "cmvdnyaha0000uv6kycnajxnn",
    categoryId: `cat_${(p.categoryName || "general").toLowerCase().replace(/\s+/g, "-")}`,
    metaTitle: p.metaTitle || p.title,
    metaDescription: p.metaDescription || p.description,
    keywords: p.keywords || [],
    authorName: p.authorName || "Muhammad Afzal",
    authorRole: p.authorRole,
    authorBio: p.authorBio,
    authorCredentials: p.authorCredentials,
    keyTakeaways: p.keyTakeaways || [],
    nextId: null,
    previousId: null,
    author: userItems.find((u) => u.email === p.authorEmail) || userItems[0] || {
      id: "cmvdnyaha0000uv6kycnajxnn",
      name: "Muhammad Afzal Bro",
      email: "mafzalbro@gmail.com",
      image: "https://lh3.googleusercontent.com/a/ACg8ocIM8d2bRYLP6w8w135qpUy34i1W7JDTB5QhUt0apG3fXGZe364=s96-c",
      role: "ADMIN",
    },
    category: {
      id: `cat_${(p.categoryName || "general").toLowerCase().replace(/\s+/g, "-")}`,
      name: p.categoryName || "General",
      slug: (p.categoryName || "general").toLowerCase().replace(/\s+/g, "-"),
    },
    platforms: (p.platformNames || []).map((name: string) => {
      const plat = allPlatforms.find((pl) => pl.name.toLowerCase() === name.toLowerCase());
      return plat ? { id: `plat_${plat.name.toLowerCase()}`, name: plat.name } : { id: `plat_${name.toLowerCase()}`, name };
    }),
    facts: (p.facts || []).map((f, fi) => ({ id: `pf_${i}_${fi}`, title: f.title, value: f.value })),
    faqs: (p.faqs || []).map((f, fi) => ({ id: `pfaq_${i}_${fi}`, question: f.question, answer: f.answer })),
    sources: (p.sources || []).map((s, si) => ({ id: `psrc_${i}_${si}`, title: s.title, url: s.url })),
    comments: [],
    checklist: p.checklist || [],
  }));

  mockClient.post = {
    findMany: async (args?: any) => {
      let results = [...mockPostItems];
      if (args?.where?.published !== undefined) results = results.filter((r) => r.published === args.where.published);
      if (args?.where?.authorId) results = results.filter((r) => r.authorId === args.where.authorId);
      if (args?.where?.categoryId) results = results.filter((r) => r.categoryId === args.where.categoryId);
      if (args?.where?.id?.not) results = results.filter((r) => r.id !== args.where.id.not);
      if (args?.where?.OR) {
        const orFilters = args.where.OR;
        results = results.filter((r) => {
          return orFilters.some((filter: any) => {
            if (filter.title?.contains) return r.title.toLowerCase().includes(filter.title.contains.toLowerCase());
            if (filter.description?.contains) return r.description.toLowerCase().includes(filter.description.contains.toLowerCase());
            if (filter.content?.contains) return r.content.toLowerCase().includes(filter.content.contains.toLowerCase());
            return false;
          });
        });
      }
      if (args?.orderBy) {
        const key = Object.keys(args.orderBy)[0];
        const dir = args.orderBy[key];
        results.sort((a: any, b: any) => {
          const aVal = a[key];
          const bVal = b[key];
          if (aVal instanceof Date && bVal instanceof Date) {
            return dir === "asc" ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
          }
          return dir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        });
      }
      if (args?.take) results = results.slice(0, args.take);
      // Strip heavy fields if only selecting specific fields
      if (args?.select) {
        return results.map((r) => {
          const selected: any = {};
          for (const key of Object.keys(args.select)) {
            selected[key] = (r as any)[key];
          }
          return selected;
        });
      }
      return results;
    },
    findFirst: async (args: any) => {
      const slug = args?.where?.slug;
      const id = args?.where?.id;
      let found = mockPostItems.find((p) => p.slug === slug || p.id === id);
      if (!found && args?.where?.slug) found = mockPostItems.find((p) => p.slug === args.where.slug);
      return found || null;
    },
    findUnique: async (args: any) => {
      const slug = args?.where?.slug;
      const id = args?.where?.id;
      return mockPostItems.find((p) => p.slug === slug || p.id === id) || null;
    },
    count: async () => mockPostItems.length,
    create: async (args: any) => ({ id: `post_new_${Date.now()}`, ...args?.data, createdAt: new Date(), updatedAt: new Date() }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data, updatedAt: new Date() }),
    upsert: async (args: any) => ({ id: args?.where?.slug || `post_${Date.now()}`, ...args?.create, ...args?.update }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // POST CATEGORY — derived from blog posts
  // ─────────────────────────────────────────────────
  const uniqueCategories = new Map<string, { id: string; name: string; slug: string }>();
  allPosts.forEach((p) => {
    const name = p.categoryName || "General";
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    if (!uniqueCategories.has(slug)) {
      uniqueCategories.set(slug, { id: `cat_${slug}`, name, slug });
    }
  });
  const postCategories = Array.from(uniqueCategories.values());

  mockClient.postCategory = {
    findMany: async (args?: any) => {
      let results = [...postCategories];
      if (args?.orderBy?.name) {
        results.sort((a, b) => args.orderBy.name === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      }
      return results;
    },
    findFirst: async (args: any) => {
      if (args?.where?.name) return postCategories.find((c) => c.name === args.where.name) || null;
      if (args?.where?.slug) return postCategories.find((c) => c.slug === args.where.slug) || null;
      return postCategories[0] || null;
    },
    findUnique: async (args: any) => {
      return postCategories.find((c) => c.id === args?.where?.id || c.slug === args?.where?.slug) || null;
    },
    count: async () => postCategories.length,
    create: async (args: any) => ({ id: `cat_${Date.now()}`, ...args?.data }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    delete: async () => ({}),
  };

  // ─────────────────────────────────────────────────
  // NEWS ARTICLE
  // ─────────────────────────────────────────────────
  mockClient.newsArticle = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    count: async () => 0,
    create: async (args: any) => ({ id: `news_${Date.now()}`, ...args?.data }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // PLATFORM — from static TS data files
  // ─────────────────────────────────────────────────
  mockClient.platform = {
    findUnique: async (args: any) => {
      const name = args?.where?.name || args?.where?.id;
      const plat = allPlatforms.find((p) => p.name === name || p.name.toLowerCase() === String(name).toLowerCase());
      if (!plat) return null;
      return {
        id: `plat_${plat.name.toLowerCase()}`,
        ...plat,
      };
    },
    findFirst: async (args: any) => {
      const name = args?.where?.name;
      // Support insensitive search via OR array
      if (args?.where?.OR) {
        for (const condition of args.where.OR) {
          if (condition.name?.equals) {
            const found = allPlatforms.find((p) => p.name.toLowerCase() === condition.name.equals.toLowerCase());
            if (found) return { id: `plat_${found.name.toLowerCase()}`, ...found };
          }
          if (condition.id) {
            const found = allPlatforms.find((p) => `plat_${p.name.toLowerCase()}` === condition.id || p.name.toLowerCase() === condition.id.toLowerCase());
            if (found) return { id: `plat_${found.name.toLowerCase()}`, ...found };
          }
        }
        return null;
      }
      const plat = allPlatforms.find((p) => p.name === name || p.name.toLowerCase() === String(name || "").toLowerCase());
      if (!plat) return null;
      return {
        id: `plat_${plat.name.toLowerCase()}`,
        ...plat,
      };
    },
    findMany: async (args?: any) => {
      let results = allPlatforms.map((plat) => ({
        id: `plat_${plat.name.toLowerCase()}`,
        ...plat,
      }));
      if (args?.where?.name?.in) {
        results = results.filter((p) => args.where.name.in.includes(p.name));
      }
      if (args?.select) {
        return results.map((r) => {
          const selected: any = {};
          for (const key of Object.keys(args.select)) {
            selected[key] = (r as any)[key];
          }
          return selected;
        });
      }
      return results;
    },
    count: async () => allPlatforms.length,
    create: async (args: any) => ({
      id: `plat_${args?.data?.name?.toLowerCase() || 'unknown'}`,
      ...args?.data,
    }),
    update: async (args: any) => ({
      id: args?.where?.id || 'unknown',
      ...args?.data,
    }),
    upsert: async (args: any) => ({
      id: `plat_${args?.create?.name?.toLowerCase() || 'unknown'}`,
      ...args?.create,
    }),
  };

  // ─────────────────────────────────────────────────
  // NOTIFICATION — in-memory mock
  // ─────────────────────────────────────────────────
  mockClient.notification = {
    findMany: async () => [],
    count: async () => 0,
    create: async (args: any) => ({ id: `notif_${Date.now()}`, ...args?.data, read: false, createdAt: new Date() }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    updateMany: async () => ({ count: 0 }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // BOOKMARK — in-memory mock
  // ─────────────────────────────────────────────────
  mockClient.bookmark = {
    findFirst: async () => null,
    findMany: async () => [],
    count: async () => 0,
    create: async (args: any) => ({ id: `bm_${Date.now()}`, ...args?.data, createdAt: new Date() }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // COMMENT — in-memory mock
  // ─────────────────────────────────────────────────
  mockClient.comment = {
    findFirst: async () => null,
    findUnique: async () => null,
    findMany: async () => [],
    count: async () => 0,
    create: async (args: any) => ({ id: `cmt_${Date.now()}`, ...args?.data, status: "PENDING", createdAt: new Date() }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    updateMany: async () => ({ count: 0 }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // COMMUNITY MODELS — forum categories, topics, posts
  // ─────────────────────────────────────────────────
  mockClient.forumCategory = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    count: async () => 0,
    create: async (args: any) => ({ id: `fc_${Date.now()}`, ...args?.data }),
    upsert: async (args: any) => ({ id: `fc_${Date.now()}`, ...args?.create, ...args?.update }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    delete: async () => ({}),
  };

  mockClient.forumTopic = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    count: async () => 0,
    create: async (args: any) => ({ id: `ft_${Date.now()}`, ...args?.data }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    delete: async () => ({}),
  };

  mockClient.forumPost = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    count: async () => 0,
    create: async (args: any) => ({ id: `fp_${Date.now()}`, ...args?.data }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    delete: async () => ({}),
  };

  // ─────────────────────────────────────────────────
  // FEATURE CATEGORY / COMPARISON CATEGORY
  // ─────────────────────────────────────────────────
  const featureCategoryNames = new Set<string>();
  allPlatforms.forEach((p) => p.features.forEach((f) => featureCategoryNames.add(f.categoryName)));
  const featureCategories = Array.from(featureCategoryNames).map((name) => ({
    id: `fcat_${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
  }));

  mockClient.featureCategory = {
    findMany: async (args?: any) => {
      let results = [...featureCategories];
      if (args?.orderBy?.name) results.sort((a, b) => args.orderBy.name === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      return results;
    },
    findFirst: async (args: any) => featureCategories.find((c) => c.name === args?.where?.name) || null,
    findUnique: async (args: any) => featureCategories.find((c) => c.id === args?.where?.id || c.name === args?.where?.name) || null,
    count: async () => featureCategories.length,
    create: async (args: any) => ({ id: `fcat_${Date.now()}`, ...args?.data }),
    upsert: async (args: any) => ({ id: args?.where?.name || `fcat_${Date.now()}`, ...args?.create, ...args?.update }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    delete: async () => ({}),
  };

  // Comparison categories — derive from static comparison data
  const compCategoryNames = new Set<string>();
  allComparisons.forEach((c) => { if (c.category) compCategoryNames.add(c.category); });
  const compCategories = Array.from(compCategoryNames).map((name) => ({
    id: `ccat_${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
  }));

  mockClient.comparisonCategory = {
    findMany: async (args?: any) => {
      let results = [...compCategories];
      if (args?.orderBy?.name) results.sort((a, b) => args.orderBy.name === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      return results;
    },
    findFirst: async (args: any) => compCategories.find((c) => c.name === args?.where?.name) || null,
    findUnique: async (args: any) => compCategories.find((c) => c.id === args?.where?.id) || null,
    count: async () => compCategories.length,
    create: async (args: any) => ({ id: `ccat_${Date.now()}`, ...args?.data }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    delete: async () => ({}),
  };

  // ─────────────────────────────────────────────────
  // PLATFORM FEATURE / PRICING TIER
  // ─────────────────────────────────────────────────
  mockClient.platformFeature = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async (args: any) => ({ id: `pf_${Date.now()}`, ...args?.data }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    upsert: async (args: any) => ({ id: `pf_${Date.now()}`, ...args?.create, ...args?.update }),
    deleteMany: async () => ({ count: 0 }),
  };

  mockClient.pricingTier = {
    findMany: async () => [],
    create: async (args: any) => ({ id: `tier_${Date.now()}`, ...args?.data }),
    createMany: async () => ({ count: 0 }),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // FACT / FAQ — stand-alone models
  // ─────────────────────────────────────────────────
  mockClient.fact = {
    findMany: async () => [],
    create: async (args: any) => ({ id: `fact_${Date.now()}`, ...args?.data }),
    deleteMany: async () => ({ count: 0 }),
  };

  mockClient.faq = {
    findMany: async () => [],
    create: async (args: any) => ({ id: `faq_${Date.now()}`, ...args?.data }),
    deleteMany: async () => ({ count: 0 }),
  };

  // ─────────────────────────────────────────────────
  // Add standard Prisma methods
  // ─────────────────────────────────────────────────
  mockClient.$disconnect = async () => {};
  mockClient.$connect = async () => {};

  // Return a proxy that dynamically handles any model accessor to prevent crashes
  return new Proxy(mockClient, {
    get(target, prop) {
      const propStr = String(prop);
      if (propStr === '$disconnect' || propStr === '$connect') {
        return async () => {};
      }
      if (propStr.startsWith('$')) {
        return async (...args: any[]) => {
          console.log(`[Mock Prisma] Intercepted client method: ${propStr}`);
          if (propStr === '$transaction' && typeof args[0] === 'function') {
            return await args[0](target);
          }
          if (propStr === '$transaction' && Array.isArray(args[0])) {
            return await Promise.all(args[0]);
          }
          return {};
        };
      }

      if (mockClient[propStr]) {
        return mockClient[propStr];
      }

      // Fallback model proxy for any other model not explicitly mocked
      return new Proxy({}, {
        get(modelTarget, method) {
          return async () => {
            console.log(`[Mock Prisma Fallback] Intercepted ${propStr}.${String(method)}`);
            if (String(method) === 'findMany') return [];
            if (String(method) === 'count') return 0;
            if (String(method) === 'deleteMany') return { count: 0 };
            if (String(method) === 'updateMany') return { count: 0 };
            if (String(method) === 'createMany') return { count: 0 };
            return null;
          };
        }
      });
    }
  });
};

const getPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  const isSeeding = process.argv.some(arg => arg.includes('seed')) || process.env.npm_lifecycle_event?.includes('seed');
  const bypassMock = process.env.MOCK_PRISMA === "false" || process.env.BYPASS_MOCK === "true" || isSeeding;

  // Use the Mock Prisma Client if:
  // 1. BYPASS_MOCK is not "true" (default: use mock)
  // 2. DATABASE_URL is missing, dummy, or localhost
  // 3. BUILD_TYPE is "static"
  if (
    !connectionString ||
    (!bypassMock && (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"))) ||
    connectionString.includes("example.com") ||
    process.env.BUILD_TYPE === "static" ||
    (!bypassMock && !connectionString)
  ) {
    return createMockPrismaClient();
  }

  // If bypassMock is false and we have a real connection string,
  // still use mock (user wants zero-database mode)
  if (!bypassMock) {
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

export default prisma as PrismaClient;
