
import prisma from '@/lib/prisma';
import { NewPlatformPageClient } from './page-client';
import { cache } from 'react';

const getFeatures = cache(async () => {
    return prisma.feature.findMany({
        include: { category: true },
        orderBy: { name: 'asc' },
    });
});

const getFeatureCategories = cache(async () => {
    return prisma.featureCategory.findMany({
        orderBy: { name: 'asc' },
    });
});

export default async function NewPlatformPage() {
    const [features, featureCategories] = await Promise.all([
        getFeatures(),
        getFeatureCategories(),
    ]);

    return (
        <NewPlatformPageClient
            features={features}
            featureCategories={featureCategories}
        />
    );
}
