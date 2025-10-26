
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditComparisonPageClient } from './page-client';
import type { Comparison, Platform, Fact, Faq, ComparisonCategory } from '@prisma/client';
import { cache } from 'react';

type ComparisonWithRelations = Comparison & {
    facts: Fact[];
    faqs: Faq[];
}

export const generateStaticParams = cache(async () => {
    const comparisons = await prisma.comparison.findMany({ where: { published: true } });
    return comparisons.map((comp) => ({
      id: comp.id,
    }));
});

const getComparison = cache(async (id: string): Promise<ComparisonWithRelations | null> => {
    return prisma.comparison.findUnique({
        where: { id },
        include: {
            facts: true,
            faqs: true,
        },
    });
});

const getPlatforms = cache(async (): Promise<Platform[]> => {
    return prisma.platform.findMany({ orderBy: { name: 'asc' }});
});

const getCategories = cache(async (): Promise<ComparisonCategory[]> => {
    return prisma.comparisonCategory.findMany({ orderBy: { name: 'asc' }});
});

export default async function EditComparisonPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const [comparison, platforms, categories] = await Promise.all([
        getComparison(id),
        getPlatforms(),
        getCategories()
    ]);

    if (!comparison) {
        notFound();
    }

    return <EditComparisonPageClient comparison={comparison} platforms={platforms} categories={categories} />;
}
