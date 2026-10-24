import React from "react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculatePlatformScore } from "@/lib/score-engine";
import { ManagedImage } from "@/components/managed-image";
import Link from "next/link";
import { ArrowUpRight, Layers, ShieldCheck } from "lucide-react";
import { allPlatforms } from "@/data/compare/platforms";

export const revalidate = 3600;

const FALLBACK_CATEGORY = "Creator Tools & Software";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Best Platform Alternatives Directory 2026: Compare & Switch",
    description:
      "Programmatic platform alternatives engine. Discover the highest-rated alternatives to Teachable, Kajabi, Ghost, Beehiiv, Shopify, and 30+ top creator tools.",
    path: "/alternatives",
  });
}

type UnifiedPlatform = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  category: string;
  tiers?: Array<{ id?: string; monthlyPrice: number }>;
  [key: string]: any;
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Load platforms using static catalog as the authoritative baseline
 * (it contains the full scoring dataset), then overlay DB rows.
 * DB rows never remove static data — they only enrich/override it.
 */
async function loadPlatforms(): Promise<UnifiedPlatform[]> {
  const merged = new Map<string, UnifiedPlatform>();

  // 1) Static baseline — authoritative for scoring/features/logo/category
  for (const p of allPlatforms as any[]) {
    if (!p?.name) continue;
    const slug = p.slug || p.id || toSlug(p.name);
    merged.set(slug, {
      ...p,
      id: p.id || slug,
      slug,
      name: p.name,
      logoUrl: p.logoUrl || p.logo,
      category: p.category || FALLBACK_CATEGORY,
    });
  }

  // 2) DB overlay — adds/updates, never removes
  try {
    const dbPlatforms: any[] = await prisma.platform.findMany({
      include: {
        tiers: { orderBy: { monthlyPrice: "asc" } },
        features: { include: { feature: { include: { category: true } } } },
        changeLogs: { orderBy: { date: "desc" }, take: 5 },
      },
    });

    for (const p of dbPlatforms) {
      if (!p?.name) continue;
      const slug = toSlug(p.name);
      const existing = merged.get(slug);
      merged.set(slug, {
        ...existing,
        ...p,
        id: p.id || existing?.id || slug,
        slug,
        name: p.name,
        logoUrl: p.logoUrl || existing?.logoUrl,
        category: p.category || existing?.category || FALLBACK_CATEGORY,
        tiers: p.tiers?.length ? p.tiers : existing?.tiers,
      });
    }
  } catch (err) {
    console.warn(
      "[alternatives] DB unreachable — serving static platform catalog.",
      err,
    );
  }

  return Array.from(merged.values());
}

export default async function AlternativesIndexPage() {
  const platforms = await loadPlatforms();

  // Categorise
  const categoriesMap: Record<string, UnifiedPlatform[]> = {};
  for (const p of platforms) {
    const cat = p.category || FALLBACK_CATEGORY;
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(p);
  }

  // Sort each category by Comparlify score, descending
  for (const cat of Object.keys(categoriesMap)) {
    categoriesMap[cat].sort(
      (a, b) =>
        calculatePlatformScore(b as any).overallScore -
        calculatePlatformScore(a as any).overallScore,
    );
  }

  const sortedCategories = Object.entries(categoriesMap).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 overflow-hidden border-b border-border/20">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-black rounded-full mb-6">
            Programmatic Alternatives Engine
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
            Software{" "}
            <span className="text-primary italic">
              Alternatives Directory 2026
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto mb-8">
            Evaluate ranked alternatives based on 5-pillar Comparlify
            Scorecards, transparent fee breakdowns, and zero-lockin switching
            difficulty.
          </p>
        </div>
      </section>

      {/* CATEGORY DIRECTORY */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-16 space-y-20">
        {sortedCategories.length === 0 && (
          <div className="text-center py-20 text-muted-foreground font-medium">
            No platforms available yet. Check back soon.
          </div>
        )}

        {sortedCategories.map(([categoryName, catPlatforms]) => (
          <section key={categoryName} className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground">
                  {categoryName}
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Explore ranked alternatives and migration guides in{" "}
                  {categoryName.toLowerCase()}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catPlatforms.map((platform) => {
                const scorecard = calculatePlatformScore(platform as any);
                const alternativesCount = Math.max(0, catPlatforms.length - 1);

                return (
                  <Card
                    key={platform.id}
                    className="bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/80 transition-all p-6 rounded-3xl space-y-6 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="h-10 flex items-center min-w-0">
                          {platform.logoUrl ? (
                            <ManagedImage
                              src={platform.logoUrl}
                              alt={platform.name}
                              width={120}
                              height={40}
                              className="h-10 w-auto object-contain"
                            />
                          ) : (
                            <span className="text-lg font-black text-foreground truncate">
                              {platform.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl shrink-0">
                          <span className="text-xs font-black text-primary">
                            Score {scorecard.overallScore}
                          </span>
                          <span className="text-[10px] font-extrabold text-primary-foreground bg-primary px-1.5 py-0.5 rounded-md">
                            {scorecard.grade}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        Best {platform.name} Alternatives
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-medium">
                        Compare top {alternativesCount} alternatives to{" "}
                        {platform.name} with transparent fee models and
                        migration effort ratings.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{" "}
                        {alternativesCount} Alternatives
                      </span>
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="rounded-xl font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      >
                        <Link href={`/alternatives/${platform.slug}`}>
                          View Alternatives{" "}
                          <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
