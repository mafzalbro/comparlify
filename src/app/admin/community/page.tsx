'use server';

import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CommunityModerationDataTable } from './_components/community-moderation-table';
import { CommunityFilter } from './_components/community-filter';
import type { SearchParams } from '@/types/next';
import type { ForumPostStatus, ForumTopicStatus } from '@prisma/client';

export type ModerationItem = 
    | ({ type: 'TOPIC' } & Awaited<ReturnType<typeof getTopics>>[0])
    | ({ type: 'POST' } & Awaited<ReturnType<typeof getPosts>>[0]);

async function getTopics() {
    return prisma.forumTopic.findMany({
        where: { status: 'PENDING' },
        include: { author: true, category: true },
        orderBy: { createdAt: 'desc' }
    });
}

async function getPosts() {
    return prisma.forumPost.findMany({
        where: { status: 'PENDING' },
        include: { author: true, topic: true },
        orderBy: { createdAt: 'desc' }
    });
}

export default async function AdminCommunityPage({ searchParams }: { searchParams: SearchParams }) {
  const status = (searchParams?.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL' | undefined) ?? 'PENDING';

  const topics = await prisma.forumTopic.findMany({
    where: status === 'ALL' ? {} : { status: status as ForumTopicStatus },
    include: { author: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  const posts = await prisma.forumPost.findMany({
    where: status === 'ALL' ? {} : { status: status as ForumPostStatus },
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
                <CommunityFilter currentFilter={status} />
            </div>
          <CommunityModerationDataTable data={moderationItems} />
        </CardContent>
      </Card>
    </div>
  );
}
