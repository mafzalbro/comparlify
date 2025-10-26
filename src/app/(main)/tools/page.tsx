
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateSeoMetadata } from '@/lib/seo';
import { ToolsClientPage } from './_components/tools-client-page';
import { getContent } from '@/lib/content';
import prisma from '@/lib/prisma';
import { type Tool } from '@prisma/client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = generateSeoMetadata({
  title: 'AI Creator Tools',
  description: 'A suite of intelligent tools designed to streamline your course creation workflow, from outlining content to marketing.',
  path: '/tools'
});

async function getTools(): Promise<Tool[]> {
  const dbTools = await prisma.tool.findMany({
    where: { enabled: true },
    orderBy: [{ category: 'asc' }, { title: 'asc' }]
  });

  // We only pass serializable data to the client component.
  // The icon component will be looked up on the client side.
  return dbTools;
}

export default async function ToolsPage() {
  const content = await getContent();
  if (content['module.tools.enabled'] === 'false') {
    notFound();
  }

  const tools = await getTools();

  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <ToolsClientPage allTools={tools} />
    </Suspense>
  );
}
