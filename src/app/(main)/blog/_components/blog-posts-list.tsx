import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Clock, Sparkles } from "lucide-react";
import prisma from "@/lib/prisma";
import type { User, Post, PostCategory } from "@prisma/client";
import { ManagedImage } from "@/components/managed-image";
import { Badge } from "@/components/ui/badge";
import { MotionDiv } from "@/components/motion-wrapper";
import { InfiniteScrollGrid } from "@/components/infinite-scroll-grid";
import type { SearchParams } from "@/types/next";

type PostWithAuthorAndCategory = Post & {
  author: User;
  category: PostCategory | null;
};

interface BlogPostsListProps {
  searchParams: SearchParams;
  content: Record<string, string>;
}

const blogPostsCache = new Map<string, { data: PostWithAuthorAndCategory[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

async function getBlogPosts({
  search,
  sort,
  author,
  category,
}: {
  search?: string;
  sort?: string;
  author?: string;
  category?: string;
}) {
  const cacheKey = JSON.stringify({ search, sort, author, category });
  const cached = blogPostsCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let where: any = { published: true };
  let orderBy: any = { createdAt: "desc" };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
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

  blogPostsCache.set(cacheKey, { data: posts, timestamp: now });
  return posts;
}

export async function BlogPostsList({ searchParams, content }: BlogPostsListProps) {
  const { search, sort, author, category } = searchParams;
  const blogPosts = await getBlogPosts({
    search: String(search ?? ""),
    sort: String(sort ?? "newest"),
    author: String(author ?? "all"),
    category: String(category ?? "all"),
  });

  if (blogPosts.length === 0) {
    return (
      <MotionDiv
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-24 rounded-3xl border border-dashed border-border/40 bg-card/10 flex flex-col items-center justify-center"
      >
        <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h3 className="text-2xl font-bold mb-2 text-foreground tracking-tight">
          {content["blog.empty.title"] || "No dispatches found"}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed text-sm">
          {content["blog.empty.subtitle"] ||
            "Adjust your filters or query to find existing guides."}
        </p>
      </MotionDiv>
    );
  }

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);
  const showFeatured = featuredPost && !search && !category && !author;

  return (
    <div className="space-y-12">
      {/* --- FEATURED ARTICLE HERO --- */}
      {showFeatured && (
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href={`/blog/${featuredPost.slug}`} className="block group">
            <div className="relative grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl border border-border/40 bg-card/20 shadow-md hover:shadow-lg hover:border-primary/20 transition-all duration-500 h-full lg:min-h-[380px]">
              <div className="lg:col-span-7 relative h-[240px] lg:h-auto overflow-hidden">
                <ManagedImage
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  data-ai-hint={featuredPost.dataAiHint ?? ""}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-103"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6">
                  <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    Featured Insight
                  </Badge>
                </div>
              </div>
              <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-center bg-card/30 backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />{" "}
                    {Math.ceil(featuredPost.content.split(/\s+/).length / 200)}m read
                  </span>
                  <span className="w-4 h-px bg-border/40"></span>
                  <span className="text-primary">{featuredPost.author.name}</span>
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors duration-300">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed font-medium">
                  {featuredPost.description}
                </p>
                <div className="flex items-center gap-2 text-primary font-bold text-xs group-hover:gap-4 transition-all duration-300">
                  Read Article <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </MotionDiv>
      )}

      {/* --- GRID LIST --- */}
      <InfiniteScrollGrid
        batchSize={6}
        gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {(showFeatured ? otherPosts : blogPosts).map((post, index) => (
          <MotionDiv
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (index % 3) * 0.05 }}
          >
            <Card className="flex flex-col h-full group overflow-hidden rounded-2xl border border-border/40 bg-card/20 hover:bg-card/30 backdrop-blur-md shadow-sm transition-all duration-500 hover:shadow-md hover:border-primary/20">
              <div className="relative overflow-hidden aspect-16/11 bg-muted/10">
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <ManagedImage
                    src={post.image}
                    alt={post.title}
                    data-ai-hint={post.dataAiHint ?? ""}
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                      <span className="text-white font-bold text-[10px] uppercase tracking-wider">
                        Read Guide
                      </span>
                    </div>
                  </div>
                </Link>
                {post.category && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-background/90 text-foreground border border-border/30 px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      {post.category.name}
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />{" "}
                    {Math.ceil(post.content.split(/\s+/).length / 200)}m
                  </span>
                  <span className="w-3 h-px bg-border/40"></span>
                  <span className="text-primary font-bold">{post.author.name}</span>
                </div>
                <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
                  <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-2 flex-1">
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed font-medium">
                  {post.description}
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs transition-all duration-300 group-hover:gap-3">
                  The Full Breakdown <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </CardFooter>
            </Card>
          </MotionDiv>
        ))}
      </InfiniteScrollGrid>
    </div>
  );
}
