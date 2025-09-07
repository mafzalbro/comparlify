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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { DeletePostButton } from './_components/delete-post-button';

async function getPosts() {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return posts;
}

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
        <Button asChild>
          <Link href="/admin/blog/new">Create New Post</Link>
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">
                    <Link href={`/admin/blog/edit/${post.id}`} className="hover:underline">{post.title}</Link>
                </TableCell>
                <TableCell>{post.author.name}</TableCell>
                <TableCell>
                  <Badge variant={post.published ? 'default' : 'secondary'}>
                    {post.published ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                    {post.published ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/blog/edit/${post.id}`}>Edit</Link>
                  </Button>
                  <DeletePostButton id={post.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}