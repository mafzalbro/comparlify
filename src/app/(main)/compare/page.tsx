import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import type { SearchParams } from "@/types/next";
import { getContent } from "@/lib/content";
import { SchemaScript } from "@/components/schema-script";
import { MotionDiv } from "@/components/motion-wrapper";
import { Zap } from "lucide-react";

// Components
import { FilterControls } from "./_components/filter-controls";
import { CompareHero } from "@/components/compare/compare-hero";
import { BattleSelector } from "./_components/battle-selector";
import { GlobalMatchEngine } from "@/components/compare/global-match-engine";
import { ComparisonCardsList } from "./_components/comparison-cards-list";
import { ComparisonCardsSkeleton } from "./_components/comparison-skeletons";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Side-by-Side | Platform Comparisons",
    description:
      "Detailed, data-driven comparisons of the top course creation platforms. Find the perfect fit for your business with expert guidance.",
    path: "/compare",
  });
}

const getAllPlatforms = cache(async () => {
  return prisma.platform.findMany({ orderBy: { name: "asc" } });
});

const getAllComparisonsList = cache(async () => {
  return prisma.comparison.findMany({
    where: { published: true },
    include: { platformA: true, platformB: true },
  });
});

const getComparisonCategories = cache(async () => {
  return prisma.comparisonCategory.findMany({ orderBy: { name: "asc" } });
});

export default async function ComparePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const [allPlatforms, allComps, categories, content] = await Promise.all([
    getAllPlatforms(),
    getAllComparisonsList(),
    getComparisonCategories(),
    getContent(),
  ]);

  if (content["module.compare.enabled"] === "false") {
    notFound();
  }

  // Suspense key based on filters to allow smooth loading
  const platformsParam = searchParams.platforms;
  const selectedPlatformsStr = Array.isArray(platformsParam)
    ? platformsParam.join(",")
    : platformsParam || "";
  const filterKey = `${searchParams.search ?? ""}-${searchParams.category ?? ""}-${searchParams.sort ?? ""}-${selectedPlatformsStr}`;

  return (
    <div className="bg-background min-h-screen">
      <SchemaScript
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Platform Comparison Hub | Comparlify",
          description:
            "Detailed assessment of the top course creation platforms to help you choose the best fit.",
          url: "https://comparlify.com/compare",
        }}
      />

      {/* ── HERO ─────────────────────────── */}
      <CompareHero subtitle={content["compare.hero.subtitle"]} />

      <div className="container mx-auto py-12 px-4 md:px-6">
        {/* ── MATCH ENGINE WIZARD ──────────── */}
        <div className="mb-10">
          <GlobalMatchEngine allPlatforms={allPlatforms} allComparisons={allComps} />
        </div>

        {/* ── BATTLE SELECTOR ─────────────── */}
        <div className="mb-14">
          <BattleSelector platforms={allPlatforms} />
        </div>

        {/* ── FILTERS ─────────────── */}
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 max-w-5xl mx-auto"
        >
          <div className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-2xl shadow-sm">
            <FilterControls
              allPlatforms={allPlatforms}
              categories={categories}
              searchParams={searchParams}
            />
          </div>
        </MotionDiv>

        {/* ── SUSPENDED LIST ────────────────────────── */}
        <div className="max-w-6xl mx-auto">
          <Suspense key={filterKey} fallback={<ComparisonCardsSkeleton />}>
            <ComparisonCardsList searchParams={searchParams} content={content} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
