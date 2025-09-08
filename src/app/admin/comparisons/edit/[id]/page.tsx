
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditComparisonPageClient } from './page-client';
import type { Comparison, Platform } from '@prisma/client';

async function getComparison(id: string): Promise<Comparison | null> {
    return prisma.comparison.findUnique({
        where: { id },
    });
}

async function getPlatforms(): Promise<Platform[]> {
    return prisma.platform.findMany({ orderBy: { name: 'asc' }});
}

export default async function EditComparisonPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const [comparison, platforms] = await Promise.all([
        getComparison(params.id),
        getPlatforms()
    ]);

    if (!comparison) {
        notFound();
    }

    return <EditComparisonPageClient comparison={comparison} platforms={platforms} />;
}
