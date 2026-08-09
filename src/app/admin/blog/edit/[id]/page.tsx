
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditPostPageClient } from './page-client';
import { cache } from 'react';
import type { PostCategory, Post } from '@prisma/client';

export const revalidate = 0;

export const generateStaticParams = cache(async () => {
    const posts = await prisma.post.findMany({ where: { published: true } });
    return posts.map((post: { id: string }) => ({
        id: post.id,
    }));
});

const getPost = cache(async (id: string): Promise<Post | null> => {
    return prisma.post.findUnique({
        where: { id },
    });
});

const getCategories = cache(async (): Promise<PostCategory[]> => {
    return prisma.postCategory.findMany({ orderBy: { name: 'asc' } });
});

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const [post, categories] = await Promise.all([
        getPost(id),
        getCategories(),
    ]);

    if (!post) {
        notFound();
    }

    return <EditPostPageClient post={post} categories={categories} />;
}
