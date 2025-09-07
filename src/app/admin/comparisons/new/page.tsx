import { ComparisonForm } from '../_components/comparison-form';
import prisma from '@/lib/prisma';

export default async function NewComparisonPage() {
  const platforms = await prisma.platform.findMany();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Comparison</h1>
      <ComparisonForm platforms={platforms} />
    </div>
  );
}
