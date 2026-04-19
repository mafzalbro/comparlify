import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { SchemaScript } from "@/components/schema-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Zap,
  MessageSquare,
  Newspaper,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cache } from "react";
import { auth } from "@/lib/auth";
import dynamic from "next/dynamic";

import { calculatePlatformScore } from "@/lib/scoring";
import { ComparisonHero } from "@/components/comparison/comparison-hero";
import { ComparisonStats } from "@/components/comparison/comparison-stats";
import { ComparisonFeatureMatrix } from "@/components/comparison/comparison-feature-matrix";
import { PlatformVisitCards } from "@/components/comparison/platform-visit-cards";
import { MotionDiv } from "@/components/motion-wrapper";

const ComparisonChart = dynamic(
  () =>
    import("@/components/comparison-chart").then((mod) => mod.ComparisonChart),
  { ssr: true },
);

const getPlatformBySlug = cache(async (slug: string) => {
  // Try to match platform name from slug (e.g., 'kajabi' from 'kajabi-vs-teachable')
  // This is a simplified lookup
  const platforms = await prisma.platform.findMany({
    include: {
      features: { include: { feature: { include: { category: true } } } },
      posts: { take: 2, where: { published: true } },
      newsArticles: { take: 2, where: { published: true } },
      forumTopics: { take: 2, where: { status: "APPROVED" } },
    },
  });

  return platforms.find(
    (p) => p.name.toLowerCase().replace(/\s+/g, "-") === slug,
  );
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return {};

  return generateSeoMetadata({
    title: `${parts[0].toUpperCase()} vs ${parts[1].toUpperCase()} | Platform Matchup`,
    description: `Detailed comparison between ${parts[0]} and ${parts[1]}. Find the winner with expert insights.`,
    path: `/compare/vs/${slug}`,
  });
}

export default async function DynamicBattlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const session = await auth();
  const parts = slug.split("-vs-");

  if (parts.length !== 2) notFound();

  const [platformA, platformB] = await Promise.all([
    getPlatformBySlug(parts[0]),
    getPlatformBySlug(parts[1]),
  ]);

  if (!platformA || !platformB) notFound();

  // ── Scoring ─────────────────────────────────────────────
  const scoreA = calculatePlatformScore(platformA);
  const scoreB = calculatePlatformScore(platformB);

  // ── Stats ───────────────────────────────────────────────
  const stats = [
    { id: "score", name: "Expert Score", value1: scoreA, value2: scoreB },
    {
      id: "ease",
      name: "Ease of Use",
      value1: (platformA.easeOfUse ?? 0).toString(),
      value2: (platformB.easeOfUse ?? 0).toString(),
    },
    {
      id: "support",
      name: "Support Quality",
      value1: (platformA.support ?? 0).toString(),
      value2: (platformB.support ?? 0).toString(),
    },
  ];

  // ── Radar Chart ─────────────────────────────────────────
  const chartData = [
    {
      name: "Rating",
      [platformA.name]: platformA.rating ?? 0,
      [platformB.name]: platformB.rating ?? 0,
    },
    {
      name: "Ease",
      [platformA.name]: platformA.easeOfUse ?? 0,
      [platformB.name]: platformB.easeOfUse ?? 0,
    },
    {
      name: "Features",
      [platformA.name]: platformA.featuresRating ?? 0,
      [platformB.name]: platformB.featuresRating ?? 0,
    },
    {
      name: "Support",
      [platformA.name]: platformA.support ?? 0,
      [platformB.name]: platformB.support ?? 0,
    },
  ];

  const chartConfig = {
    [platformA.name]: { label: platformA.name, color: "hsl(var(--primary))" },
    [platformB.name]: {
      label: platformB.name,
      color: "hsl(var(--secondary-foreground))",
    },
  };

  // ── Feature Matrix ──────────────────────────────────────
  const allFeatures = await prisma.feature.findMany({
    include: { category: true },
    take: 15,
  });
  const featureRows = allFeatures.map((feature) => {
    const pfA = platformA.features.find((f) => f.featureId === feature.id);
    const pfB = platformB.features.find((f) => f.featureId === feature.id);
    return {
      id: feature.id,
      name: feature.name,
      value1: pfA?.hasFeature ? pfA.details || "Supported" : "Not Included",
      value2: pfB?.hasFeature ? pfB.details || "Supported" : "Not Included",
    };
  });

  return (
    <div className="bg-background min-h-screen">
      <SchemaScript
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${platformA.name} vs ${platformB.name}`,
        }}
      />

      <article className="pb-40">
        <ComparisonHero
          title={`${platformA.name} vs ${platformB.name}`}
          summary={`A detailed comparison between ${platformA.name} and ${platformB.name} based on real-time community data.`}
          comparisonId="dynamic"
          platformA={platformA as any}
          platformB={platformB as any}
          scoreA={scoreA}
          scoreB={scoreB}
          session={session}
        />

        <ComparisonStats
          stats={stats}
          platformAName={platformA.name}
          platformBName={platformB.name}
        />

        <section className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit z-30">
              <div className="bg-card/40 backdrop-blur-3xl border border-border/10 p-5 rounded-3xl shadow-2xl relative overflow-hidden">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Feature Radar
                </h3>
                <div className="h-[250px]">
                  <ComparisonChart
                    chartConfig={chartConfig}
                    chartData={chartData}
                    platformAName={platformA.name}
                    platformBName={platformB.name}
                  />
                </div>
              </div>

              {/* Connected Intelligence Widget */}
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] space-y-5">
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[8px] font-black">
                  Community Pulse
                </Badge>
                <h4 className="text-xl font-black leading-none">
                  Expert <span className="text-primary italic">Highlights</span>
                </h4>

                <div className="space-y-3">
                  {[...platformA.forumTopics, ...platformB.forumTopics]
                    .slice(0, 3)
                    .map((topic) => (
                      <Link
                        key={topic.id}
                        href={`/community/topic/${topic.id}`}
                        className="flex items-start gap-3 p-3 rounded-xl bg-background hover:bg-primary/5 transition-all group"
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 group-hover:text-primary shrink-0" />
                        <p className="text-xs font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {topic.title}
                        </p>
                      </Link>
                    ))}
                  {[...platformA.newsArticles, ...platformB.newsArticles]
                    .slice(0, 2)
                    .map((news) => (
                      <Link
                        key={news.id}
                        href={`/news/${news.slug}`}
                        className="flex items-start gap-3 p-3 rounded-xl bg-background hover:bg-blue-500/5 transition-all group border border-blue-500/10"
                      >
                        <Newspaper className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                        <p className="text-xs font-bold leading-snug group-hover:text-blue-500 transition-colors line-clamp-2">
                          {news.title}
                        </p>
                      </Link>
                    ))}
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-xl h-10 font-black uppercase tracking-widest text-[9px]"
                >
                  <Link href="/community">Join Discussion</Link>
                </Button>
              </div>
            </aside>

            <main className="lg:col-span-8 space-y-16">
              <div className="p-10 rounded-[3rem] bg-secondary/30 border border-border/10">
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" /> Expert Insights
                </h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  This comparison is dynamically created using verified data
                  from the Comparlify database. This data-driven summary
                  provides immediate professional clarity.
                </p>
              </div>

              <ComparisonFeatureMatrix
                features={featureRows}
                platformAName={platformA.name}
                platformBName={platformB.name}
              />

              <div className="bg-card p-12 rounded-[3.5rem] border border-border/10">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 space-y-6">
                    <h3 className="text-3xl font-black uppercase leading-none">
                      Scale with{" "}
                      <span className="text-primary italic">AI Tools</span>
                    </h3>
                    Ready to build on any of these platforms? Use our
                    specialized creator tools to start your content and
                    descriptions instantly.
                    <Button
                      asChild
                      size="lg"
                      className="rounded-2xl h-14 px-10 font-black"
                    >
                      <Link href="/tools">Launch AI Assistant</Link>
                    </Button>
                  </div>
                  <div className="w-full md:w-48 aspect-square bg-primary/10 rounded-3xl flex items-center justify-center p-8 border border-primary/20">
                    <Zap className="h-full w-full text-primary animate-pulse" />
                  </div>
                </div>
              </div>

              <PlatformVisitCards
                platformA={platformA as any}
                platformB={platformB as any}
              />
            </main>
          </div>
        </section>
      </article>
    </div>
  );
}
