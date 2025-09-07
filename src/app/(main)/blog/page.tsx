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
import { ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSeoMetadata({
    title: 'Creator Insights Blog',
    description: 'Actionable advice, deep dives, and growth strategies for the modern course creator.',
    path: '/blog'
});

async function getBlogPosts() {
    const posts = await prisma.post.findMany({
        where: { published: true },
        include: { author: true },
        orderBy: { createdAt: 'desc' },
    });
    return posts;
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <div className="text-center mb-16">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
          Creator Insights
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Actionable advice, deep dives, and growth strategies for the modern course creator.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => {
           const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
           return (
            <Card key={post.slug} className="flex flex-col overflow-hidden group">
                <div className="relative overflow-hidden aspect-[16/10]">
                    <Link href={`/blog/${post.slug}`} className="block">
                        <Image
                            src={post.image}
                            alt={post.title}
                            data-ai-hint={post.dataAiHint}
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
                <CardFooter className="flex justify-between items-center">
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
           )}
        )}
      </div>
    </div>
  );
}
