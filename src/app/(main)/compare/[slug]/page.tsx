import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { SchemaScript } from "@/components/schema-script";
import { MarkdownContent } from "@/components/markdown-content";
import { AdPlacement } from "@/components/ad-placement";
import { PremiumNewsletterForm } from "@/components/premium-newsletter-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Zap,
  BookOpen,
  MessageSquare,
  Newspaper,
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
import { IntelligenceVerdict } from "@/components/comparison/intelligence-verdict";
import { ComparisonFaqs } from "@/components/comparison/comparison-faqs";
import { AuthorSection } from "@/components/comparison/author-section";
import { IntelligentAnalysis } from "@/components/comparison/intelligent-analysis";
import { PlatformVisitCards } from "@/components/comparison/platform-visit-cards";
import { InlineROICalculator } from "@/components/comparison/inline-roi-calculator";
import { PlatformPicker } from "@/components/tool/PlatformPicker";

const ComparisonChart = dynamic(
  () =>
    import("@/components/comparison-chart").then((mod) => mod.ComparisonChart),
  { ssr: true },
);

export const revalidate = 3600; // ISR for comparison pages

const getComparisonBySlug = cache(async (slug: string) => {
  return prisma.comparison.findFirst({
    where: { slug, published: true },
    include: {
      platformA: {
        include: {
          tiers: { orderBy: { monthlyPrice: "asc" } },
          features: { include: { feature: { include: { category: true } } } },
          newsArticles: { take: 2, where: { published: true } },
          forumTopics: { take: 2, where: { status: "APPROVED" } },
        },
      },
      platformB: {
        include: {
          tiers: { orderBy: { monthlyPrice: "asc" } },
          features: { include: { feature: { include: { category: true } } } },
          newsArticles: { take: 2, where: { published: true } },
          forumTopics: { take: 2, where: { status: "APPROVED" } },
        },
      },
      facts: true,
      faqs: true,
    },
  });
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const comparison = await getComparisonBySlug(slug);
  if (!comparison) return {};

  // Professional high-intent title strategy
  const currentYear = new Date().getFullYear();
  const professionalTitle = `${comparison.platformA.name} vs ${comparison.platformB.name} ${currentYear}: Pricing, Fees, and Infrastructure Comparison`;

  return generateSeoMetadata({
    title: professionalTitle,
    description: comparison.summary,
    path: `/compare/${comparison.slug}`,
  });
}

export const generateStaticParams = cache(async () => {
  const comparisons = await prisma.comparison.findMany({
    where: { published: true },
  });
  return comparisons.map((comp) => ({ slug: comp.slug }));
});

export default async function ComparisonDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const [session, comparison] = await Promise.all([
    auth(),
    getComparisonBySlug(slug),
  ]);

  if (!comparison) notFound();

  const { platformA, platformB } = comparison;

  // ── Scoring ─────────────────────────────────────────────
  const scoreA = calculatePlatformScore(platformA);
  const scoreB = calculatePlatformScore(platformB);
  const isPlatformAWinner = parseFloat(scoreA) > parseFloat(scoreB);
  const isPlatformBWinner = parseFloat(scoreB) > parseFloat(scoreA);
  const isCloseCall = Math.abs(parseFloat(scoreA) - parseFloat(scoreB)) < 0.5;

  // ── Stats Cards ─────────────────────────────────────────
  const stats = [
    {
      id: "score",
      name: "Expert Score",
      value1: scoreA,
      value2: scoreB,
    },
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
      name: "Overall Rating",
      [platformA.name]: platformA.rating ?? 0,
      [platformB.name]: platformB.rating ?? 0,
    },
    {
      name: "Ease of Use",
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
  ].filter(
    (d) =>
      (d[platformA.name] as number) > 0 || (d[platformB.name] as number) > 0,
  );

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
  });

  const getFeature = (platform: typeof platformA, featureId: string) =>
    platform.features.find((f: any) => f.featureId === featureId);

  const featureRows = allFeatures
    .map((feature) => {
      const pfA = getFeature(platformA, feature.id);
      const pfB = getFeature(platformB, feature.id);
      return {
        id: feature.id,
        name: feature.name,
        hasA: !!pfA?.hasFeature,
        hasB: !!pfB?.hasFeature,
        value1: pfA?.hasFeature ? pfA.details || "Supported" : "Not Included",
        value2: pfB?.hasFeature ? pfB.details || "Supported" : "Not Included",
      };
    })
    .filter((row) => row.hasA || row.hasB)
    .slice(0, 10);

  // ── Related Content ─────────────────────────────────────
  const [relatedPosts, relatedNews] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      take: 2,
      orderBy: { createdAt: "desc" },
      include: { author: true },
    }),
    prisma.newsArticle.findMany({
      where: { published: true },
      take: 2,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // ── Schema.org (Rich Snippets) ───────────────────────────
  const comparisonJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: comparison.title,
    description: comparison.summary,
    brand: { "@type": "Brand", name: "Comparlify" },
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: scoreA,
        bestRating: "10",
      },
      author: { "@type": "Organization", name: "Comparlify Intelligence" },
    },
  };

  return (
    <div className="bg-background min-h-screen">
      <SchemaScript schema={comparisonJsonLd} />

      <article className="pb-40">
        {/* ── HERO ─────────────────────────── */}
        <ComparisonHero
          title={comparison.title}
          summary={comparison.summary}
          comparisonId={comparison.id}
          platformA={platformA}
          platformB={platformB}
          scoreA={scoreA}
          scoreB={scoreB}
          session={session}
        />

        {/* ── STAT CARDS ───────────────────── */}
        <ComparisonStats
          stats={stats}
          platformAName={platformA.name}
          platformBName={platformB.name}
        />

        {/* ── PLATFORM PICKER (Decision Engine) ────────────────── */}
        <section className="py-24 overflow-hidden">
          <PlatformPicker
            platformA={{
              id: platformA.id,
              name: platformA.name,
              affiliateUrl: platformA.affiliateLink,
            }}
            platformB={{
              id: platformB.id,
              name: platformB.name,
              affiliateUrl: platformB.affiliateLink,
            }}
          />
        </section>

        {/* ── MAIN CONTENT GRID ────────────── */}
        <section className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* ── SIDEBAR ──────────────────── */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-40 space-y-16">
                {/* Radar Chart */}
                <section className="bg-card/40 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-10 flex items-center gap-3">
                    <Zap className="h-6 w-6 text-primary" /> Expert Overview
                  </h3>
                  <div className="h-[300px]">
                    <ComparisonChart
                      chartConfig={chartConfig}
                      chartData={chartData}
                      platformAName={platformA.name}
                      platformBName={platformB.name}
                    />
                  </div>
                </section>

                <AdPlacement placement="SIDEBAR" />

                {/* Newsletter */}
                <section className="bg-card/60 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-2xl text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent" />
                  <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 uppercase tracking-[0.4em] text-[10px] font-black rounded-full mb-8 shadow-sm relative z-10">
                    Stay Updated
                  </Badge>
                  <h3 className="text-3xl font-black text-foreground mb-6 leading-[1.1] relative z-10">
                    Get the <br />
                    <span className="text-primary italic">Expert Scoop.</span>
                  </h3>
                  <div className="relative z-10 space-y-8">
                    <PremiumNewsletterForm
                      buttonText="Subscribe Free"
                      containerClassName="bg-background/50 border-white/5 p-4 rounded-3xl"
                    />
                  </div>
                </section>

                {/* ── COLLECTIVE PULSE ─────────────── */}
                <section className="bg-primary/5 border border-primary/20 p-8 rounded-[3rem] space-y-8">
                  <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[9px] font-black">
                    Community Pulse
                  </Badge>
                  <h4 className="text-2xl font-black leading-none uppercase">
                    Expert{" "}
                    <span className="text-primary italic">Highlights</span>
                  </h4>

                  <div className="space-y-6">
                    {[...platformA.forumTopics, ...platformB.forumTopics]
                      .slice(0, 3)
                      .map((topic) => (
                        <Link
                          key={topic.id}
                          href={`/community/topic/${topic.id}`}
                          className="flex items-start gap-4 p-4 rounded-2xl bg-background hover:bg-primary/5 transition-all group"
                        >
                          <MessageSquare className="h-5 w-5 text-muted-foreground mt-1 group-hover:text-primary" />
                          <p className="text-xs font-bold leading-snug group-hover:text-primary transition-colors">
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
                          className="flex items-start gap-4 p-4 rounded-2xl bg-background hover:bg-blue-500/5 transition-all group border border-blue-500/10"
                        >
                          <Newspaper className="h-5 w-5 text-blue-500 mt-1" />
                          <p className="text-xs font-bold leading-snug group-hover:text-blue-500 transition-colors">
                            {news.title}
                          </p>
                        </Link>
                      ))}
                  </div>

                  <Button
                    asChild
                    variant="ghost"
                    className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:bg-primary/10"
                  >
                    <Link href="/community">Visit Community</Link>
                  </Button>
                </section>
              </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────── */}
            <main className="lg:col-span-8 space-y-24">
              <AdPlacement placement="POST_TOP" className="mb-16" />

              {/* Introduction */}
              <section className="space-y-16">
                <div className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[11px]">
                  <div className="w-12 h-px bg-primary/30" />
                  Analysis Overview
                </div>
                <MarkdownContent content={comparison.introduction} />
              </section>

              <AdPlacement placement="COMPARISON_BETWEEN" className="my-24" />

              {/* ROI Calculator */}
              <section className="space-y-8">
                <div className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[11px]">
                  <div className="w-12 h-px bg-primary/30" />
                  Cost & ROI Analysis
                </div>
                <InlineROICalculator
                  platformA={platformA}
                  platformB={platformB}
                />
              </section>

              {/* Detailed Content Analysis */}
              {comparison.content && (
                <section className="space-y-16">
                  <div className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[11px]">
                    <div className="w-12 h-px bg-primary/30" />
                    Comparison Deep Dive
                  </div>
                  <MarkdownContent content={comparison.content} />
                </section>
              )}

              <IntelligentAnalysis
                content={comparison.content || ""}
                platformA={platformA}
                platformB={platformB}
                comparison={comparison}
              />

              {comparison.authorName && (
                <AuthorSection
                  name={comparison.authorName}
                  role={comparison.authorRole || ""}
                  bio={comparison.authorBio || ""}
                  credentials={(comparison.authorCredentials as string[]) || []}
                />
              )}

              {/* Feature Matrix */}
              <ComparisonFeatureMatrix
                features={featureRows}
                platformAName={platformA.name}
                platformBName={platformB.name}
              />

              {/* Final Verdict */}
              <IntelligenceVerdict
                conclusion={comparison.conclusion}
                platformAName={platformA.name}
                platformBName={platformB.name}
                isPlatformAWinner={isPlatformAWinner}
                isCloseCall={isCloseCall}
              />

              {/* Mobile Share Row */}
              <div className="lg:hidden" />

              {/* FAQs */}
              <ComparisonFaqs faqs={comparison.faqs} />

              <AdPlacement placement="POST_BOTTOM" className="mt-24" />

              {/* Platform CTAs */}
              <PlatformVisitCards platformA={platformA} platformB={platformB} />

              {/* Related Content */}
              {(relatedPosts.length > 0 || relatedNews.length > 0) && (
                <section className="pt-32 border-t border-border/10">
                  <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[11px] mb-12">
                    <div className="w-12 h-px bg-primary/30" />
                    Related Intelligence
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter mb-16">
                    Keep <span className="text-primary italic">Reading</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {relatedPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group"
                      >
                        <Card className="bg-card/40 border-border/10 p-6 rounded-4xl hover:bg-primary/5 transition-all h-full">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <BookOpen className="h-3 w-3" /> Blog Article
                          </span>
                          <h4 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {post.title}
                          </h4>
                        </Card>
                      </Link>
                    ))}
                    {relatedNews.map((news) => (
                      <Link
                        key={news.id}
                        href={`/news/${news.slug}`}
                        className="group"
                      >
                        <Card className="bg-card/40 border-border/10 p-6 rounded-4xl hover:bg-blue-500/5 transition-all h-full">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4 block">
                            Market News
                          </span>
                          <h4 className="text-xl font-bold group-hover:text-blue-500 transition-colors">
                            {news.title}
                          </h4>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </section>
      </article>
    </div>
  );
}
