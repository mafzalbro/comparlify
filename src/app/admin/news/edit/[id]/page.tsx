
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArticleForm } from '../../_components/article-form';
import type { NewsArticle } from '@prisma/client';
import { cache } from 'react';

const getArticle = cache(async (id: string): Promise<NewsArticle | null> => {
    return prisma.newsArticle.findUnique({
        where: { id },
    });
});

export default async function EditArticlePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const article = await getArticle(id);

    if (!article) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit News Article</h1>
            <ArticleForm article={article} />
        </div>
    );
}
