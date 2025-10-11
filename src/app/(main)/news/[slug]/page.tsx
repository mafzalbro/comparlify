
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { ArrowLeft } from 'lucide-react';
import { MarkdownContent } from '@/components/markdown-content';
import { ManagedImage } from '@/components/managed-image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cache } from 'react';
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getContent } from '@/lib/content';

const getArticleBySlug = cache(async (slug: string) => {
  return prisma.newsArticle.findUnique({
    where: { slug, published: true },
    include: { author: true },
  });
});

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return generateSeoMetadata({
    title: article.title,
    description: article.content.substring(0, 160),
    image: article.image.replace('400/250', '800/400'),
    path: `/news/${article.slug}`,
  });
}

export const generateStaticParams = cache(async () => {
  const articles = await prisma.newsArticle.findMany({ where: { published: true } });
  return articles.map((article) => ({
    slug: article.slug,
  }));
});

export default async function NewsArticlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;
  const [article, content] = await Promise.all([
    getArticleBySlug(slug),
    getContent()
  ]);

  if (!article) {
    notFound();
  }

  const siteName = content['global.siteName'] || 'Comparlify';

  return (
    <article>
      <section className="relative w-full py-16 md:py-24 lg:py-32 flex items-center justify-center text-center text-white overflow-hidden h-[60vh]">
        <div className="absolute inset-0">
          <ManagedImage
            src={article.image.replace('400/250', '1920/1080')}
            alt={article.title}
            data-ai-hint={article.dataAiHint ?? ''}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
        <div className="relative container max-w-4xl z-10 drop-shadow-lg">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'News', href: '/news' },
              { name: article.title },
            ]}
            className="justify-center text-white/80 mb-6"
          />
          <h1 className="font-headline text-4xl md:text-6xl font-bold leading-tight mt-4">
            {article.title}
          </h1>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-white/50">
              <AvatarImage src={article.author.image ?? `https://picsum.photos/100/100?random=${article.slug}`} alt={article.author.name ?? 'Author'} data-ai-hint="person photo" />
              <AvatarFallback>{article.author.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{article.author.name}</p>
              <p className="text-sm text-white/70">Published on {format(new Date(article.createdAt), 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-4xl py-12 md:py-16">
        <div className="mb-6">
            <Button asChild variant="ghost">
                <Link href="/news">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to News
                </Link>
            </Button>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownContent content={article.content} />
        </div>
      </div>
    </article>
  );
}
