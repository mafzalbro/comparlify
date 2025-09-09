
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditComparisonPageClient } from './page-client';
import type { Comparison, Platform, Fact, FAQ } from '@prisma/client';
import { cache } from 'react';

type ComparisonWithRelations = Comparison & {
    facts: Fact[];
    faqs: FAQ[];
}

export const generateStaticParams = cache(async () => {
    const comparisons = await prisma.comparison.findMany({ where: { published: true } });
    return comparisons.map((comp) => ({
      id: comp.id,
    }));
});

async function getComparison(id: string): Promise<ComparisonWithRelations | null> {
    return prisma.comparison.findUnique({
        where: { id },
        include: {
            facts: true,
            faqs: true,
        },
    });
}

async function getPlatforms(): Promise<Platform[]> {
    return prisma.platform.findMany({ orderBy: { name: 'asc' }});
}

export default async function EditComparisonPage(props: { params: { id: string } }) {
    const { id } = props.params;
    const [comparison, platforms] = await Promise.all([
        getComparison(id),
        getPlatforms()
    ]);

    if (!comparison) {
        notFound();
    }

    return <EditComparisonPageClient comparison={comparison} platforms={platforms} />;
}
