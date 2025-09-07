import { PlatformForm } from '../_components/platform-form';
import prisma from '@/lib/prisma';

export default async function NewPlatformPage() {
  const features = await prisma.feature.findMany({ include: { category: true }, orderBy: { category: { name: 'asc' } } });
  const featureCategories = await prisma.featureCategory.findMany({ orderBy: { name: 'asc' } });
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Platform</h1>
      <PlatformForm features={features} featureCategories={featureCategories} />
    </div>
  );
}
