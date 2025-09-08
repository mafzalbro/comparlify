
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { Comment, Post, User, CommentStatus } from '@prisma/client';
import { CommentActions } from './_components/comment-actions';
import { CommentStatusBadge } from './_components/comment-status-badge';
import { CommentFilter } from './_components/comment-filter';

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
            <CardDescription>Review, approve, or reject user comments.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <CommentFilter currentFilter={status} />
            </div>
            <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[40%]">Comment</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>In Response To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {comments.length > 0 ? comments.map((comment) => (
                    <TableRow key={comment.id}>
                        <TableCell>
                            <p className="text-sm text-muted-foreground line-clamp-3">{comment.content}</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                        </TableCell>
                        <TableCell className="font-medium">
                            {comment.author.name}
                        </TableCell>
                        <TableCell>
                            <Link href={`/blog/${comment.post.slug}`} className="text-sm hover:underline text-primary" target="_blank" rel="noopener noreferrer">
                                {comment.post.title}
                            </Link>
                        </TableCell>
                        <TableCell>
                            <CommentStatusBadge status={comment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                           <CommentActions comment={comment} />
                        </TableCell>
                    </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No comments found for this filter.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
