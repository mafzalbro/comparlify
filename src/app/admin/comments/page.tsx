

import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { Comment, Post, User, CommentStatus } from '@prisma/client';
import { CommentFilter } from './_components/comment-filter';
import { CommentsDataTable } from './_components/comments-data-table';

type CommentWithRelations = Comment & { author: User, post: Post };

async function getComments({ status }: { status?: CommentStatus | 'ALL' }) {
    const where = status && status !== 'ALL' ? { status } : {};
    
    const comments = await prisma.comment.findMany({
        where,
        include: {
            author: true,
            post: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return comments as CommentWithRelations[];
}

export default async function AdminCommentsPage({ searchParams }: { searchParams: Promise<{ status?: CommentStatus | 'ALL' }>}) {
  const { status } = await searchParams;
  const comments = await getComments({ status: status ?? 'PENDING' });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Comments</h1>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Comment Queue</CardTitle>
            <CardDescription>Review, approve, or reject user comments. You can select multiple comments and moderate them in bulk.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <CommentFilter currentFilter={status} />
            </div>
            <CommentsDataTable data={comments} />
        </CardContent>
      </Card>
    </div>
  );
}

