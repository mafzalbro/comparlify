"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PostResultCard,
  ComparisonResultCard,
  NoResultsForTab,
} from "./search-result-cards";
import type { Post, Comparison, Platform } from "@prisma/client";

type PopulatedComparison = Comparison & {
  platformA: Platform;
  platformB: Platform;
};

interface SearchResultsTabsProps {
  posts: Post[];
  comparisons: PopulatedComparison[];
}

export function SearchResultsTabs({
  posts,
  comparisons,
}: SearchResultsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("type") || "all";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex justify-center mb-16">
        <TabsList className="flex h-auto p-2 bg-muted/40 backdrop-blur-2xl rounded-[2.5rem] border border-border/10 shadow-2xl">
          <TabsTrigger
            value="all"
            className="px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-2xl data-[state=active]:scale-105"
          >
            Omni{" "}
            <span className="ml-3 opacity-30 group-data-[state=active]:opacity-50">
              {posts.length + comparisons.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-2xl data-[state=active]:scale-105"
          >
            Insights{" "}
            <span className="ml-3 opacity-30 group-data-[state=active]:opacity-50">
              {posts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="comparisons"
            className="px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-2xl data-[state=active]:scale-105"
          >
            Simulations{" "}
            <span className="ml-3 opacity-30 group-data-[state=active]:opacity-50">
              {comparisons.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        value="all"
        className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {posts.map((post) => (
          <PostResultCard key={`post-${post.id}`} post={post} />
        ))}
        {comparisons.map((comp) => (
          <ComparisonResultCard key={`comp-${comp.id}`} comparison={comp} />
        ))}
      </TabsContent>
      <TabsContent
        value="posts"
        className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostResultCard key={`post-${post.id}`} post={post} />
          ))
        ) : (
          <NoResultsForTab type="posts" />
        )}
      </TabsContent>
      <TabsContent
        value="comparisons"
        className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {comparisons.length > 0 ? (
          comparisons.map((comp) => (
            <ComparisonResultCard key={`comp-${comp.id}`} comparison={comp} />
          ))
        ) : (
          <NoResultsForTab type="comparisons" />
        )}
      </TabsContent>
    </Tabs>
  );
}
