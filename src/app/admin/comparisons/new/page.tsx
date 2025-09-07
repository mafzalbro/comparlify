import { NewComparisonPageClient } from './page-client';
import prisma from '@/lib/prisma';

async function getPlatforms() {
  return prisma.platform.findMany();
}

export default async function NewComparisonPage() {
  const platforms = await getPlatforms();
  return <NewComparisonPageClient platforms={platforms} />;
}
