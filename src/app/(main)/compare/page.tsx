import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { SearchParams } from "@/types/next";
import { getContent } from "@/lib/content";
import { SchemaScript } from "@/components/schema-script";
import { MotionDiv } from "@/components/motion-wrapper";
import { Zap } from "lucide-react";

// Components
import { FilterControls } from "./_components/filter-controls";
import { CompareHero } from "@/components/compare/compare-hero";
import { ComparisonList } from "@/components/compare/comparison-list";
import { BattleSelector } from "./_components/battle-selector";
import { GlobalMatchEngine } from "@/components/compare/global-match-engine";

export const metadata: Metadata = await generateSeoMetadata({
  title: "Side-by-Side | Platform Comparisons",
  description:
    "Detailed, data-driven comparisons of the top course creation platforms. Find the perfect fit for your business with expert guidance.",
  path: "/compare",
});

const getComparisons = cache(
  async ({
    search,
    sort,
    platforms,
    category,
  }: {
    search?: string;
    sort?: string;
    platforms?: string[];
    category?: string;
  }) => {
    let where: any = { published: true };
    let orderBy: any = { createdAt: "desc" };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { platformA: { name: { contains: search } } },
        { platformB: { name: { contains: search } } },
      ];
    }

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "rating") {
      orderBy = { platformA: { rating: "desc" } };
    }

    if (platforms && platforms.length > 0) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { platformAId: { in: platforms } },
            { platformBId: { in: platforms } },
          ],
        },
      ];
    }

    return prisma.comparison.findMany({
      where,
      include: {
        platformA: true,
        platformB: true,
      },
      orderBy,
    });
  },
);

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
  const { search, sort, category } = searchParams;
  const platformsParam = searchParams.platforms;
  const selectedPlatforms = Array.isArray(platformsParam)
    ? platformsParam
    : platformsParam
      ? [platformsParam]
      : [];

  const [comparisons, allPlatforms, allComps, categories, content] = await Promise.all([
    getComparisons({
      search: String(search ?? ""),
      sort: String(sort ?? "newest"),
      platforms: selectedPlatforms,
      category: String(category ?? "all"),
    }),
    getAllPlatforms(),
    getAllComparisonsList(),
    getComparisonCategories(),
    getContent(),
  ]);

  if (content["module.compare.enabled"] === "false") {
    notFound();
  }

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
        <GlobalMatchEngine allPlatforms={allPlatforms} allComparisons={allComps} />
        {/* ── BATTLE SELECTOR ─────────────── */}
        <BattleSelector platforms={allPlatforms} />

        {/* ── FILTERS ─────────────── */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 bg-card/20 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none translate-x-12 -translate-y-12">
            <Zap className="h-48 w-48" />
          </div>
          <div className="relative z-10">
            <FilterControls
              allPlatforms={allPlatforms}
              categories={categories}
              searchParams={searchParams}
            />
          </div>
        </MotionDiv>

        {/* ── LIST ────────────────────────── */}
        <ComparisonList
          comparisons={comparisons}
          emptyTitle={content["compare.empty.title"]}
          emptySubtitle={content["compare.empty.subtitle"]}
        />
      </div>
    </div>
  );
}
