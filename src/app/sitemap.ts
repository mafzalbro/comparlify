import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://www.comparlify.com";

  // Get dynamic routes
  const [
    posts,
    comparisons,
    tools,
    news,
    forumCategories,
    forumTopics,
    siteContent,
  ] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.comparison.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.tool.findMany({
      where: { enabled: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.newsArticle.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.forumCategory.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.forumTopic.findMany({
      where: { status: "APPROVED" },
      select: { id: true, updatedAt: true },
    }),
    prisma.siteContent.findMany({
      where: { group: "Legal Pages" },
      select: { key: true, updatedAt: true },
    }),
  ]);

  const postUrls = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const comparisonUrls = comparisons.map((comparison) => ({
    url: `${siteUrl}/compare/${comparison.slug}`,
    lastModified: comparison.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const toolUrls = tools.map((tool) => ({
    url: `${siteUrl}/tools?tool=${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const newsUrls = news.map((article) => ({
    url: `${siteUrl}/news/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryUrls = forumCategories.map((cat) => ({
    url: `${siteUrl}/community/category/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const topicUrls = forumTopics.map((topic) => ({
    url: `${siteUrl}/community/topic/${topic.id}`,
    lastModified: topic.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const legalUrls = siteContent.map((doc) => ({
    url: `${siteUrl}/legal/${doc.key.replace("legal.", "")}`,
    lastModified: doc.updatedAt,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  // Define static routes
  const staticRoutes = [
    "/",
    "/blog",
    "/compare",
    "/tools",
    "/news",
    "/community",
  ];

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
