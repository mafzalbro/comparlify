
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Search, ListFilter, User as UserIcon } from 'lucide-react';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import type { User, Post, PostCategory } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ManagedImage } from '@/components/managed-image';
import { cache } from 'react';
import type { SearchParams } from '@/types/next';
import { Breadcrumbs } from '@/components/breadcrumb';
import { FilterControls } from './_components/filter-controls';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Creator Insights Blog',
  description: 'Actionable advice, deep dives, and growth strategies for the modern course creator.',
  path: '/blog'
});

type PostWithAuthorAndCategory = Post & { author: User, category: PostCategory | null };

const getBlogPosts = cache(async ({
  search,
  sort,
  author,
  category,
}: {
  search?: string;
  sort?: string;
  author?: string;
  category?: string;
}) => {
  let where: any = { published: true };
  let orderBy: any = { createdAt: 'desc' };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (author && author !== 'all') {
    where.authorId = author;
  }
  
  if (category && category !== 'all') {
    where.categoryId = category;
  }

  if (sort === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (sort === 'alpha') {
    orderBy = { title: 'asc' };
  } else {
    orderBy = { createdAt: 'desc' };
  }

  const posts: PostWithAuthorAndCategory[] = await prisma.post.findMany({
    where,
    include: { author: true, category: true },
    orderBy,
  });
  return posts;
});

const getAuthors = cache(async () => {
  return prisma.user.findMany({ where: { posts: { some: { published: true } } } });
});

const getPostCategories = cache(async () => {
  return prisma.postCategory.findMany({ orderBy: { name: 'asc' } });
});


export default async function BlogPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = (await props.searchParams);
  const { search, sort, author, category } = searchParams;
  const [blogPosts, authors, categories] = await Promise.all([
    getBlogPosts({ search: String(search ?? ''), sort: String(sort ?? 'newest'), author: String(author ?? 'all'), category: String(category ?? 'all') }),
    getAuthors(),
    getPostCategories()
  ]);

  return (
    <div className="bg-background">
      <section className="bg-secondary/30 border-b">
        <div className="container py-16 md:py-24 px-4 md:px-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Blog' },
            ]}
            className="mb-8"
          />
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
              Creator Insights
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Actionable advice, deep dives, and growth strategies for the modern course creator.
            </p>
          </div>
        </div>
      </section>
      <div className="container py-16 md:py-24 px-4 md:px-6">
        <FilterControls authors={authors} categories={categories} searchParams={searchParams} />

        {blogPosts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground animate-fade-in-up">
            <h3 className="text-2xl font-headline mb-2">No Posts Found</h3>
            <p>Try adjusting your search or filters. Or check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {blogPosts.map((post, index) => {
              const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
              return (
                <div key={post.slug} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                <Card className="flex flex-col h-full group overflow-hidden transition-all duration-300 border hover:border-primary/50 hover:shadow-lg rounded-xl">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <ManagedImage
                        src={post.image}
                        alt={post.title}
                        data-ai-hint={post.dataAiHint ?? ''}
                        fill
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    {post.category && (
                      <Badge className="absolute top-3 right-3">{post.category.name}</Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors stretched-link">
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm line-clamp-3">{post.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-6">
                    <div className="text-sm text-muted-foreground">
                      <span>{post.author.name}</span> &bull; <span>{readTime} min read</span>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="group-hover:text-primary -mr-3">
                      <Link href={`/blog/${post.slug}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                </div>
              )
            }
            )}
          </div>
        )}
      </div>
    </div>
  );
}
