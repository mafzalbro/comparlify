
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditPostPageClient } from './page-client';

async function getPost(id: string) {
    const post = await prisma.post.findUnique({
        where: { id },
    });
    return post;
}

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await getPost(params.id);

    if (!post) {
        notFound();
    }

    return <EditPostPageClient post={post} />;
}
