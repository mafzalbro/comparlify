
import prisma from '@/lib/prisma';
import { NewFeaturePageClient } from './page-client';
import type { FeatureCategory } from '@prisma/client';
import { cache } from 'react';

const getFeatureCategories = cache(async (): Promise<FeatureCategory[]> => {
    return prisma.featureCategory.findMany({ orderBy: { name: 'asc' }});
});

export default async function NewFeaturePage() {
  const categories = await getFeatureCategories();
  return <NewFeaturePageClient categories={categories} />;
}
