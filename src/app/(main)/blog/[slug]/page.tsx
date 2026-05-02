import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Bookmark,
  Clock,
  BookOpen,
  Zap,
  ListFilter,
  Scale,
} from "lucide-react";
import { ShareButton } from "@/components/share-button";
import prisma from "@/lib/prisma";
import { MarkdownContent } from "@/components/markdown-content";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { CommentsSection } from "@/components/comments-section";
import { TableOfContents } from "@/components/table-of-contents";
import { ManagedImage } from "@/components/managed-image";
import { BlogQuickLook } from "../_components/blog-quick-look";
import { BlogIntelligentLayout } from "../_components/blog-intelligent-layout";
import { BlogActionableSteps } from "../_components/blog-actionable-steps";
import { BlogFactsSidebar } from "../_components/blog-facts-sidebar";
import { BlogAuthorSection } from "../_components/blog-author-section";
import { cache } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookmarkButton } from "@/components/bookmark-button";
import type { SearchParams } from "@/types/next";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/breadcrumb";
import { getContent } from "@/lib/content";
import { AdPlacement } from "@/components/ad-placement";
import { MotionDiv } from "@/components/motion-wrapper";

export const generateStaticParams = cache(async () => {
  const posts = await prisma.post.findMany({ where: { published: true } });
  return posts.map((post) => ({
    slug: post.slug,
  }));
});

const getPostData = cache(async (slug: string, isPreview = false) => {
  const session = await auth();
  const canViewDraft = isPreview && session?.user?.role === "ADMIN";

  const whereClause = canViewDraft ? { slug } : { slug, published: true };

  const post = await prisma.post.findUnique({
    where: whereClause,
    include: {
      author: true,
      category: true,
      platforms: true,
      facts: true,
      faqs: true,
      comments: {
        where: { status: "APPROVED" },
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    return { post: null, relatedPosts: [], nextPost: null, prevPost: null };
  }

  const [relatedPosts, nextPost, prevPost, trendingComparisons] =
    await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          id: { not: post.id },
          authorId: post.authorId,
        },
        take: 3,
        select: {
          slug: true,
          title: true,
          image: true,
          dataAiHint: true,
          description: true,
        },
      }),
      post.nextId
        ? prisma.post.findFirst({
            where: { id: post.nextId, published: true },
            select: { slug: true, title: true },
          })
        : Promise.resolve(null),
      post.previousId
        ? prisma.post.findFirst({
            where: { id: post.previousId, published: true },
            select: { slug: true, title: true },
          })
        : Promise.resolve(null),
      prisma.comparison.findMany({
        where: { published: true },
        take: 2,
        orderBy: { createdAt: "desc" },
        include: { platformA: true, platformB: true },
      }),
    ]);

  return { post, relatedPosts, nextPost, prevPost, trendingComparisons };
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const { post } = await getPostData(slug);

  if (!post) {
    return {};
  }

  return generateSeoMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.description,
    image: post.image.replace("400/250", "800/400"),
    path: `/blog/${post.slug}`,
  });
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { slug } = params;
  const isPreview = searchParams?.preview === "true";

  const [session, content] = await Promise.all([auth(), getContent()]);
  const { post, relatedPosts, nextPost, prevPost, trendingComparisons } =
    await getPostData(slug, isPreview);

  if (!post) {
    notFound();
  }

  if (!post.published && session?.user?.role !== "ADMIN") {
    redirect("/blog");
  }

  const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
  const siteName = content["global.siteName"] || "Comparlify";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image.replace("400/250", "1200/675"),
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: "https://www.comparlify.com/logo.png",
      },
    },
  };

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {!post.published && (
        <Alert
          variant="default"
          className="sticky top-0 z-50 rounded-none border-b-2 border-l-0 border-r-0 border-t-0 border-yellow-500 bg-yellow-50 text-yellow-900"
        >
          <div className="container flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <div>
                <AlertTitle className="font-bold text-sm">
                  {content["blog.post.preview.title"]}
                </AlertTitle>
                <AlertDescription className="text-xs">
                  {content["blog.post.preview.subtitle"]}
                </AlertDescription>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-yellow-300 hover:bg-yellow-100 h-8"
            >
              <Link href="/admin/blog">
                {content["blog.post.preview.exitButton"]}
              </Link>
            </Button>
          </div>
        </Alert>
      )}

      <article className="pb-16">
        {/* Premium Header - Majestic Scale */}
        <header className="relative pt-16 pb-12 overflow-hidden border-b border-border/10">
          <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/15 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto relative z-10 px-4 md:px-6">
            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                <Breadcrumbs
                  items={[
                    { name: "Home", href: "/" },
                    { name: "Insights", href: "/blog" },
                    { name: post.title },
                  ]}
                  className="mb-10 justify-center"
                />

                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm">
                  <BookOpen className="h-4 w-4" />
                  {post.category?.name || "Uncategorized Intelligence"}
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-8 leading-[1.1] uppercase max-w-4xl">
                  {post.title}
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 max-w-3xl font-medium">
                  {post.description}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-8 p-6 rounded-4xl bg-card/60 backdrop-blur-3xl border border-border/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-linear-to-r from-transparent via-primary/30 to-transparent"></div>
                  <div className="flex items-center gap-5">
                    <Avatar className="h-14 w-14 ring-4 ring-primary/10 border-2 border-background shadow-2xl transition-transform group-hover:scale-110 duration-500">
                      <AvatarImage
                        src={
                          post.author.image ??
                          `https://picsum.photos/200/200?random=${post.slug}`
                        }
                        alt={post.author.name ?? "Author"}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-black text-xl">
                        {post.author.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-black text-foreground text-xl tracking-tight">
                        {post.author.name}
                      </p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1">
                        Intelligence Specialist
                      </p>
                    </div>
                  </div>

                  <div className="h-12 w-px bg-border/20 hidden sm:block"></div>

                  <div className="flex items-center gap-10 text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{readTime}M EXTRACT</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </header>

        {/* Featured Image - Immersive Scale */}
        <section className="container mx-auto px-4 md:px-6 -mt-8 mb-16">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            <div className="relative aspect-[3/1] rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] group border-8 border-background ring-1 ring-border/10">
              <ManagedImage
                src={post.image.replace("400/250", "1920/1080")}
                alt={post.title}
                data-ai-hint={post.dataAiHint}
                fill
                className="object-cover transition-transform duration-2000 group-hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </MotionDiv>
        </section>

        {/* Main Content Layout */}
        <section className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Sidebar Actions - Desktop Only */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-40 flex flex-col items-center space-y-12">
                {session?.user && (
                  <div className="flex flex-col items-center gap-4 group">
                    <BookmarkButton
                      postId={post.id}
                      className="h-16 w-16 rounded-4xl shadow-xl hover:shadow-primary/20 transition-all hover:-translate-y-2"
                      size="icon"
                      showText={false}
                    />
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] group-hover:text-primary transition-colors">
                      Extract
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-center gap-4 group">
                  <ShareButton className="h-16 w-16 rounded-4xl shadow-xl hover:shadow-primary/20 transition-all hover:-translate-y-2" />
                  <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] group-hover:text-primary transition-colors">
                    Signal
                  </span>
                </div>
              </div>
            </aside>

            {/* Main Article Content */}
            <main className="lg:col-span-7">
              <AdPlacement placement="POST_TOP" className="mb-16" />

              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {post.keyTakeaways && (
                  <BlogQuickLook
                    keyTakeaways={post.keyTakeaways as string[]}
                  />
                )}

                <BlogIntelligentLayout content={post.content} />

                {post.checklist && (
                  <BlogActionableSteps
                    steps={post.checklist as any[]}
                  />
                )}

                <BlogAuthorSection
                  name={post.author.name ?? "Anonymous"}
                  image={post.author.image}
                  role={post.authorRole}
                  bio={post.authorBio}
                  credentials={post.authorCredentials}
                />
              </MotionDiv>

              <AdPlacement placement="POST_BOTTOM" className="mt-24" />

              {/* Mobile Action Bar - Positioned at bottom of content for visibility */}
              <div className="lg:hidden mt-16 p-8 rounded-[3rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-2xl flex items-center justify-around">
                <div className="flex flex-col items-center gap-3">
                  <ShareButton className="h-14 w-14 rounded-2xl" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Share Signal
                  </span>
                </div>
                {session?.user && (
                  <div className="flex flex-col items-center gap-3">
                    <BookmarkButton
                      postId={post.id}
                      size="icon"
                      className="h-14 w-14 rounded-2xl"
                      showText={false}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Save Dispatch
                    </span>
                  </div>
                )}
              </div>

              {/* Post Navigation */}
              <nav className="grid grid-cols-1 sm:grid-cols-2 w-full gap-8 mt-24 p-6 bg-card/20 backdrop-blur-md rounded-[2.5rem] border border-border/10">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="group p-8 rounded-4xl hover:bg-primary/10 transition-all text-left border border-transparent hover:border-primary/20 bg-background/40 backdrop-blur-xl shadow-lg"
                  >
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                      <ArrowLeft className="h-4 w-4" /> Previous Dispatch
                    </p>
                    <h4 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {prevPost.title}
                    </h4>
                  </Link>
                ) : (
                  <div />
                )}

                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group p-8 rounded-4xl hover:bg-primary/10 transition-all text-right border border-transparent hover:border-primary/20 bg-background/40 backdrop-blur-xl shadow-lg"
                  >
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center justify-end gap-3">
                      Next Dispatch <ArrowRight className="h-4 w-4" />
                    </p>
                    <h4 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {nextPost.title}
                    </h4>
                  </Link>
                ) : (
                  <div />
                )}
              </nav>

              <div className="mt-32">
                <div className="mb-12 flex items-center gap-4">
                  <div className="h-px bg-border/20 flex-1"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground">
                    Intelligence Exchange
                  </h3>
                  <div className="h-px bg-border/20 flex-1"></div>
                </div>
                <CommentsSection
                  postId={post.id}
                  comments={post.comments}
                  session={session}
                />
              </div>
            </main>

            {/* Right Sidebar - TOC & Related */}
            <aside className="lg:col-span-4 space-y-16">
              <div className="sticky top-20 space-y-16">
                <section className="bg-card/40 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
                    <ListFilter className="h-32 w-32" />
                  </div>
                  <TableOfContents content={post.content} />
                </section>

                <BlogFactsSidebar facts={post.facts} />

                {post.platforms.length > 0 && (
                  <section className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-4xl shadow-xl relative overflow-hidden group">
                    <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 px-4 py-1.5 uppercase tracking-widest text-[8px] font-black rounded-full mb-8 relative z-10">
                      Recommended
                    </Badge>
                    <h3 className="text-2xl font-black text-foreground mb-10 relative z-10">
                      Intelligence <br />
                      <span className="text-blue-500 italic font-black">
                        Tools
                      </span>
                    </h3>
                    <div className="space-y-4 relative z-10">
                      {post.platforms.map((platform) => (
                        <Link
                          key={platform.id}
                          href={`/platform/${platform.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-background/60 hover:bg-background transition-all group/item border border-border/5"
                        >
                          <div className="w-10 h-10 rounded-xl border border-border/10 overflow-hidden relative shadow-sm">
                            <ManagedImage
                              fill
                              src={platform.logoUrl}
                              alt={platform.name}
                              className="object-cover p-2"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight truncate group-hover/item:text-blue-500 transition-colors">
                              {platform.name}
                            </h4>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/item:text-blue-500 transition-transform group-hover/item:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {trendingComparisons.length > 0 && (
                  <section className="bg-primary/5 border border-primary/20 p-8 rounded-4xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-4 -translate-y-4">
                      <Scale className="h-24 w-24" />
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 uppercase tracking-widest text-[8px] font-black rounded-full mb-8 relative z-10 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                      Trending
                    </Badge>
                    <h3 className="text-2xl font-black text-foreground mb-10 relative z-10">
                      Platform <br />
                      <span className="text-primary italic font-black">
                        Comparisons
                      </span>
                    </h3>
                    <div className="space-y-6 relative z-10">
                      {trendingComparisons.map((comp) => (
                        <Link
                          key={comp.id}
                          href={`/compare/${comp.slug}`}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-background/60 hover:bg-background transition-all group/item border border-border/5"
                        >
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden relative shadow-lg">
                              <ManagedImage
                                fill
                                src={comp.platformA.logoUrl}
                                alt={comp.platformA.name}
                                className="object-cover"
                              />
                            </div>
                            <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden relative shadow-lg">
                              <ManagedImage
                                fill
                                src={comp.platformB.logoUrl}
                                alt={comp.platformB.name}
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-foreground uppercase tracking-tight truncate group-hover/item:text-primary transition-colors">
                              {comp.title}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                <AdPlacement placement="SIDEBAR" />

                {relatedPosts.length > 0 && (
                  <section className="bg-card/60 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 text-primary/5 select-none pointer-events-none">
                      <Zap className="h-48 w-48" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-12 relative z-10 leading-none">
                      Neural <br />
                      <span className="text-primary italic">Connections</span>
                    </h3>
                    <div className="space-y-12 relative z-10">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/blog/${related.slug}`}
                          className="flex flex-col gap-6 group/item"
                        >
                          <div className="relative aspect-16/10 rounded-4xl overflow-hidden shadow-2xl border border-white/5">
                            <ManagedImage
                              src={related.image.replace("400/250", "600/400")}
                              alt={related.title}
                              data-ai-hint={related.dataAiHint ?? ""}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover/item:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-all duration-700 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white scale-50 group-hover/item:scale-100 transition-transform">
                                <ArrowRight className="h-6 w-6" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-black text-foreground group-hover/item:text-primary transition-colors leading-[1.2] text-xl tracking-tight">
                              {related.title}
                            </h4>
                            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed font-medium">
                              {related.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full mt-16 rounded-4xl font-black uppercase tracking-[0.3em] text-[10px] py-8 hover:bg-primary/10 group/all transition-all border border-primary/10"
                    >
                      <Link href="/blog">
                        Total Archive{" "}
                        <ArrowRight className="ml-4 h-5 w-5 transition-transform group-hover/all:translate-x-3" />
                      </Link>
                    </Button>
                  </section>
                )}
              </div>
            </aside>
          </div>
        </section>
      </article>

      {/* Search Overlay/Floating FAB could go here if needed */}
    </div>
  );
}
