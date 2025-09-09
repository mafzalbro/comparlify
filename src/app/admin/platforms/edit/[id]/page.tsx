
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditPlatformPageClient } from './page-client';
import type { Platform, Feature, PlatformFeature, FeatureCategory } from '@prisma/client';

type PlatformWithFeatures = Platform & { features: PlatformFeature[] };

async function getPlatform(id: string): Promise<PlatformWithFeatures | null> {
    return prisma.platform.findUnique({
        where: { id },
        include: { features: true },
    });
}

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

export default async function EditPlatformPage({ params }: { params: { id: string } }) {
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
