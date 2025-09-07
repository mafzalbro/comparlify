import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditPlatformPageClient } from './page-client';

async function getPlatform(id: string) {
  const platform = await prisma.platform.findUnique({
    where: { id },
    include: {
      features: true,
    },
  });
  return platform;
}

async function getFeatures() {
    return prisma.feature.findMany({ include: { category: true }, orderBy: { category: { name: 'asc' } } });
}

async function getFeatureCategories() {
    return prisma.featureCategory.findMany({ orderBy: { name: 'asc' } });
}

export default async function EditPlatformPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [platform, features, featureCategories] = await Promise.all([
    getPlatform(params.id),
    getFeatures(),
    getFeatureCategories()
  ]);

  if (!platform) {
    notFound();
  }

  return (
    <EditPlatformPageClient
      platform={platform}
      features={features}
      featureCategories={featureCategories}
    />
  );
}
