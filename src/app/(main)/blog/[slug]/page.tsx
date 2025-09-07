import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import prisma from '@/lib/prisma';
import { MarkdownContent } from '@/components/markdown-content';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ where: { published: true } });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

async function getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
        where: { slug, published: true },
        include: { author: true },
    });
    return post;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {};
  }

  return generateSeoMetadata({
    title: post.title,
    description: post.description,
    image: post.image.replace('400/250', '800/400'),
    path: `/blog/${post.slug}`,
  });
}


export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const readTime = Math.ceil(post.content.split(/\s+/).length / 200);

  return (
    <div className="container max-w-3xl py-16 md:py-24">
       <div className="mb-8">
        <Button asChild variant="ghost">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
      <article>
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-sm mb-2">{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            {post.title}
          </h1>
        </div>

        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.image.replace('400/250', '800/400')}
            alt={post.title}
            data-ai-hint={post.dataAiHint}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <Avatar>
              <AvatarImage src={post.author.image ?? `https://picsum.photos/100/100?random=${post.slug}`} alt={post.author.name ?? 'Author'} data-ai-hint="person photo" />
              <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
              <p className="font-semibold text-foreground">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">{readTime} min read</p>
          </div>
        </div>

        <MarkdownContent content={post.content} />
      </article>
    </div>
  );
}
