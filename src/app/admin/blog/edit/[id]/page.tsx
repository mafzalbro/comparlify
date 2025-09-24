
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditPostPageClient } from './page-client';
import { cache } from 'react';
import type { PostCategory } from '@prisma/client';

export const revalidate = 3600; // 3600 seconds = 1 hour

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

async function getCategories(): Promise<PostCategory[]> {
    return prisma.postCategory.findMany({ orderBy: { name: 'asc' } });
}

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const [post, categories] = await Promise.all([
        getPost(id),
        getCategories()
    ]);

    if (!post) {
        notFound();
    }

    return <EditPostPageClient post={post} categories={categories} />;
}
