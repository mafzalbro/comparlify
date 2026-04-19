import { Suspense } from "react";
import prisma from "@/lib/prisma";
import type { SearchParams } from "@/types/next";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ManagedImage } from "@/components/managed-image";
import { SearchInput } from "./_components/search-input";
import { BookText, GitCompareArrows, Search as SearchIcon } from "lucide-react";
import { format } from "date-fns";
import { SearchResultsTabs } from "./_components/search-results-tabs";
import { MotionDiv } from "@/components/motion-wrapper";
import { Button } from "@/components/ui/button";

async function performSearch(query: string) {
  if (!query) {
    return { posts: [], comparisons: [] };
  }

  const [posts, comparisons] = await prisma.$transaction([
    prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { content: { contains: query } },
        ],
      },
      include: {
        category: true,
      },
      take: 20,
    }),
    prisma.comparison.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { summary: { contains: query } },
          { platformA: { name: { contains: query } } },
          { platformB: { name: { contains: query } } },
        ],
      },
      include: {
        platformA: true,
        platformB: true,
      },
      take: 20,
    }),
  ]);

  return { posts, comparisons };
}

export default async function SearchPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const { posts, comparisons } = await performSearch(query);

  const totalResults = posts.length + comparisons.length;

  return (
    <div className="bg-background min-h-screen">
      {/* Premium Search Hero */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
        <div className="container mx-auto relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              <Breadcrumbs
                items={[{ name: "Home", href: "/" }, { name: "Search" }]}
                className="mb-8 justify-center"
              />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
                <SearchIcon className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-widest leading-none">
                  Intelligence Discovery
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-none mb-6">
                Search <span className="text-primary italic">Results</span>
              </h1>
              <div className="w-full max-w-2xl mx-auto">
                <Suspense>
                  <SearchInput initialQuery={query} />
                </Suspense>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <div className="container mx-auto py-24 px-4 md:px-6 max-w-7xl">
        {query ? (
          totalResults > 0 ? (
            <div className="space-y-16">
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4 text-muted-foreground"
              >
                <span className="h-px w-12 bg-border/20"></span>
                <p className="text-sm font-bold uppercase tracking-[0.2em]">
                  Found {totalResults} Intelligence Packet
                  {totalResults !== 1 && "s"} for &quot;{query}&quot;
                </p>
                <span className="h-px w-12 bg-border/20"></span>
              </MotionDiv>
              <Suspense>
                <SearchResultsTabs posts={posts} comparisons={comparisons} />
              </Suspense>
            </div>
          ) : (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="text-center p-16 border-dashed rounded-4xl bg-secondary/5 border-border/20">
                <div className="p-6 bg-muted rounded-full w-fit mx-auto mb-6 opacity-20">
                  <SearchIcon className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-black mb-4">
                  No Data Packets Found
                </h3>
                <p className="text-lg text-muted-foreground mb-10">
                  We couldn't find any results for &quot;{query}&quot;. Try
                  adjusting your search parameters.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl px-12 h-14 font-black"
                >
                  <Link href="/search">Reset Search</Link>
                </Button>
              </Card>
            </MotionDiv>
          )
        ) : (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="text-center p-16 border-dashed rounded-4xl bg-secondary/5 border-border/20">
              <div className="p-6 bg-primary/10 rounded-full w-fit mx-auto mb-6 text-primary/40">
                <SearchIcon className="h-12 w-12 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black mb-4">Awaiting Input</h3>
              <p className="text-lg text-muted-foreground">
                Enter a query above to initiate the intelligence scan across our
                research reports and battle analysis.
              </p>
            </Card>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}
