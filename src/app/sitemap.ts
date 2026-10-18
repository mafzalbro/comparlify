import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getContent } from "@/lib/content";
import { isModuleEnabled, isRouteEnabled } from "@/lib/module-navigation";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://www.comparlify.com";
  const content = await getContent();

  const isBlogOn = isModuleEnabled("blog", content);
  const isCompareOn = isModuleEnabled("compare", content);
  const isToolsOn = isModuleEnabled("tools", content);
  const isNewsOn = isModuleEnabled("news", content);
  const isCommunityOn = isModuleEnabled("community", content);

  // Fetch only data for enabled modules
  const [
    posts,
    comparisons,
    tools,
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
    isToolsOn
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

  const toolUrls = tools.map((tool: any) => ({
    url: `${siteUrl}/tools?tool=${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

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

  // Define static routes and filter by route module enablement
  const allStaticRoutes = [
    "/",
    "/blog",
    "/compare",
    "/tools",
    "/news",
    "/community",
  ];

  const staticRoutes = allStaticRoutes.filter((route) =>
    route === "/" ? true : isRouteEnabled(route, content),
  );

  const staticUrls = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? ("daily" as const) : ("weekly" as const),
    priority: route === "/" ? 1.0 : 0.7,
  }));

  return [
    ...staticUrls,
    ...postUrls,
    ...comparisonUrls,
    ...toolUrls,
    ...newsUrls,
    ...categoryUrls,
    ...topicUrls,
    ...legalUrls,
  ];
}
