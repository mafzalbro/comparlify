
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditPostPageClient } from './page-client';
import { cache } from 'react';

export const generateStaticParams = cache(async () => {
  const posts = await prisma.post.findMany({ where: { published: true } });
  return posts.map((post) => ({
    id: post.id,
  }));
});

async function getPost(id: string) {
    const post = await prisma.post.findUnique({
        where: { id },
    });
    return post;
}

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return <EditPostPageClient post={post} />;
}
