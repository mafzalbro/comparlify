
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditPlatformPageClient } from './page-client';
import type { Platform, Feature, PlatformFeature, FeatureCategory } from '@prisma/client';
import { cache } from 'react';

type PlatformWithFeatures = Platform & { features: PlatformFeature[] };

const getPlatform = cache(async (id: string): Promise<PlatformWithFeatures | null> => {
    return prisma.platform.findUnique({
        where: { id },
        include: { features: true },
    });
});

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

export default async function EditPlatformPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const [platform, features, featureCategories] = await Promise.all([
        getPlatform(id),
        getFeatures(),
        getFeatureCategories(),
    ]);

    if (!platform) {
        notFound();
    }

    return (
        <EditPlatformPageClient
            platform={platform}
            features={features}
            featureCategories={featureCategories}
        />
    );
}
