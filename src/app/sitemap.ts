import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { allTools } from './(main)/tools/tools';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://www.comparlify.com'; // Replace with your actual domain

  // Get dynamic routes
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const comparisons = await prisma.comparison.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const postUrls = posts.map(post => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const comparisonUrls = comparisons.map(comparison => ({
    url: `${siteUrl}/compare/${comparison.slug}`,
    lastModified: comparison.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const toolUrls = allTools.map(tool => ({
    url: `${siteUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Define static routes
  const staticRoutes = [
    '/',
    '/about',
    '/blog',
    '/compare',
    '/contact',
    '/tools',
  ];

  const staticUrls = staticRoutes.map(route => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1.0 : 0.7,
  }));

  return [...staticUrls, ...postUrls, ...comparisonUrls, ...toolUrls];
}
