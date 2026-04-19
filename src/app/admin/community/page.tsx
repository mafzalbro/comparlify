
'use server';

import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CommunityModerationDataTable } from './_components/community-moderation-table';
import { CommunityFilter } from './_components/community-filter';
import type { SearchParams } from '@/types/next';
import type { ForumPost, ForumTopic, User, ForumCategory, ForumTopicStatus, ForumPostStatus } from '@prisma/client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from "next/link";

export type ModerationItem =
    | ({ type: 'TOPIC' } & (ForumTopic & { author: User, category: ForumCategory }))
    | ({ type: 'POST' } & (ForumPost & { author: User, topic: ForumTopic }));

async function getModerationItems(status: ForumTopicStatus | 'ALL') {
  const whereClause = status === 'ALL' ? {} : { status };

  const topics = await prisma.forumTopic.findMany({
    where: whereClause,
    include: { author: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  const posts = await prisma.forumPost.findMany({
    where: whereClause,
    include: { author: true, topic: true },
    orderBy: { createdAt: 'desc' }
  });

  const allItems: ModerationItem[] = [
    ...topics.map(t => ({ ...t, type: 'TOPIC' as const })),
    ...posts.map(p => ({ ...p, type: 'POST' as const })),
  ];
  
  return allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}


export default async function AdminCommunityPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const statusParam = searchParams?.status as string | undefined;
  const currentStatus = (statusParam && ['PENDING', 'APPROVED', 'REJECTED', 'ALL'].includes(statusParam)) 
    ? statusParam as ForumTopicStatus | 'ALL' 
    : 'PENDING';

  const moderationItems = await getModerationItems(currentStatus);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community Moderation</h1>
        <Button asChild variant="outline">
          <Link href="/admin/community/categories">Manage Categories</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Queue</CardTitle>
          <CardDescription>
            Review, approve, reject, or delete user-submitted topics and posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
              <Suspense fallback={<Skeleton className="h-8 w-full" />}>
                <CommunityFilter currentFilter={currentStatus} />
              </Suspense>
            </div>
          <CommunityModerationDataTable data={moderationItems} />
        </CardContent>
      </Card>
    </div>
  );
}
