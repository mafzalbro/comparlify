
'use client';

import { type Post, type PostCategory } from '@prisma/client';
import { PostForm } from '../../_components/post-form';

export function EditPostPageClient({ post, categories }: { post: Post, categories: PostCategory[] }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <PostForm post={post} categories={categories} />
    </div>
  );
}
