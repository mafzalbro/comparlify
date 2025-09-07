import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { MarkdownContent } from '@/components/markdown-content';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { auth } from '@/lib/auth';
import { CommentsSection } from '@/components/comments-section';
import { TableOfContents } from '@/components/table-of-contents';

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ where: { published: true } });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

async function getPostData(slug: string) {
    const post = await prisma.post.findUnique({
        where: { slug, published: true },
        include: { 
            author: true,
            comments: {
                include: { author: true },
                orderBy: { createdAt: 'desc' }
            },
            previous: {
                select: { slug: true, title: true }
            }
        },
    });

    if (!post) {
      return { post: null, relatedPosts: [], nextPost: null };
    }

    const [relatedPosts, nextPost] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          id: { not: post.id },
          // A simple related posts logic, could be improved with tags/categories
          authorId: post.authorId,
        },
        take: 3,
        select: { slug: true, title: true, image: true, dataAiHint: true }
      }),
      prisma.post.findFirst({
        where: { id: post.nextId },
        select: { slug: true, title: true }
      })
    ]);

    return { post, relatedPosts, nextPost };
}

export async function generateMetadata({ params }: { params: { slug:string } }): Promise<Metadata> {
  const { post } = await getPostData(params.slug);

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
  const session = await auth();
  const { post, relatedPosts, nextPost } = await getPostData(params.slug);

  if (!post) {
    notFound();
  }

  const readTime = Math.ceil(post.content.split(/\s+/).length / 200);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image.replace('400/250', '1200/675'),
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Comparlify',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.comparlify.com/logo.png', // Replace with actual logo URL
      },
    },
  };

  return (
    <>
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="container max-w-6xl py-12 md:py-16">
        <div className="text-sm mb-6">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
            <div className="lg:col-span-3">
                <article>
                    <div className="space-y-4 mb-8">
                        <p className="text-muted-foreground text-sm">{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &middot; {readTime} min read</p>
                        <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground leading-tight">
                            {post.title}
                        </h1>
                        <p className="text-xl text-muted-foreground">{post.description}</p>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                    <Avatar>
                        <AvatarImage src={post.author.image ?? `https://picsum.photos/100/100?random=${post.slug}`} alt={post.author.name ?? 'Author'} data-ai-hint="person photo" />
                        <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-foreground">{post.author.name}</p>
                        <p className="text-sm text-muted-foreground">Author</p>
                    </div>
                    </div>
                    
                    <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={post.image.replace('400/250', '1200/675')}
                            alt={post.title}
                            data-ai-hint={post.dataAiHint}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <MarkdownContent content={post.content} />
                </article>

                <nav className="flex justify-between items-center my-12 border-t border-b py-6">
                    <div>
                        {post.previous && (
                            <Button asChild variant="outline">
                                <Link href={`/blog/${post.previous.slug}`}>
                                     <ArrowLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Link>
                            </Button>
                        )}
                    </div>
                     <div>
                        {nextPost && (
                            <Button asChild variant="outline">
                                <Link href={`/blog/${nextPost.slug}`}>
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </nav>

                <CommentsSection 
                    postId={post.id} 
                    comments={post.comments} 
                    session={session} 
                />
            </div>
            <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                    <TableOfContents content={post.content} />
                    {relatedPosts.length > 0 && (
                        <div>
                             <h3 className="font-headline text-xl font-semibold mb-4">Related Posts</h3>
                             <div className="space-y-4">
                                {relatedPosts.map(related => (
                                    <Link key={related.slug} href={`/blog/${related.slug}`} className="flex items-center gap-4 group">
                                         <div className="relative w-20 h-16 rounded-md overflow-hidden shrink-0">
                                            <Image 
                                                src={related.image.replace('400/250', '200/150')} 
                                                alt={related.title}
                                                data-ai-hint={related.dataAiHint ?? ''}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h4 className="text-sm font-medium group-hover:text-primary transition-colors">{related.title}</h4>
                                    </Link>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    </div>
    </>
  );
}