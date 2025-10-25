
import { PostForm } from '../_components/post-form';
import prisma from '@/lib/prisma';
import type { PostCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getCategories(): Promise<PostCategory[]> {
    return prisma.postCategory.findMany({ orderBy: { name: 'asc' }});
}

export default async function NewPostPage() {
  const categories = await getCategories();
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <Button asChild variant="ghost">
            <Link href="/admin/blog"><ArrowLeft className="mr-2 h-4 w-4" />Back to Posts</Link>
          </Button>
      </div>
      <PostForm categories={categories} />
    </div>
  );
}
