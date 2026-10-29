import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getContent } from "@/lib/content";
import { isModuleEnabled, isRouteEnabled } from "@/lib/module-navigation";
import { TOOLS } from "@/data/tools/registry";
import { allPlatforms as staticPlatforms } from "@/data/compare/platforms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const STATIC_LAST_MODIFIED = new Date("2026-04-24T00:00:00.000Z");
  const TOOLS_LAST_MODIFIED  = new Date("2026-04-24T00:00:00.000Z");

  const siteUrl = "https://comparlify.com";
  const content = await getContent();

  const isBlogOn = isModuleEnabled("blog", content);
  const isCompareOn = isModuleEnabled("compare", content);
  const isToolsOn = isModuleEnabled("tools", content);
  const isAIOn = isModuleEnabled("ai", content);
  const isNewsOn = isModuleEnabled("news", content);
  const isCommunityOn = isModuleEnabled("community", content);

  // Fetch only data for enabled modules
  const [
    posts,
    comparisons,
    platforms,
    aiTools,
    news,
    forumCategories,
    forumTopics,
    siteContent,
  ] = await Promise.all([
    isBlogOn
      ? prisma.post.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
    isCompareOn
      ? prisma.comparison.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
    prisma.platform.findMany({
      select: { name: true, updatedAt: true },
    }).catch(() => []),
    // DB-backed tools are AI assistant tools (registry covers the rest)
    isAIOn
      ? prisma.tool.findMany({
          where: { enabled: true },
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
    isNewsOn
      ? prisma.newsArticle.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
    isCommunityOn
      ? prisma.forumCategory.findMany({
          select: { slug: true, updatedAt: true },
        })
      : Promise.resolve([]),
    isCommunityOn
      ? prisma.forumTopic.findMany({
          where: { status: "APPROVED" },
          select: { id: true, updatedAt: true },
        })
      : Promise.resolve([]),
    prisma.siteContent.findMany({
      where: { group: "Legal Pages" },
      select: { key: true, updatedAt: true },
    }),
  ]);

  const postUrls = posts.map((post: any) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const comparisonUrls = comparisons.map((comparison: any) => ({
    url: `${siteUrl}/${comparison.slug}`,
    lastModified: comparison.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // ── Registry-driven tool URLs (static, non-AI tools) ────────────────
  // Path format mirrors getToolBySlug() in src/data/tools/registry.ts:
  //   - with subcategory:    /tools/{category}/{subcategory}/{slug}
  //   - without subcategory: /tools/{category}/{slug}
  const registryToolUrls = isToolsOn
    ? TOOLS.map((tool) => ({
        url: tool.subcategory
          ? `${siteUrl}/tools/${tool.category}/${tool.subcategory}/${tool.slug}`
          : `${siteUrl}/tools/${tool.category}/${tool.slug}`,
        lastModified: TOOLS_LAST_MODIFIED,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    : [];

  // ── DB-backed AI tool URLs (Legacy Creator AI tools) ────────────────
  // Gated on the AI module, not the tools module, since these live
  // under the "AI Assistants" category.
  const aiToolUrls = isAIOn
    ? aiTools.map((tool: any) => ({
        url: `${siteUrl}/tools/ai/${tool.slug}`,
        lastModified: tool.updatedAt ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    : [];

  const toolUrls = [...registryToolUrls, ...aiToolUrls];

  const newsUrls = news.map((article: any) => ({
    url: `${siteUrl}/news/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryUrls = forumCategories.map((cat: any) => ({
    url: `${siteUrl}/community/category/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const topicUrls = forumTopics.map((topic: any) => ({
    url: `${siteUrl}/community/topic/${topic.id}`,
    lastModified: topic.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const legalUrls = siteContent.map((doc: any) => ({
    url: `${siteUrl}/legal/${doc.key.replace("legal.", "")}`,
    lastModified: doc.updatedAt,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  // Deduplicate platforms across static data and DB
  const platformSlugMap = new Map<string, { slug: string; updatedAt: Date }>();
  for (const sp of staticPlatforms) {
    const s = sp.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (s) {
      platformSlugMap.set(s, { slug: s, updatedAt: STATIC_LAST_MODIFIED });
    }
  }
  for (const dp of platforms as any[]) {
    if (dp?.name) {
      const s = dp.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (s) {
        platformSlugMap.set(s, { slug: s, updatedAt: dp.updatedAt || STATIC_LAST_MODIFIED });
      }
    }
  }

  const platformItems = Array.from(platformSlugMap.values());

  const platformUrls = platformItems.map((p) => ({
    url: `${siteUrl}/platform/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const alternativesUrls = platformItems.map((p) => ({
    url: `${siteUrl}/alternatives/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Define static routes and filter by route module enablement
  const allStaticRoutes = [
    "/",
    "/alternatives",
    "/blog",
    "/compare",
    "/tools",
    "/news",
    "/community",
  ];

  const staticRoutes = allStaticRoutes.filter((route) =>
    route === "/" || route === "/alternatives" ? true : isRouteEnabled(route, content),
  );

  const staticUrls = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: route === "/" || route === "/alternatives" ? ("daily" as const) : ("weekly" as const),
    priority: route === "/" ? 1.0 : 0.8,
  }));

  return [
    ...staticUrls,
    ...platformUrls,
    ...alternativesUrls,
    ...postUrls,
    ...comparisonUrls,
    ...toolUrls,
    ...newsUrls,
    ...categoryUrls,
    ...topicUrls,
    ...legalUrls,
  ];
}