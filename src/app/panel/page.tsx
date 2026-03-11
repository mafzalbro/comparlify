import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import type { Post, Comparison, Platform, Bookmark } from "@prisma/client";
import {
  ArrowRight,
  BookText,
  GitCompareArrows,
  LayoutDashboard,
  Star,
  Sparkles,
  Clock,
  Globe,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagedImage } from "@/components/managed-image";
import type { SearchParams } from "@/types/next";
import { MotionDiv } from "@/components/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type PopulatedPostBookmark = Bookmark & { post: Post };
type PopulatedComparisonBookmark = Bookmark & {
  comparison: Comparison & { platformA: Platform; platformB: Platform };
};

async function getBookmarks(userId: string) {
  const postBookmarks = await prisma.bookmark.findMany({
    where: { userId, postId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { post: true },
    take: 20,
  });

  const comparisonBookmarks = await prisma.bookmark.findMany({
    where: { userId, comparisonId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { comparison: { include: { platformA: true, platformB: true } } },
    take: 20,
  });

  return {
    posts: postBookmarks as PopulatedPostBookmark[],
    comparisons: comparisonBookmarks as PopulatedComparisonBookmark[],
  };
}

export const dynamic = "force-dynamic";

function PostBookmarkCard({ post }: { post: Post }) {
  const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
  return (
    <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-3xl border border-border/10 hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] flex flex-col h-full shadow-lg hover:shadow-[0_20px_50px_-15px_rgba(var(--primary-rgb),0.15)]">
      <div className="relative overflow-hidden aspect-[16/9]">
        <Link href={`/blog/${post.slug}`} className="block h-full">
          <ManagedImage
            src={post.image}
            alt={post.title}
            data-ai-hint={post.dataAiHint ?? ""}
            fill
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
            <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[8px] h-6 px-3 border-none shadow-xl">
              Verified Signal
            </Badge>
          </div>
        </Link>
      </div>
      <CardHeader className="p-10 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <BookText className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
            Research Packet
          </span>
        </div>
        <CardTitle className="font-headline text-2xl font-black leading-[1.2] group-hover:text-primary transition-colors line-clamp-2 italic">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-10 flex-1">
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-medium">
          {post.description}
        </p>
      </CardContent>
      <CardFooter className="p-10 pt-0 mt-auto flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/5 border border-border/10">
          <Clock className="h-3 w-3 text-primary/60" />
          <span>{readTime}m read</span>
        </div>
        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          Open Intelligence <ArrowRight className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}

function ComparisonBookmarkCard({
  comparison,
}: {
  comparison: Comparison & { platformA: Platform; platformB: Platform };
}) {
  return (
    <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-3xl border border-border/10 hover:border-primary/30 transition-all duration-500 rounded-[3rem] flex flex-col h-full shadow-lg hover:shadow-[0_20px_50px_-15px_rgba(var(--primary-rgb),0.15)]">
      <CardHeader className="p-10 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <GitCompareArrows className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
            Battle Briefing
          </span>
        </div>
        <div className="relative bg-muted/30 rounded-[2rem] p-8 overflow-hidden min-h-[140px] mb-8 border border-border/10">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
          <div className="flex justify-around items-center w-full relative z-10 gap-2">
            <div className="w-2/5 flex justify-center">
              <ManagedImage
                src={comparison.platformA.logoUrl}
                alt={`${comparison.platformA.name} logo`}
                width={100}
                height={32}
                className="object-contain h-8 w-auto grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
              />
            </div>
            <div className="w-1/5 flex justify-center">
              <div className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-md border border-border/20 flex items-center justify-center shadow-2xl group-hover:border-primary/40 transition-all">
                <span className="font-mono text-[9px] font-black text-muted-foreground group-hover:text-primary transition-colors">
                  VS
                </span>
              </div>
            </div>
            <div className="w-2/5 flex justify-center">
              <ManagedImage
                src={comparison.platformB.logoUrl}
                alt={`${comparison.platformB.name} logo`}
                width={100}
                height={32}
                className="object-contain h-8 w-auto grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
              />
            </div>
          </div>
        </div>
        <CardTitle className="font-headline text-2xl font-black leading-[1.2] group-hover:text-primary transition-colors text-center line-clamp-2 italic px-2">
          <Link
            href={`/compare/${comparison.slug}`}
            className="after:absolute after:inset-0"
          >
            {comparison.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardFooter className="p-10 pt-0 mt-auto flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/5 border border-border/10">
          <Sparkles className="h-3 w-3 text-primary/60" />
          <span>Combat Data</span>
        </div>
        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          Analyze <ArrowRight className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default async function UserPanelDashboard(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const { posts, comparisons } = await getBookmarks(session?.user?.id || "");
  const hasBookmarks = posts.length > 0 || comparisons.length > 0;

  const activeTab = searchParams.view || "posts";

  return (
    <div className="space-y-12">
      {/* Premium Dashboard Hero */}
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative p-12 md:p-16 rounded-[4rem] bg-card/60 backdrop-blur-3xl border border-primary/20 shadow-[0_45px_100px_-20px_rgba(var(--primary-rgb),0.2)] overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-12 -translate-y-12">
          <LayoutDashboard className="h-64 w-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
              Creator Terminal
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                Welcome,{" "}
                <span className="text-primary italic">
                  {session.user.name?.split(" ")[0]}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Your personalized intelligence hub is active. Access your
                curated research and strategic battle reports here.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-6 rounded-[2rem] bg-background/50 backdrop-blur-sm border border-border/10 text-center min-w-[120px]">
              <p className="text-2xl font-black text-foreground">
                {posts.length + comparisons.length}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Packets
              </p>
            </div>
            <div className="p-6 rounded-[2rem] bg-primary/10 backdrop-blur-sm border border-primary/20 text-center min-w-[120px] text-primary">
              <p className="text-2xl font-black">{posts.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                Reports
              </p>
            </div>
          </div>
        </div>
      </MotionDiv>

      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
              Saved <span className="text-primary italic">Intelligence</span>
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Manage your bookmarked research and comparisons.
            </p>
          </div>

          {hasBookmarks && (
            <div className="flex h-14 p-1.5 bg-muted/50 backdrop-blur-xl rounded-2xl border border-border/10 shadow-lg">
              <Button
                asChild
                variant={activeTab === "posts" ? "default" : "ghost"}
                className={`rounded-xl px-8 h-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "posts" ? "shadow-lg" : "text-muted-foreground"}`}
              >
                <Link href="?view=posts" scroll={false}>
                  <BookText className="mr-2 h-4 w-4" /> Reports
                </Link>
              </Button>
              <Button
                asChild
                variant={activeTab === "comparisons" ? "default" : "ghost"}
                className={`rounded-xl px-8 h-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "comparisons" ? "shadow-lg" : "text-muted-foreground"}`}
              >
                <Link href="?view=comparisons" scroll={false}>
                  <GitCompareArrows className="mr-2 h-4 w-4" /> Battles
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="px-2">
          {hasBookmarks ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === "posts" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.length > 0 ? (
                    posts.map((bookmark) => (
                      <PostBookmarkCard
                        key={bookmark.id}
                        post={bookmark.post}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center rounded-[3rem] border-2 border-dashed border-border/10 bg-secondary/5">
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">
                        No Research Signals Detected
                      </p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "comparisons" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {comparisons.length > 0 ? (
                    comparisons.map((bookmark) => (
                      <ComparisonBookmarkCard
                        key={bookmark.id}
                        comparison={bookmark.comparison}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center rounded-[3rem] border-2 border-dashed border-border/10 bg-secondary/5">
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">
                        No Combat Data Captured
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 rounded-[4rem] border-2 border-dashed border-border/10 bg-secondary/5"
            >
              <div className="p-10 bg-muted rounded-full w-fit mx-auto mb-10 opacity-30">
                <Star className="h-16 w-16" />
              </div>
              <h3 className="text-4xl font-black mb-6">Archive Empty</h3>
              <p className="text-xl text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed">
                You haven't bookmarked any intelligence packets yet. Start
                exploring the research lab and war room.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest text-xs border-primary/20 backdrop-blur-md"
                >
                  <Link href="/blog">Research Lab</Link>
                </Button>
                <Button
                  asChild
                  size="xl"
                  className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  <Link href="/compare">The War Room</Link>
                </Button>
              </div>
            </MotionDiv>
          )}
        </div>
      </section>
    </div>
  );
}
