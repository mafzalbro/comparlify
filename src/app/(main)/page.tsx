import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { SchemaScript } from "@/components/schema-script";
import { auth } from "@/lib/auth";
import { cache } from "react";
import { getContent } from "@/lib/content";

import { GeometricBackground } from "@/components/geometric-background";
import { HomePageClient } from "@/components/home-page-client";
import { WhyChooseUs } from "@/components/why-choose-us";

// Atomic Components
import { HomeHero } from "@/components/home/home-hero";
import { DiscoveryHub } from "@/components/home/discovery-hub";
import { FeaturedReports } from "@/components/home/featured-reports";
import { ExpertIntelligence } from "@/components/home/expert-intelligence";
import { CreatorOutput } from "@/components/home/creator-output";
import { ScaleCTA } from "@/components/home/scale-cta";

const getRecentPosts = cache(async () => {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { author: true },
  });
});

const getFeaturedComparisons = cache(async () => {
  return prisma.comparison.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { platformA: true, platformB: true },
  });
});

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    path: "/",
  });
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const [session, recentPosts, featuredComparisons, content] =
    await Promise.all([
      auth(),
      getRecentPosts(),
      getFeaturedComparisons(),
      getContent(),
    ]);

  const isToolsEnabled = content["module.tools.enabled"] !== "false";
  const isCompareEnabled = content["module.compare.enabled"] !== "false";
  const isBlogEnabled = content["module.blog.enabled"] !== "false";

  const toolsHref = session ? "/tools" : "/register";

  return (
    <div className="flex flex-col w-full relative">
      <SchemaScript
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Comparlify",
          url: "https://comparlify.com",
          logo: "https://comparlify.com/logo.png",
          description:
            "Premium AI-powered platform for course creators and educators to compare tools and automate content workflows.",
        }}
      />

      <GeometricBackground />
      <HomePageClient session={session} />

      {/* ── HERO ─────────────────────────── */}
      <HomeHero
        supertitle={content["homepage.hero.supertitle"]}
        title={content["homepage.hero.title"]}
        subtitle={content["homepage.hero.subtitle"]}
        primaryCta={content["homepage.cta.primary"]}
        secondaryCta={content["homepage.cta.secondary"]}
        isToolsEnabled={isToolsEnabled}
        isCompareEnabled={isCompareEnabled}
        toolsHref={toolsHref}
      />

      {/* ── DISCOVERY HUB ────────────────── */}
      <DiscoveryHub />

      {/* ── FEATURED COMPARISONS ─────────── */}
      {isCompareEnabled && (
        <FeaturedReports comparisons={featuredComparisons} />
      )}

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
