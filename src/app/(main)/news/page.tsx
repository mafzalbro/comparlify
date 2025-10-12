
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ManagedImage } from '@/components/managed-image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumb';
import { format } from 'date-fns';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Tech World News',
  description: 'The latest news, trends, and updates from across the tech world relevant to creators.',
  path: '/news',
});

async function getNewsArticles() {
  return prisma.newsArticle.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });
}

export default async function NewsPage() {
  const articles = await getNewsArticles();

  return (
    <div className="bg-background">
      <section className="bg-secondary/30 border-b">
        <div className="container py-12 md:py-16 px-4 md:px-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'News' },
            ]}
            className="mb-8"
          />
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
              Tech World News
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              The latest trends, updates, and stories from the world of technology and online creation.
            </p>
          </div>
        </div>
      </section>
      <div className="container py-8 md:py-12 px-4 md:px-6">
        {articles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-2xl font-headline mb-2">No News Yet</h3>
            <p>Check back soon for the latest updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <div key={article.slug} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <Card className="flex flex-col h-full group overflow-hidden transition-all duration-300 border hover:border-primary/50 hover:shadow-lg rounded-xl">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <Link href={`/news/${article.slug}`} className="block">
                      <ManagedImage
                        src={article.image}
                        alt={article.title}
                        data-ai-hint={article.dataAiHint ?? ''}
                        fill
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      <Link href={`/news/${article.slug}`} className="hover:text-primary transition-colors stretched-link">
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm">
                      Published on {format(new Date(article.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end items-center bg-muted/50 py-3 px-6">
                    <Button asChild variant="ghost" size="sm" className="group-hover:text-primary -mr-3">
                      <Link href={`/news/${article.slug}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
