
import { PostForm } from '../_components/post-form';
import prisma from '@/lib/prisma';
import type { PostCategory, Image } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cache } from 'react';

const getCategories = cache(async (): Promise<PostCategory[]> => {
    return prisma.postCategory.findMany({ orderBy: { name: 'asc' }});
});

const getImages = cache(async (): Promise<Image[]> => {
    return prisma.image.findMany({ orderBy: { createdAt: 'desc' }});
})

export default async function NewPostPage() {
  const [categories, images] = await Promise.all([
    getCategories(),
    getImages()
  ]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <Button asChild variant="ghost">
            <Link href="/admin/blog"><ArrowLeft className="mr-2 h-4 w-4" />Back to Posts</Link>
          </Button>
      </div>
      <PostForm categories={categories} images={images} />
    </div>
  );
}
