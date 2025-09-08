
import prisma from '@/lib/prisma';
import { NewComparisonPageClient } from './page-client';
import type { Platform } from '@prisma/client';

async function getPlatforms(): Promise<Platform[]> {
    return prisma.platform.findMany({ orderBy: { name: 'asc' }});
}

export default async function NewComparisonPage() {
  const platforms = await getPlatforms();

  return <NewComparisonPageClient platforms={platforms} />;
}
