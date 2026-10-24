import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { cache } from "react";
import { getContent } from "@/lib/content";

import { JsonLd } from "@/components/json-ld";

// import { GeometricBackground } from "@/components/geometric-background";
import { HomePageClient } from "@/components/home-page-client";
import { WhyChooseUs } from "@/components/why-choose-us";

// Atomic Components
import { HomeHero } from "@/components/home/home-hero";
import { DiscoveryHub } from "@/components/home/discovery-hub";
import { FeaturedReports } from "@/components/home/featured-reports";
import { ExpertIntelligence } from "@/components/home/expert-intelligence";
import { CreatorOutput } from "@/components/home/creator-output";
import { ScaleCTA } from "@/components/home/scale-cta";

import { BattleSelector } from "@/app/(main)/compare/_components/battle-selector";

const getAllPlatforms = cache(async () => {
  return prisma.platform.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
});

const getRecentPosts = cache(async () => {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      author: true,
    },
  });
});

const getFeaturedComparisons = cache(async () => {
  return prisma.comparison.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      platformA: true,
      platformB: true,
    },
  });
});

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Compare Creator Platforms & Software Side-by-Side",
    description:
      "Compare online course, community, and creator platforms with verified side-by-side matrices, fee calculators, and deep-dive comparisons.",
    path: "/",
  });
}

export const revalidate = 3600; // Cache home page for 1 hour, revalidate in background

export default async function Home() {
  const [recentPosts, featuredComparisons, allPlatforms, content] =
    await Promise.all([
      getRecentPosts(),
      getFeaturedComparisons(),
      getAllPlatforms(),
      getContent(),
    ]);

  const isToolsEnabled = content["module.tools.enabled"] !== "false";
  const isCompareEnabled = content["module.compare.enabled"] !== "false";
  const isBlogEnabled = content["module.blog.enabled"] !== "false";

  // NOTE: Organization schema is emitted once globally in src/app/layout.tsx
  // with a stable @id (https://www.comparlify.com/#organization).
  // Do NOT re-declare it here — duplicate Organization schemas on the same
  // page are treated as conflicting signals by Google's structured data parser.

  const featuredComparisonsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Platform Comparisons",
    description:
      "Independent side-by-side creator software and LMS platform comparisons.",
    itemListElement: featuredComparisons.map((comp, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: comp.title,
      url: `https://www.comparlify.com/${comp.slug}`,
    })),
  };

  return (
    <div className="flex flex-col w-full relative">
      <JsonLd data={featuredComparisonsJsonLd} />
      {/* <GeometricBackground /> */}
      <HomePageClient />

      {/* ── HERO ─────────────────────────── */}
      <HomeHero
        supertitle={content["homepage.hero.supertitle"]}
        title={content["homepage.hero.title"]}
        subtitle={content["homepage.hero.subtitle"]}
        primaryCta={
          content["homepage.cta.primary"] === "Explore AI Tools"
            ? "Explore Comparisons"
            : content["homepage.cta.primary"] || "Explore Comparisons"
        }
        secondaryCta={content["homepage.cta.secondary"]}
        isToolsEnabled={isToolsEnabled}
        isCompareEnabled={isCompareEnabled}
        toolsHref="/tools"
      />

      {/* ── INTERACTIVE INSTANT BATTLE SELECTOR ── */}
      <section className="container mx-auto px-4 md:px-6 -mt-4 mb-4 relative z-20">
        <BattleSelector platforms={allPlatforms} />
      </section>

      {/* ── FEATURED COMPARISONS ─────────── */}
      {isCompareEnabled && (
        <FeaturedReports comparisons={featuredComparisons} />
      )}

      {/* ── DISCOVERY HUB ────────────────── */}
      <DiscoveryHub />

      {/* ── WHY CHOOSE US ────────────────── */}
      <WhyChooseUs
        content={{
          "homepage.whyus.title":
            content["homepage.whyus.title"] || "Why Comparlify?",
          "homepage.whyus.subtitle":
            content["homepage.whyus.subtitle"] ||
            "The smarter way to build your course empire.",
          "homepage.whyus.comparisons.title":
            content["homepage.whyus.comparisons.title"],
          "homepage.whyus.comparisons.description":
            content["homepage.whyus.comparisons.description"],
          "homepage.whyus.aitools.title":
            content["homepage.whyus.aitools.title"],
          "homepage.whyus.aitools.description":
            content["homepage.whyus.aitools.description"],
          "homepage.whyus.strategies.title":
            content["homepage.whyus.strategies.title"],
          "homepage.whyus.strategies.description":
            content["homepage.whyus.strategies.description"],
          "module.compare.enabled": content["module.compare.enabled"],
          "module.tools.enabled": content["module.tools.enabled"],
          "module.blog.enabled": content["module.blog.enabled"],
        }}
      />

      {/* ── EXPERT INTELLIGENCE (BLOG) ───── */}
      {isBlogEnabled && (
        <ExpertIntelligence
          posts={recentPosts}
          description={content["homepage.blog.description"]}
        />
      )}

      {/* ── CREATOR OUTPUT (TESTIMONIALS) ── */}
      <CreatorOutput />

      {/* ── SCALE CTA ────────────────────── */}
      <ScaleCTA
        subtitle={content["homepage.finalCta.subtitle"]}
        buttonText={content["homepage.finalCta.button"]}
      />
    </div>
  );
}
