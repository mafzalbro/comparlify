
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
import { ArrowRight, Search } from 'lucide-react';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import type { User, Post } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ManagedImage } from '@/components/managed-image';
import { cache } from 'react';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Creator Insights Blog',
  description: 'Actionable advice, deep dives, and growth strategies for the modern course creator.',
  path: '/blog'
});

type PostWithAuthor = Post & { author: User };

const getBlogPosts = cache(async ({
  search,
  sort,
  author,
}: {
  search?: string;
  sort?: string;
  author?: string;
}) => {
  let where: any = { published: true };
  let orderBy: any = { createdAt: 'desc' };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { content: { contains: search } },
    ];
  }

  if (author && author !== 'all') {
    where.authorId = author;
  }

  if (sort === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (sort === 'alpha') {
    orderBy = { title: 'asc' };
  }

  const posts: PostWithAuthor[] = await prisma.post.findMany({
    where,
    include: { author: true },
    orderBy,
  });
  return posts;
});

const getAuthors = cache(async () => {
  return prisma.user.findMany({ where: { posts: { some: {} } } });
});


export default async function BlogPage({ searchParams }: { searchParams: Promise<{ search?: string; sort?: string; author?: string }> }) {
  const { search, sort, author } = await searchParams;
  const [blogPosts, authors] = await Promise.all([
    getBlogPosts({ search, sort, author }),
    getAuthors()
  ]);

  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
          Creator Insights
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Actionable advice, deep dives, and growth strategies for the modern course creator.
        </p>
      </div>

      <Card className="mb-12 p-4 md:p-6 shadow-lg bg-card/60">
        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="search"
                name="search"
                placeholder="Search by title or keyword..."
                className="pl-10"
                defaultValue={search}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort By</Label>
            <Select name="sort" defaultValue={sort ?? 'newest'}>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="alpha">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Select name="author" defaultValue={author ?? 'all'}>
              <SelectTrigger id="author">
                <SelectValue placeholder="All Authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map(author => (
                  <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full">Apply</Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/blog">Reset</Link>
            </Button>
          </div>
        </form>
      </Card>

      {blogPosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <h3 className="text-2xl font-headline mb-2">No Posts Found</h3>
          <p>Try adjusting your search or filters. Or check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => {
            const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
            return (
              <Card key={post.slug} className="flex flex-col overflow-hidden group bg-card/60 backdrop-blur-lg border-border/20 shadow-md hover:shadow-xl transition-shadow duration-300">
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
                </div>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground text-sm line-clamp-3">{post.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-secondary/20 py-3 px-6">
                  <div className="text-sm text-muted-foreground">
                    <span>{post.author.name}</span> &bull; <span>{readTime} min read</span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="group-hover:text-primary">
                    <Link href={`/blog/${post.slug}`}>
                      Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          }
          )}
        </div>
      )}
    </div>
  );
}
