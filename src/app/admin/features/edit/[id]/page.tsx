
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditFeaturePageClient } from './page-client';
import type { Feature, FeatureCategory } from '@prisma/client';

async function getFeature(id: string): Promise<Feature | null> {
    return prisma.feature.findUnique({
        where: { id },
    });
}

async function getFeatureCategories(): Promise<FeatureCategory[]> {
    return prisma.featureCategory.findMany({ orderBy: { name: 'asc' }});
}

export default async function EditFeaturePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const [feature, categories] = await Promise.all([
        getFeature(params.id),
        getFeatureCategories()
    ]);

    if (!feature) {
        notFound();
    }

    return <EditFeaturePageClient feature={feature} categories={categories} />;
}
