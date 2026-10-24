import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { SchemaScript } from "@/components/schema-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ManagedImage } from "@/components/managed-image";
import { PlatformScorecardCard } from "@/components/platform-scorecard-card";
import { calculatePlatformScore } from "@/lib/score-engine";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Zap,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { cache } from "react";
import { allPlatforms as staticPlatforms } from "@/data/compare/platforms";

export const revalidate = 3600;

const FALLBACK_CATEGORY = "Creator Tools & Software";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const getPlatformAndAlternatives = cache(async (slug: string) => {
  const platformMap = new Map<string, any>();
  for (const p of staticPlatforms) {
    const s = toSlug(p.name);
    platformMap.set(s, {
      ...p,
      slug: s,
      id: (p as any).id || s,
      category: p.category || FALLBACK_CATEGORY,
    });
  }

  try {
    const dbPlatforms = await prisma.platform.findMany({
      include: {
        tiers: { orderBy: { monthlyPrice: "asc" } },
        features: { include: { feature: { include: { category: true } } } },
      },
    });

    for (const p of dbPlatforms) {
      const s = toSlug(p.name);
      const existing = platformMap.get(s) || {};
      platformMap.set(s, {
        ...existing,
        ...p,
        slug: s,
        category: p.category || existing.category || FALLBACK_CATEGORY,
      });
    }
  } catch (err) {
    console.warn(
      "[alternatives/[slug]] DB unreachable, using static data.",
      err,
    );
  }

  const allPlatforms = Array.from(platformMap.values());
  const targetPlatform = allPlatforms.find((p) => p.slug === slug);

  if (!targetPlatform) return null;

  const targetCategory = targetPlatform.category;

  // 1. Try to find alternatives in the same category
  let alternatives = allPlatforms.filter(
    (p) => p.id !== targetPlatform.id && p.category === targetCategory,
  );

  // 2. If there are less than 2 alternatives in this category, pull from the global pool instead.
  // This prevents pages like Cursor from only showing 1 alternative (Ghost).
  if (alternatives.length < 2) {
    alternatives = allPlatforms.filter((p) => p.id !== targetPlatform.id);
  }

  // Sort alternatives by Comparlify Scorecard
  alternatives.sort((a, b) => {
    const scoreA = calculatePlatformScore(a).overallScore;
    const scoreB = calculatePlatformScore(b).overallScore;
    return scoreB - scoreA;
  });

  return { targetPlatform, alternatives };
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getPlatformAndAlternatives(slug);
  if (!data) return {};

  const currentYear = new Date().getFullYear();
  const { targetPlatform } = data;

  return generateSeoMetadata({
    title: `Best ${targetPlatform.name} Alternatives ${currentYear}: Ranked & Compared`,
    description: `Looking for top alternatives to ${targetPlatform.name}? Compare scorecards, pricing models, feature matrix, and migration effort for 2026.`,
    path: `/alternatives/${slug}`,
  });
}

export async function generateStaticParams() {
  return staticPlatforms.map((p) => ({
    slug: toSlug(p.name),
  }));
}

export default async function AlternativeDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const data = await getPlatformAndAlternatives(slug);

  if (!data) notFound();

  const { targetPlatform, alternatives } = data;
  const targetScorecard = calculatePlatformScore(targetPlatform);

  const targetPros = Array.isArray(targetPlatform.pros)
    ? (targetPlatform.pros as string[])
    : [];
  const targetCons = Array.isArray(targetPlatform.cons)
    ? (targetPlatform.cons as string[])
    : [];

  const alternativesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${targetPlatform.name} Alternatives`,
    itemListElement: alternatives.map((alt: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: alt.name,
      url: `https://comparlify.com/platform/${alt.slug}`, // FIXED
    })),
  };

  return (
    <div className="bg-background min-h-screen pb-40">
      <SchemaScript schema={alternativesJsonLd} />

      {/* --- HERO --- */}
      <section className="relative pt-16 pb-12 overflow-hidden border-b border-border/20">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 uppercase tracking-widest text-[10px] font-black rounded-full mb-6">
            Programmatic Alternatives Engine
          </Badge>

          <div className="h-12 flex items-center justify-center mx-auto mb-6">
            {targetPlatform.logoUrl ? (
              <ManagedImage
                src={targetPlatform.logoUrl}
                alt={targetPlatform.name}
                width={160}
                height={50}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <span className="text-3xl font-black text-foreground">
                {targetPlatform.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
            Top {alternatives.length} Best{" "}
            <span className="text-primary">{targetPlatform.name}</span>{" "}
            Alternatives
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-2xl mx-auto mb-8">
            Comprehensive 2026 comparison of ranked alternatives based on
            transparent fee calculations, data sovereignty scores, and creator
            workflow fit.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-12 space-y-20">
        {/* TARGET PLATFORM SCORECARD SUMMARY */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <PlatformScorecardCard
              platform={targetPlatform as any}
              title={`${targetPlatform.name} Benchmark`}
            />
          </div>

          <div className="lg:col-span-7 bg-card/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Why Creators Consider
              Alternatives to {targetPlatform.name}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {targetPlatform.name} scored{" "}
              <strong className="text-foreground">
                {targetScorecard.overallScore}/100
              </strong>{" "}
              (Grade {targetScorecard.grade}) on our 5-pillar evaluation. While
              it performs well in native features, creators often explore
              alternatives due to pricing escalations, transaction fee burdens,
              or limited code/data sovereignty.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/20">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Who Should Stay
                </span>
                <ul className="space-y-2">
                  {targetPros.slice(0, 3).map((pro, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground font-medium flex items-start gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Who Should Switch
                </span>
                <ul className="space-y-2">
                  {targetCons.slice(0, 3).map((con, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground font-medium flex items-start gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* RANKED ALTERNATIVES LIST */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/20">
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full mb-2">
                Ranked Intelligence Matrix
              </Badge>
              <h2 className="text-3xl font-black text-foreground">
                Ranked Alternatives to {targetPlatform.name}
              </h2>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              Sorted by overall Comparlify score & architecture match
            </p>
          </div>

          <div className="space-y-8">
            {alternatives.map((altPlatform: any, index: number) => {
              const altScorecard = calculatePlatformScore(altPlatform);
              const altPros = Array.isArray(altPlatform.pros)
                ? (altPlatform.pros as string[])
                : [];
              const altLowestTier = altPlatform.tiers?.[0];
              const compSlug = `${toSlug(targetPlatform.name)}-vs-${toSlug(altPlatform.name)}`;

              return (
                <Card
                  key={altPlatform.id || altPlatform.slug}
                  className="bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl hover:border-border/80 transition-colors shadow-lg space-y-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/20">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black text-base shrink-0 border border-primary/20">
                        #{index + 1}
                      </div>
                      <div className="h-10 flex items-center min-w-0">
                        {altPlatform.logoUrl ? (
                          <ManagedImage
                            src={altPlatform.logoUrl}
                            alt={altPlatform.name}
                            width={140}
                            height={45}
                            className="h-10 w-auto object-contain"
                          />
                        ) : (
                          <span className="text-xl font-black text-foreground truncate">
                            {altPlatform.name}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-foreground">
                          {altPlatform.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-semibold">
                          Category: {altPlatform.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase text-muted-foreground">
                          Scorecard
                        </div>
                        <div className="text-xs font-extrabold text-primary">
                          Grade {altScorecard.grade}
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-xs">
                        {altScorecard.overallScore}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div>
                      <span className="font-extrabold text-foreground uppercase tracking-wider text-[10px] block mb-2">
                        Starting Price
                      </span>
                      <p className="text-lg font-black text-primary">
                        {altLowestTier
                          ? `$${altLowestTier.monthlyPrice}/mo`
                          : "Custom"}
                      </p>
                    </div>

                    <div>
                      <span className="font-extrabold text-foreground uppercase tracking-wider text-[10px] block mb-2">
                        Key Advantage vs {targetPlatform.name}
                      </span>
                      <p className="text-muted-foreground font-medium">
                        {altPros[0] ||
                          "Better customization & predictable pricing."}
                      </p>
                    </div>

                    <div>
                      <span className="font-extrabold text-foreground uppercase tracking-wider text-[10px] block mb-2">
                        Verdict
                      </span>
                      <p className="text-muted-foreground font-medium line-clamp-2">
                        {altScorecard.verdict}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/20">
                    <div className="flex gap-3">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold border-border/40 text-xs"
                      >
                        <Link href={`/platform/${altPlatform.slug}`}>
                          Full Review{" "}
                          <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </Button>

                      <Button
                        asChild
                        size="sm"
                        className="rounded-xl font-extrabold text-xs"
                      >
                        <Link href={`/${compSlug}`}>
                          {targetPlatform.name} vs {altPlatform.name}{" "}
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>

                    {altPlatform.website && (
                      <a
                        href={altPlatform.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        Visit Official Site{" "}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
