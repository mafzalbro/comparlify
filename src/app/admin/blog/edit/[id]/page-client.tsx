
'use client';

import { type Post, type PostCategory } from '@prisma/client';
import { PostForm } from '../../_components/post-form';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

export function EditPostPageClient({ post, categories }: { post: Post, categories: PostCategory[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <Button asChild variant="ghost">
            <Link href="/admin/blog"><ArrowLeft className="mr-2 h-4 w-4" />Back to Posts</Link>
        </Button>
      </div>
      <PostForm post={post} categories={categories} />
    </div>
  );
}
