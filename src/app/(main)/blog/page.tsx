import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Clock,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import type { User, Post, PostCategory } from "@prisma/client";
import { ManagedImage } from "@/components/managed-image";
import { cache } from "react";
import type { SearchParams } from "@/types/next";
import { Breadcrumbs } from "@/components/breadcrumb";
import { FilterControls } from "./_components/filter-controls";
import { Badge } from "@/components/ui/badge";
import { getContent } from "@/lib/content";
import { MotionDiv } from "@/components/motion-wrapper";
import { PremiumNewsletterForm } from "@/components/premium-newsletter-form";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Creator Insights | The Comparlify Blog",
    description:
      "Actionable advice, deep dives, and growth strategies for the modern course creator. Stay ahead with AI insights.",
    path: "/blog",
  });
}

type PostWithAuthorAndCategory = Post & {
  author: User;
  category: PostCategory | null;
};

const getBlogPosts = cache(
  async ({
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
    let orderBy: any = { createdAt: "desc" };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (author && author !== "all") {
      where.authorId = author;
    }

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "alpha") {
      orderBy = { title: "asc" };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const posts: PostWithAuthorAndCategory[] = await prisma.post.findMany({
      where,
      include: { author: true, category: true },
      orderBy,
    });
    return posts;
  },
);

const getAuthors = cache(async () => {
  return prisma.user.findMany({
    where: { posts: { some: { published: true } } },
  });
});

const getPostCategories = cache(async () => {
  return prisma.postCategory.findMany({ orderBy: { name: "asc" } });
});

export default async function BlogPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { search, sort, author, category } = searchParams;
  const [blogPosts, authors, categories, content] = await Promise.all([
    getBlogPosts({
      search: String(search ?? ""),
      sort: String(sort ?? "newest"),
      author: String(author ?? "all"),
      category: String(category ?? "all"),
    }),
    getAuthors(),
    getPostCategories(),
    getContent(),
  ]);

  if (content["module.blog.enabled"] === "false") {
    notFound();
  }

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="bg-background min-h-screen">
      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative pt-16 pb-12 overflow-hidden border-b border-border/10">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-40"></div>
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
                items={[{ name: "Home", href: "/" }, { name: "Insights" }]}
                className="mb-8 justify-center"
              />
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 mb-8 shadow-sm">
                <div className="animate-ping w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  The Editorial Feed
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none mb-6 uppercase">
                Creator{" "}
                <span className="text-amber-500 italic drop-shadow-sm font-black italic">
                  Insights
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
                {content["blog.hero.subtitle"] ||
                  "Master the art of course creation with curated deep dives and surgical expert perspectives."}
              </p>
            </div>
          </MotionDiv>
        </div>
      </section>
      <div className="container mx-auto py-12 px-4 md:px-6">
        {/* --- DYNAMIC FILTER SECTION --- */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="max-w-6xl mx-auto bg-card/60 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-xl relative overflow-hidden group">
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-linear-to-r from-transparent via-primary/30 to-transparent"></div>
            <FilterControls
              authors={authors}
              categories={categories}
              searchParams={searchParams}
            />
          </div>
        </MotionDiv>

        {blogPosts.length === 0 ? (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-60 rounded-[5rem] border-2 border-dashed border-border/20 bg-secondary/5"
          >
            <BookOpen className="mx-auto h-24 w-24 text-muted-foreground/10 mb-10" />
            <h3 className="text-5xl font-black mb-6 uppercase tracking-tight">
              {content["blog.empty.title"] || "Silence in the Library"}
            </h3>
            <p className="text-2xl text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed">
              {content["blog.empty.subtitle"] ||
                "Our editorial team is currently drafting new masterpieces. Adjust your filters to find existing gems."}
            </p>
          </MotionDiv>
        ) : (
          <div className="space-y-16">
            {/* --- FEATURED ARTICLE HERO --- */}
            {featuredPost && !search && !category && !author && (
              <MotionDiv
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="block"
                >
                  <div className="relative grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-[2.5rem] border border-border/10 glass shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] hover:shadow-primary/10 transition-all duration-1000 h-full lg:min-h-[400px]">
                    <div className="lg:col-span-7 relative h-[300px] lg:h-auto overflow-hidden">
                      <ManagedImage
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        data-ai-hint={featuredPost.dataAiHint ?? ""}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-8 left-8">
                        <Badge className="bg-primary px-6 py-2 text-primary-foreground text-[10px] font-black uppercase tracking-[0.3em] rounded-4xl shadow-xl ring-4 ring-primary/20">
                          Featured Insight
                        </Badge>
                      </div>
                    </div>
                    <div className="lg:col-span-5 p-10 md:p-14 flex flex-col justify-center bg-card/10 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
                        <Sparkles className="h-48 w-48" />
                      </div>
                      <div className="flex items-center gap-6 text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-8 relative z-10">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />{" "}
                          {Math.ceil(
                            featuredPost.content.split(/\s+/).length / 200,
                          )}
                          M Read
                        </span>
                        <span className="w-8 h-px bg-border/20"></span>
                        <span className="text-primary">
                          {featuredPost.author.name}
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-[1.1] tracking-tight group-hover:text-primary transition-colors duration-700 relative z-10">
                        {featuredPost.title}
                      </h2>
                      <p className="text-lg text-muted-foreground mb-10 line-clamp-4 leading-relaxed font-medium relative z-10">
                        {featuredPost.description}
                      </p>
                      <div className="flex items-center text-primary font-black uppercase tracking-[0.3em] text-[10px] group-hover:translate-x-6 transition-transform duration-700 relative z-10">
                        Start Reading <ArrowRight className="ml-5 h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </Link>
              </MotionDiv>
            )}

            {/* --- ARTICLE GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              {(featuredPost && !search && !category && !author
                ? otherPosts
                : blogPosts
              ).map((post, index) => (
                <MotionDiv
                  key={post.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="flex flex-col h-full group overflow-hidden rounded-[2.5rem] border border-border/10 bg-card/40 backdrop-blur-2xl shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-3">
                    <div className="relative overflow-hidden aspect-16/11">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block h-full"
                      >
                        <ManagedImage
                          src={post.image}
                          alt={post.title}
                          data-ai-hint={post.dataAiHint ?? ""}
                          fill
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center p-8">
                          <div className="flex flex-col items-center gap-4 translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                              <ArrowRight className="h-8 w-8" />
                            </div>
                            <span className="text-white font-black uppercase tracking-widest text-[10px]">
                              The Full Dispatch
                            </span>
                          </div>
                        </div>
                      </Link>
                      {post.category && (
                        <div className="absolute top-8 left-8">
                          <Badge className="bg-background/80 text-foreground backdrop-blur-3xl border border-white/10 px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                            {post.category.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-6">
                        <span className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary" />{" "}
                          {Math.ceil(post.content.split(/\s+/).length / 200)}M
                        </span>
                        <span className="w-4 h-px bg-border/20"></span>
                        <span className="text-primary font-black uppercase tracking-widest">
                          {post.author.name}
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-black leading-tight group-hover:text-primary transition-colors duration-500 mb-4 line-clamp-2 tracking-tight">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="after:absolute after:inset-0"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 flex-1 overflow-hidden">
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-6 font-medium">
                        {post.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                      <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.3em] text-[10px] group/btn transition-all duration-500 group-hover:translate-x-4">
                        The Full Breakdown <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardFooter>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* --- PREMIUM NEWSLETTER BLOCK --- */}
      <section className="relative overflow-hidden bg-background py-32 mt-24">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent"></div>
        <MotionDiv
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group h-full"
        >
          <div className="absolute inset-0 bg-amber-500/2 pointer-events-none"></div>
          <div className="relative p-12 md:p-24 overflow-hidden text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-12 text-amber-500/3 select-none pointer-events-none -rotate-12">
              <BookOpen className="h-[500px] w-[500px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-6 py-2.5 uppercase tracking-[0.4em] text-[10px] font-black rounded-full mb-8 shadow-sm">
                Insider Access
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 leading-[1.1] uppercase">
                Join the <br />
                <span className="text-amber-500 italic drop-shadow-sm font-black italic">
                  Creator Hub
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
                The most critical creation strategies and tech breakthroughs,
                delivered with surgical precision every Monday.
              </p>

              <PremiumNewsletterForm
                buttonText="Secure Access"
                accentColor="blue-500"
                containerClassName="bg-card/40 border-white/10 p-4 rounded-[2.5rem] shadow-2xl max-w-2xl"
              />
              <p className="mt-12 text-[10px] text-muted-foreground/60 uppercase tracking-[0.4em] font-black text-center">
                Vetted Intelligence. Zero Fluff. Complete Data Security.
              </p>
            </div>
          </div>
        </MotionDiv>
      </section>
    </div>
  );
}
