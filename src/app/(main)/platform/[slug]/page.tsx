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

export const revalidate = 3600; // ISR

const getPlatformBySlug = cache(async (slug: string) => {
  // Assuming name is used as slug for now, or we can add a slug field.
  // For the purpose of this task, let's look by name case-insensitive or similar.
  return prisma.platform.findFirst({
    where: { name: { equals: slug.replace(/-/g, " "),  } },
    include: {
      tiers: { orderBy: { monthlyPrice: "asc" } },
      features: { include: { feature: { include: { category: true } } } },
    },
  });
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
        <section className="relative pt-32 pb-24 overflow-hidden border-b border-border/10">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="flex gap-3 mb-12">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 uppercase tracking-[0.4em] text-[10px] font-black rounded-full shadow-sm">
                  Expert Platform Review
                </Badge>
                {platform.rating && platform.rating >= 4.5 && (
                   <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-6 py-2 uppercase tracking-[0.4em] text-[10px] font-black rounded-full shadow-sm">
                    <Trophy className="h-3 w-3 mr-2" /> Top Rated 2026
                  </Badge>
                )}
                {platform.easeOfUse && platform.easeOfUse >= 4.7 && (
                   <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-6 py-2 uppercase tracking-[0.4em] text-[10px] font-black rounded-full shadow-sm">
                    <Zap className="h-3 w-3 mr-2" /> Easiest to Use
                  </Badge>
                )}
              </div>
              <ManagedImage
                src={platform.logoUrl}
                alt={platform.name}
                width={240}
                height={80}
                className="h-20 w-auto object-contain mb-12"
              />
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter mb-8 leading-[0.9]">
                {platform.name} <br />
                <span className="text-primary italic">Intelligence Report.</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium mb-12 max-w-2xl">
                The comprehensive 2026 deep dive into architecture, monetization, and growth potential.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <Button asChild size="lg" className="rounded-full px-10 h-16 font-black uppercase tracking-widest gap-3">
                  <a href={platform.website} target="_blank" rel="noopener noreferrer">
                    Visit Website <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
                {platform.affiliateLink && (
                  <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-16 font-black uppercase tracking-widest border-2">
                    <a href={platform.affiliateLink} target="_blank" rel="noopener noreferrer">
                      Claim Discount <Sparkles className="h-5 w-5 text-primary" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Background Decor */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* --- SIDEBAR --- */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-40 space-y-12">
                {/* Stats Card */}
                <div className="bg-card/40 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-2xl">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Zap className="h-6 w-6 text-primary" /> Core Metrics
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: "Overall Rating", val: platform.rating },
                      { label: "Ease of Use", val: platform.easeOfUse },
                      { label: "Features", val: platform.featuresRating },
                      { label: "Support", val: platform.support },
                    ].map((s) => (
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
                        {platformPros.map((pro, i) => (
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
            <main className="lg:col-span-8 space-y-24">
              <section className="prose prose-invert prose-lg max-w-none">
                <MarkdownContent content={platform.description} />
              </section>

              {/* Tiers */}
              <section className="space-y-12">
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                  Pricing <span className="text-primary italic">Architecture.</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {platform.tiers.map((tier) => (
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
                        {(tier.features as string[] || []).map((f, i) => (
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
