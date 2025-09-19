
import { PostForm } from '../_components/post-form';
import prisma from '@/lib/prisma';
import type { PostCategory } from '@prisma/client';

async function getCategories(): Promise<PostCategory[]> {
    return prisma.postCategory.findMany({ orderBy: { name: 'asc' }});
}

export default async function NewPostPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <PostForm categories={categories} />
    </div>
  );
}
