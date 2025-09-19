
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ComparisonCategoryForm } from '../../_components/comparison-category-form';
import type { ComparisonCategory } from '@prisma/client';

async function getCategory(id: string): Promise<ComparisonCategory | null> {
    return prisma.comparisonCategory.findUnique({
        where: { id },
    });
}

export default async function EditComparisonCategoryPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const category = await getCategory(id);

    if (!category) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Comparison Category</h1>
            <ComparisonCategoryForm category={category} />
        </div>
    );
}
