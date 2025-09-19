
import prisma from '@/lib/prisma';
import { NewComparisonPageClient } from './page-client';
import type { Platform, ComparisonCategory } from '@prisma/client';

async function getPlatforms(): Promise<Platform[]> {
    return prisma.platform.findMany({ orderBy: { name: 'asc' }});
}

async function getCategories(): Promise<ComparisonCategory[]> {
    return prisma.comparisonCategory.findMany({ orderBy: { name: 'asc' }});
}

export default async function NewComparisonPage() {
  const [platforms, categories] = await Promise.all([
    getPlatforms(),
    getCategories()
  ]);

  return <NewComparisonPageClient platforms={platforms} categories={categories} />;
}
