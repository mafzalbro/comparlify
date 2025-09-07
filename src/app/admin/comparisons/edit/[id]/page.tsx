import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditComparisonPageClient } from './page-client';

async function getComparison(id: string) {
  const comparison = await prisma.comparison.findUnique({
    where: { id },
  });
  return comparison;
}

async function getPlatforms() {
  return prisma.platform.findMany();
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
