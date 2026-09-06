import { prisma } from "@/lib/prisma";
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
  Globe,
  Star,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { ManagedImage } from "@/components/managed-image";
import { PlatformScorecardCard } from "@/components/platform-scorecard-card";
import { PlatformChangeTracker } from "@/components/platform-change-tracker";
import { PersonalizedMatchCard } from "@/components/personalized-match-card";
import { ReviewAcquisitionWidget } from "@/components/review-acquisition-widget";

export const revalidate = 3600; // ISR

const getPlatformBySlug = cache(async (slug: string) => {
  // Assuming name is used as slug for now, or we can add a slug field.
  // For the purpose of this task, let's look by name case-insensitive or similar.
  const platforms = await prisma.platform.findMany({
    include: {
      tiers: { orderBy: { monthlyPrice: "asc" } },
      features: { include: { feature: { include: { category: true } } } },
    },
  });

  return platforms.find(
    (p: any) => p.name.toLowerCase().replace(/\s+/g, "-") === slug
  );
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const platform = await getPlatformBySlug(slug);
  if (!platform) return {};

  return generateSeoMetadata({
    title: `${platform.name} Review 2026: Pricing, Features, and Expert Verdict`,
    description: platform.description.substring(0, 160),
    path: `/platform/${slug}`,
  });
}

export default async function PlatformDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const platform = await getPlatformBySlug(slug);

  if (!platform) notFound();

  const platformPros = Array.isArray(platform.pros) ? (platform.pros as string[]) : [];
  const platformCons = Array.isArray(platform.cons) ? (platform.cons as string[]) : [];

  return (
    <div className="bg-background min-h-screen">
      <article className="pb-40">
        {/* --- HERO --- */}
        <section className="relative pt-16 pb-12 overflow-hidden border-b border-border/20">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="flex gap-2 mb-6 flex-wrap justify-center">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 uppercase tracking-widest text-[10px] font-extrabold rounded-full shadow-xs">
                  Expert Platform Review
                </Badge>
                {platform.rating && platform.rating >= 4.5 && (
                   <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1 uppercase tracking-widest text-[10px] font-extrabold rounded-full shadow-xs">
                    <Trophy className="h-3 w-3 mr-1" /> Top Rated 2026
                  </Badge>
                )}
                {platform.easeOfUse && platform.easeOfUse >= 4.7 && (
                   <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-4 py-1 uppercase tracking-widest text-[10px] font-extrabold rounded-full shadow-xs">
                    <Zap className="h-3 w-3 mr-1" /> Easiest to Use
                  </Badge>
                )}
              </div>
              <ManagedImage
                src={platform.logoUrl}
                alt={platform.name}
                width={180}
                height={60}
                className="h-14 w-auto object-contain mb-6"
              />
              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
                {platform.name} <br />
                <span className="text-primary italic">Intelligence Report.</span>
              </h1>
              <p className="text-base text-muted-foreground font-medium mb-8 max-w-xl">
                The comprehensive 2026 deep dive into architecture, monetization, and growth potential.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="default" className="rounded-full px-6 h-11 font-extrabold uppercase tracking-widest gap-2">
                  <a href={platform.website} target="_blank" rel="noopener noreferrer">
                    Visit Website <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                {platform.affiliateLink && (
                  <Button asChild variant="outline" size="default" className="rounded-full px-6 h-11 font-extrabold uppercase tracking-widest border border-border/40">
                    <a href={platform.affiliateLink} target="_blank" rel="noopener noreferrer">
                      Claim Discount <Sparkles className="h-4 w-4 text-primary" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* --- SIDEBAR --- */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Stats Card */}
                <div className="bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors p-6 rounded-2xl shadow-md">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Zap className="h-6 w-6 text-primary" /> Core Metrics
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: "Overall Rating", val: platform.rating },
                      { label: "Ease of Use", val: platform.easeOfUse },
                      { label: "Features", val: platform.featuresRating },
                      { label: "Support", val: platform.support },
                    ].map((s: any) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                          <span>{s.label}</span>
                          <span className="text-primary">{s.val}/5.0</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(s.val ?? 0) * 20}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros/Cons Card */}
                <div className="bg-secondary/20 p-8 rounded-4xl border border-border/5">
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> The Strengths
                      </h4>
                      <ul className="space-y-4">
                        {platformPros.map((pro: any, i: number) => (
                          <li key={i} className="text-xs font-bold text-muted-foreground leading-relaxed">
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <AdPlacement placement="SIDEBAR" />
                <PremiumNewsletterForm />
              </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="lg:col-span-8 space-y-16">
              {/* Creator Intelligence Scorecard & Change Tracker */}
              <div className="space-y-12">
                <PlatformScorecardCard platform={platform} />
                <PersonalizedMatchCard platform={platform} />
                <PlatformChangeTracker
                  platformName={platform.name}
                  lastVerifiedAt={platform.lastVerifiedAt}
                  changeLogs={(platform as any).changeLogs || []}
                />
                <ReviewAcquisitionWidget
                  platformId={platform.id}
                  platformName={platform.name}
                />
              </div>

              <section className="prose prose-invert prose-lg max-w-none">
                <MarkdownContent content={platform.description} />
              </section>

              {/* Tiers */}
              <section className="space-y-12">
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                  Pricing <span className="text-primary italic">Architecture.</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {platform.tiers.map((tier: any) => (
                    <div key={tier.id} className={`p-8 rounded-3xl border ${tier.isPopular ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-card border-border/10'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-xl font-bold">{tier.name}</h4>
                        {tier.isPopular && <Badge>Most Popular</Badge>}
                      </div>
                      <div className="mb-8">
                        <span className="text-4xl font-black">${tier.monthlyPrice}</span>
                        <span className="text-muted-foreground font-bold ml-2">/mo</span>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {(tier.features as string[] || []).map((f: any, i: number) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <div className="bg-foreground text-background p-12 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h2 className="text-4xl font-black uppercase tracking-tighter relative z-10">
                  Ready to Build with {platform.name}?
                </h2>
                <p className="text-lg font-medium opacity-80 max-w-xl mx-auto relative z-10">
                  Start your journey today on the industry's leading infrastructure.
                </p>
                <div className="flex justify-center relative z-10">
                   <Button asChild size="lg" className="rounded-full px-12 h-20 text-lg font-black uppercase tracking-widest bg-background text-foreground hover:bg-primary hover:text-white transition-all">
                    <a href={platform.website} target="_blank" rel="noopener noreferrer">
                      Get Started Now <ArrowRight className="h-6 w-6" />
                    </a>
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </article>
    </div>
  );
}
