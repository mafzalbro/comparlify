
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye, Bookmark } from 'lucide-react';
import prisma from '@/lib/prisma';
import { MarkdownContent } from '@/components/markdown-content';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { auth } from '@/lib/auth';
import { CommentsSection } from '@/components/comments-section';
import { TableOfContents } from '@/components/table-of-contents';
import { ManagedImage } from '@/components/managed-image';
import { cache } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookmarkButton } from '@/components/bookmark-button';

export const generateStaticParams = cache(async () => {
  const posts = await prisma.post.findMany({ where: { published: true } });
  return posts.map((post) => ({
    slug: post.slug,
  }));
});

const getPostData = cache(async (slug: string, isPreview = false) => {
    const session = await auth();
    const canViewDraft = isPreview && session?.user?.role === 'ADMIN';

    // Only allow viewing published posts, unless it's a valid admin preview
    const whereClause = canViewDraft ? { slug } : { slug, published: true };

    const post = await prisma.post.findUnique({
        where: whereClause,
        include: { 
            author: true,
            comments: {
                where: { status: 'APPROVED' },
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
          authorId: post.authorId,
        },
        take: 3,
        select: { slug: true, title: true, image: true, dataAiHint: true }
      }),
      post.nextId ? prisma.post.findFirst({
        where: { id: post.nextId },
        select: { slug: true, title: true }
      }) : Promise.resolve(null)
    ]);

    return { post, relatedPosts, nextPost };
});

export async function generateMetadata(props: { params: { slug:string }, searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
    const { slug } = props.params;
    const { post } = await getPostData(slug);

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


export default async function BlogPostPage(props: { params: { slug: string }, searchParams: { [key: string]: string | string[] | undefined }}) {
    const { slug } = props.params;
    const isPreview = props.searchParams?.preview === 'true';

    const session = await auth();
    const { post, relatedPosts, nextPost } = await getPostData(slug, isPreview);

    if (!post) {
      notFound();
    }
    
    // If it's a draft, redirect non-admins
    if (!post.published && session?.user?.role !== 'ADMIN') {
        redirect('/blog');
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
        
        {!post.published && (
            <Alert variant="default" className="sticky top-0 z-50 rounded-none border-b-2 border-l-0 border-r-0 border-t-0 border-yellow-500 bg-yellow-50 text-yellow-900">
                <div className="container flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        <div>
                            <AlertTitle className="font-bold">Preview Mode</AlertTitle>
                            <AlertDescription className="text-xs">
                            This is a draft post and is not visible to the public.
                            </AlertDescription>
                        </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="border-yellow-300 hover:bg-yellow-100">
                        <Link href="/admin/blog">Exit Preview</Link>
                    </Button>
                </div>
            </Alert>
        )}


        <article>
          {/* Hero Section */}
          <section className="relative w-full py-16 md:py-24 lg:py-32 flex items-center justify-center text-center text-white overflow-hidden">
            <div className="absolute inset-0">
              <ManagedImage
                src={post.image.replace('400/250', '1920/1080')}
                alt={post.title}
                data-ai-hint={post.dataAiHint}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            </div>
            <div className="relative container max-w-4xl z-10 drop-shadow-lg">
              <p className="text-sm uppercase tracking-widest mb-4">
                {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &middot; {readTime} min read
              </p>
              <h1 className="font-headline text-4xl md:text-6xl font-bold leading-tight">
                {post.title}
              </h1>
              <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{post.description}</p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white/50">
                  <AvatarImage src={post.author.image ?? `https://picsum.photos/100/100?random=${post.slug}`} alt={post.author.name ?? 'Author'} data-ai-hint="person photo" />
                  <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-sm text-white/70">Author</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <div className="container max-w-6xl py-12 md:py-16">
            <div className="flex justify-between items-center mb-6">
              <Button asChild variant="ghost">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
              {session?.user && (
                <BookmarkButton 
                  contentId={post.id} 
                  contentType="POST"
                />
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
              <div className="lg:col-span-3">
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownContent content={post.content} />
                </div>
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
                              <ManagedImage 
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
        </article>
      </>
    );
}
