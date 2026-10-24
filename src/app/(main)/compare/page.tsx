import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { cn } from "@/lib/utils";
import { getContent } from "@/lib/content";
import { SchemaScript } from "@/components/schema-script";
import { MotionDiv } from "@/components/motion-wrapper";
import { PAGE_CONTAINER, GLASS_CARD } from "@/lib/design-tokens";

import { FilterControls } from "./_components/filter-controls";
import { CompareHero } from "@/components/compare/compare-hero";
import { BattleSelector } from "./_components/battle-selector";
import { GlobalMatchEngine } from "@/components/compare/global-match-engine";
import { ComparisonCardsList } from "./_components/comparison-cards-list";
import { ComparisonCardsSkeleton } from "./_components/comparison-skeletons";

// ISR — now actually applies because the route is static.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Side-by-Side | Platform Comparisons",
    description:
      "Detailed, data-driven comparisons of the top course creation platforms. Find the perfect fit for your business with expert guidance.",
    path: "/compare",
  });
}

const getAllPlatforms = cache(async () =>
  prisma.platform.findMany({ orderBy: { name: "asc" } }),
);

const getAllComparisonsList = cache(async () =>
  prisma.comparison.findMany({
    where: { published: true },
    include: {
      platformA: true,
      platformB: true,
    },
    orderBy: { createdAt: "desc" },
  }),
);

const getComparisonCategories = cache(async () =>
  prisma.comparisonCategory.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  }),
);

// ⬇ No `searchParams` prop. The whole route is now static + ISR.
export default async function ComparePage() {
  const [allPlatforms, allComps, categories, content] = await Promise.all([
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

      <div className={PAGE_CONTAINER + " py-12"}>
        {/* ── MATCH ENGINE WIZARD ──────────── */}
        {/* <div className="mb-10">
          <GlobalMatchEngine
            allPlatforms={allPlatforms}
            allComparisons={allComps}
          />
        </div> */}

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
          <div className={cn(GLASS_CARD, "p-5 sm:p-6")}>
            <Suspense
              fallback={
                <div className="h-11 rounded-full bg-muted/40 animate-pulse" />
              }
            >
              <FilterControls
                allPlatforms={allPlatforms}
                categories={categories}
              />
            </Suspense>
          </div>
        </MotionDiv>

        {/* ── SUSPENDED LIST ────────────────────────── */}
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<ComparisonCardsSkeleton />}>
            <ComparisonCardsList allComparisons={allComps} content={content} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
