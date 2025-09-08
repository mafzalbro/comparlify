
import prisma from '@/lib/prisma';
import { NewPlatformPageClient } from './page-client';

async function getFeatures() {
    return prisma.feature.findMany({
        include: { category: true },
        orderBy: { name: 'asc' },
    });
}

async function getFeatureCategories() {
    return prisma.featureCategory.findMany({
        orderBy: { name: 'asc' },
    });
}

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
