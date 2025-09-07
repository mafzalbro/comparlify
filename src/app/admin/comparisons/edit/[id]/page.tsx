import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ComparisonForm } from '../../_components/comparison-form';

async function getComparison(id: string) {
  const comparison = await prisma.comparison.findUnique({
    where: { id },
  });
  return comparison;
}

export default async function EditComparisonPage({ params }: { params: { id: string } }) {
  const [comparison, platforms] = await Promise.all([
    getComparison(params.id),
    prisma.platform.findMany()
  ]);

  if (!comparison) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Comparison</h1>
      <ComparisonForm comparison={comparison} platforms={platforms} />
    </div>
  );
}
