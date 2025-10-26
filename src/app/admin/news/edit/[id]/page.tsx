
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArticleForm } from '../../_components/article-form';
import type { NewsArticle, Image } from '@prisma/client';
import { cache } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const getArticle = cache(async (id: string): Promise<NewsArticle | null> => {
    return prisma.newsArticle.findUnique({
        where: { id },
    });
});

const getImages = cache(async (): Promise<Image[]> => {
    return prisma.image.findMany({ orderBy: { createdAt: 'desc' }});
})

export default async function EditArticlePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const [article, images] = await Promise.all([
        getArticle(id),
        getImages()
    ]);

    if (!article) {
        notFound();
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Edit News Article</h1>
                <Button asChild variant="ghost">
                    <Link href="/admin/news"><ArrowLeft className="mr-2 h-4 w-4" />Back to Articles</Link>
                </Button>
            </div>
            <ArticleForm article={article} images={images} />
        </div>
    );
}
