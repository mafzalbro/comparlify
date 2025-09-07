import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PlatformForm } from '../../_components/platform-form';

async function getPlatform(id: string) {
  const platform = await prisma.platform.findUnique({
    where: { id },
    include: {
        features: true
    }
  });
  return platform;
}

export default async function EditPlatformPage({ params }: { params: { id: string } }) {
  const [platform, features, featureCategories] = await Promise.all([
    getPlatform(params.id),
    prisma.feature.findMany({ include: { category: true }, orderBy: { category: { name: 'asc' } } }),
    prisma.featureCategory.findMany({ orderBy: { name: 'asc' } })
  ]);

  if (!platform) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Platform</h1>
      <PlatformForm platform={platform} features={features} featureCategories={featureCategories} />
    </div>
  );
}
