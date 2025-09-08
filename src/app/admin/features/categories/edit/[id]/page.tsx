
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FeatureCategoryForm } from '../../_components/feature-category-form';
import type { FeatureCategory } from '@prisma/client';

async function getFeatureCategory(id: string): Promise<FeatureCategory | null> {
    return prisma.featureCategory.findUnique({
        where: { id },
    });
}

export default async function EditFeatureCategoryPage({ params }: { params: { id: string } }) {
    const category = await getFeatureCategory(params.id);

    if (!category) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Feature Category</h1>
            <FeatureCategoryForm category={category} />
        </div>
    );
}
