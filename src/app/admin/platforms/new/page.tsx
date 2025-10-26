
import prisma from '@/lib/prisma';
import { NewPlatformPageClient } from './page-client';
import { cache } from 'react';
import type { Image } from '@prisma/client';

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

const getImages = cache(async (): Promise<Image[]> => {
    return prisma.image.findMany({ orderBy: { createdAt: 'desc' }});
})

export default async function NewPlatformPage() {
    const [features, featureCategories, images] = await Promise.all([
        getFeatures(),
        getFeatureCategories(),
        getImages(),
    ]);

    return (
        <NewPlatformPageClient
            features={features}
            featureCategories={featureCategories}
            images={images}
        />
    );
}
