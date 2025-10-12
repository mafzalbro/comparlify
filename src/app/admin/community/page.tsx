
'use server';

import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CommunityModerationDataTable } from './_components/community-moderation-table';
import { CommunityFilter } from './_components/community-filter';
import type { SearchParams } from '@/types/next';
import type { ForumPost, ForumTopic, User, ForumCategory, ForumTopicStatus, ForumPostStatus } from '@prisma/client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export type ModerationItem =
    | ({ type: 'TOPIC' } & (ForumTopic & { author: User, category: ForumCategory }))
    | ({ type: 'POST' } & (ForumPost & { author: User, topic: ForumTopic }));

export default async function AdminCommunityPage({ searchParams }: { searchParams: SearchParams }) {
  const statusParam = searchParams?.status || 'PENDING';
  const status = (['PENDING', 'APPROVED', 'REJECTED', 'ALL'].includes(statusParam as string) ? statusParam : 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

  const whereClause = status === 'ALL' ? {} : { status: status };

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

  const moderationItems: ModerationItem[] = [
    ...topics.map(t => ({ ...t, type: 'TOPIC' as const })),
    ...posts.map(p => ({ ...p, type: 'POST' as const })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community Moderation</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Queue</CardTitle>
          <CardDescription>
            Review, approve, or reject user-submitted topics and posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
              <Suspense fallback={<Skeleton className="h-8 w-full" />}>
                <CommunityFilter />
              </Suspense>
            </div>
          <CommunityModerationDataTable data={moderationItems} />
        </CardContent>
      </Card>
    </div>
  );
}
