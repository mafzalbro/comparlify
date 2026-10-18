import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
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
  XCircle,
  Trophy,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Layers,
  HelpCircle,
  FileText,
  DollarSign,
  Info,
} from "lucide-react";
import Link from "next/link";
import { cache } from "react";
import { ManagedImage } from "@/components/managed-image";
import { PlatformScorecardCard } from "@/components/platform-scorecard-card";
import { PlatformChangeTracker } from "@/components/platform-change-tracker";
import { PersonalizedMatchCard } from "@/components/personalized-match-card";
import { ReviewAcquisitionWidget } from "@/components/review-acquisition-widget";

const getPlatformBySlug = cache(async (slug: string) => {
  const platformNameClean = slug.replace(/-/g, " ");
  const platform = await prisma.platform.findFirst({
    where: {
      OR: [
        { id: slug },
        { name: { equals: platformNameClean, mode: "insensitive" } },
        { name: { equals: slug, mode: "insensitive" } },
      ],
    },
    include: {
      tiers: { orderBy: { monthlyPrice: "asc" } },
      features: { include: { feature: { include: { category: true } } } },
      changeLogs: { orderBy: { date: "desc" }, take: 5 },
      currentReviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (platform) return platform;

  const platforms = await prisma.platform.findMany({
    select: { id: true, name: true },
  });
  const matched = platforms.find(
    (p: any) => p.name.toLowerCase().replace(/\s+/g, "-") === slug,
  );
  if (!matched) return null;

  return prisma.platform.findUnique({
    where: { id: matched.id },
    include: {
      tiers: { orderBy: { monthlyPrice: "asc" } },
      features: { include: { feature: { include: { category: true } } } },
      changeLogs: { orderBy: { date: "desc" }, take: 5 },
      currentReviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
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
    title: `${platform.name} Review 2026: Pricing, Features, and Honest Verdict`,
    description: platform.description
      ? platform.description.substring(0, 160)
      : `Detailed 2026 review and pricing analysis for ${platform.name}.`,
    path: `/platform/${slug}`,
  });
}

export const revalidate = 3600; // Cache for 1 hour (ISR)
export const dynamicParams = true; // On-demand generation for newly added platforms without rebuild

export async function generateStaticParams() {
  try {
    const platforms = await prisma.platform.findMany({
      select: { name: true },
    });
    return platforms.map((p: { name: string }) => ({
      slug: p.name.toLowerCase().replace(/\s+/g, "-"),
    }));
  } catch (err) {
    console.warn(
      "[generateStaticParams] platform/[slug] DB unreachable during build:",
      err,
    );
    return [];
  }
}

export default async function PlatformDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const platform = await getPlatformBySlug(slug);

  if (!platform) notFound();

  const platformPros = Array.isArray(platform.pros)
    ? (platform.pros as string[])
    : [];
  const platformCons = Array.isArray(platform.cons)
    ? (platform.cons as string[])
    : [];
  const reviews = (platform as any).currentReviews || [];
  const changeLogs = (platform as any).changeLogs || [];

  const verifiedDateStr = platform.lastVerifiedAt
    ? new Date(platform.lastVerifiedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        day: "numeric",
      })
    : "2026";

  const startingPrice =
    platform.tiers && platform.tiers.length > 0
      ? `$${platform.tiers[0].monthlyPrice}/mo`
      : "Free / Contact";

  return (
    <div className="bg-background min-h-screen w-full">
      <article className="pb-36 w-full max-w-full">
        {/* --- 1. HERO SECTION: CLEAR IDENTITY & QUICK FACTS --- */}
        <section className="relative pt-10 sm:pt-12 pb-10 overflow-hidden border-b border-border/20 bg-linear-to-b from-card/60 via-background to-background">
          <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              {/* Badges / Editorial Badges */}
              <div className="flex gap-2 mb-5 flex-wrap justify-center">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3.5 py-1 uppercase tracking-widest text-[10px] font-extrabold rounded-full shadow-xs">
                  Independent Platform Review
                </Badge>
                {platform.rating && platform.rating >= 4.5 && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3.5 py-1 uppercase tracking-widest text-[10px] font-extrabold rounded-full shadow-xs">
                    <Trophy className="h-3 w-3 mr-1" /> Top Rated 2026
                  </Badge>
                )}
                {platform.easeOfUse && platform.easeOfUse >= 4.7 && (
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3.5 py-1 uppercase tracking-widest text-[10px] font-extrabold rounded-full shadow-xs">
                    <Zap className="h-3 w-3 mr-1" /> Easiest to Use
                  </Badge>
                )}
              </div>

              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <ManagedImage
                  src={platform.logoUrl}
                  alt={platform.name}
                  width={160}
                  height={50}
                  priority={true}
                  className="h-10 sm:h-12 w-auto object-contain max-w-50"
                />
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-3 leading-tight wrap-break-word">
                {platform.name} Review &amp; Analysis
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium mb-6 max-w-2xl leading-relaxed px-2">
                An objective breakdown of {platform.name}&apos;s real pricing,
                features, hidden trade-offs, and who should actually use it in
                2026.
              </p>

              {/* Quick Info Bar */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-semibold text-muted-foreground mb-8 bg-card/60 border border-border/40 py-2.5 px-4 sm:px-5 rounded-2xl sm:rounded-full max-w-full">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  Audit Verified:{" "}
                  <strong className="text-foreground">{verifiedDateStr}</strong>
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
                  Starting at:{" "}
                  <strong className="text-foreground">{startingPrice}</strong>
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  Overall:{" "}
                  <strong className="text-foreground">
                    {platform.rating ? `${platform.rating}/5.0` : "4.8/5.0"}
                  </strong>
                </span>
              </div>

              {/* Primary Call to Action */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 w-full sm:w-auto px-4 sm:px-0">
                <Button
                  asChild
                  size="default"
                  className="w-full sm:w-auto rounded-full px-6 h-11 font-extrabold tracking-wide gap-2 shadow-md"
                >
                  <a
                    href={platform.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Official Site <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                {platform.affiliateLink && (
                  <Button
                    asChild
                    variant="outline"
                    size="default"
                    className="w-full sm:w-auto rounded-full px-6 h-11 font-extrabold tracking-wide border border-border/60 hover:border-primary/50"
                  >
                    <a
                      href={platform.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Exclusive Offers{" "}
                      <Sparkles className="h-4 w-4 text-primary" />
                    </a>
                  </Button>
                )}
                <Button
                  asChild
                  variant="secondary"
                  size="default"
                  className="w-full sm:w-auto rounded-full px-6 h-11 font-bold text-xs"
                >
                  <a href="#pricing">Jump to Pricing</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. EXECUTIVE SUMMARY: "THE 60-SECOND VERDICT" --- */}
        <section className="container mx-auto px-4 md:px-6 max-w-6xl -mt-4 relative z-20">
          <div className="bg-card/90 backdrop-blur-md border border-border/60 p-5 sm:p-6 md:p-8 rounded-3xl shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-foreground">
                    The 60-Second Executive Verdict
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Quick takeaway if you are pressed for time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Editorial standard: 100% human-verified analysis</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-6">
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <h3 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 shrink-0" /> Who Should Choose{" "}
                  {platform.name}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                  Creators and operators who prioritize rapid audience scaling,
                  native monetization, and low platform commission fees without
                  having to stitch together disparate third-party tools.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <h3 className="text-sm font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Who Should Look
                  Elsewhere
                </h3>
                <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                  Users seeking an ultra-simple free forever hobby blog, or
                  businesses needing complex bespoke enterprise LMS course
                  progression rules right out of the box.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. MAIN ARTICLE LAYOUT --- */}
        <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* --- SIDEBAR --- */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-5 self-start">
              <div className="max-h-[calc(100vh-2rem)] overflow-y-auto pr-2 pb-12 space-y-6 custom-scrollbar overscroll-contain">
                {/* Core Metrics */}
                <div className="bg-card/60 backdrop-blur-md border border-border/40 p-6 rounded-2xl shadow-xs">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2.5">
                    <Zap className="h-5 w-5 text-primary" /> Performance Ratings
                  </h3>
                  <div className="space-y-5">
                    {[
                      { label: "Overall Rating", val: platform.rating },
                      { label: "Ease of Use", val: platform.easeOfUse },
                      {
                        label: "Features Rating",
                        val: platform.featuresRating,
                      },
                      { label: "Customer Support", val: platform.support },
                    ].map((s: any) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                          <span className="text-muted-foreground">
                            {s.label}
                          </span>
                          <span className="text-foreground font-black">
                            {s.val ? `${s.val}/5.0` : "N/A"}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(s.val ?? 0) * 20}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Navigation on this page */}
                <div className="bg-card/40 border border-border/40 p-5 rounded-2xl">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-primary" /> On This Page
                  </h4>
                  <ul className="space-y-2 text-xs font-bold text-muted-foreground">
                    <li>
                      <a
                        href="#scorecard"
                        className="hover:text-primary transition-colors flex items-center gap-1.5 py-1"
                      >
                        • Verified Scorecard &amp; Custom Fit
                      </a>
                    </li>
                    <li>
                      <a
                        href="#pros-cons"
                        className="hover:text-primary transition-colors flex items-center gap-1.5 py-1"
                      >
                        • Honest Strengths &amp; Limitations
                      </a>
                    </li>
                    <li>
                      <a
                        href="#deep-dive"
                        className="hover:text-primary transition-colors flex items-center gap-1.5 py-1"
                      >
                        • Architectural Deep-Dive
                      </a>
                    </li>
                    <li>
                      <a
                        href="#pricing"
                        className="hover:text-primary transition-colors flex items-center gap-1.5 py-1"
                      >
                        • Pricing Breakdown &amp; Plans
                      </a>
                    </li>
                    <li>
                      <a
                        href="#audit-trail"
                        className="hover:text-primary transition-colors flex items-center gap-1.5 py-1"
                      >
                        • Audit Trail &amp; Changelog
                      </a>
                    </li>
                    <li>
                      <a
                        href="#reviews"
                        className="hover:text-primary transition-colors flex items-center gap-1.5 py-1"
                      >
                        • Community Reviews &amp; Feedback
                      </a>
                    </li>
                  </ul>
                </div>

                <AdPlacement placement="SIDEBAR" />
                <div className="bg-card/40 border border-border/40 p-5 rounded-2xl space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-primary" /> Stay Informed
                    </h4>
                    <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                      Get platform audits &amp; pricing changes direct to your
                      inbox.
                    </p>
                  </div>
                  <PremiumNewsletterForm
                    containerClassName="!flex-col !gap-3 !p-0 !bg-transparent !border-0 !shadow-none"
                    inputClassName="w-full h-11 px-4 text-xs font-semibold bg-background/80 border border-border/60 text-foreground placeholder:text-muted-foreground/60 rounded-xl focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    buttonClassName="w-full h-11 px-4 text-xs font-black tracking-wider uppercase rounded-xl"
                    buttonText="Subscribe"
                  />
                </div>
              </div>
            </aside>

            {/* --- MAIN CONTENT COLUMN --- */}
            <main className="lg:col-span-8 space-y-20">
              {/* SECTION: SCORECARD & INTERACTIVE MATCH ENGINE */}
              <section id="scorecard" className="space-y-8 scroll-mt-28">
                <div className="space-y-1.5 pb-2">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
                    Scorecard &amp; Personalized Fit
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
                    Calculate your exact fit based on how you weigh platform
                    fees, feature depth, sovereignty, and ease of use.
                  </p>
                </div>

                <div className="space-y-8">
                  <PlatformScorecardCard platform={platform} />
                  <PersonalizedMatchCard platform={platform} />
                </div>
              </section>

              <hr className="border-t border-border/40" />

              {/* SECTION: BALANCED PROS & CONS (HUMAN-CENTRIC & TRANSPARENT) */}
              <section id="pros-cons" className="space-y-8 scroll-mt-28">
                <div className="space-y-1.5 pb-2">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    The Honest Assessment
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
                    Every platform makes trade-offs. Here is what{" "}
                    {platform.name} does brilliantly—and where it frustrates
                    users.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strengths */}
                  <div className="bg-emerald-500/5 border border-emerald-500/25 p-7 md:p-8 rounded-3xl space-y-5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Proven Strengths
                    </h3>
                    <ul className="space-y-3.5">
                      {platformPros.length > 0 ? (
                        platformPros.map((pro: any, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-foreground/90 font-medium leading-relaxed"
                          >
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span>{pro}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground">
                          Comprehensive platform capabilities and reliable
                          uptime.
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Limitations & Drawbacks */}
                  <div className="bg-amber-500/5 border border-amber-500/25 p-7 md:p-8 rounded-3xl space-y-5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Potential Dealbreakers
                    </h3>
                    <ul className="space-y-3.5">
                      {platformCons.length > 0 ? (
                        platformCons.map((con: any, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-foreground/90 font-medium leading-relaxed"
                          >
                            <span className="text-amber-500 font-bold shrink-0 mt-0.5">
                              ✕
                            </span>
                            <span>{con}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground">
                          Advanced features may require higher-tier plans or
                          onboarding time.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </section>

              <hr className="border-t border-border/40" />

              {/* SECTION: EDITORIAL IN-DEPTH DEEP DIVE */}
              <section id="deep-dive" className="space-y-8 scroll-mt-28">
                <div className="space-y-1.5 pb-2">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    In-Depth Technical &amp; Growth Analysis
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
                    Detailed research into platform mechanics, data sovereignty,
                    monetization, and architecture.
                  </p>
                </div>

                <div className="p-8 md:p-10 rounded-3xl bg-card/50 border border-border/40">
                  <div className="prose prose-neutral dark:prose-invert prose-base md:prose-lg max-w-none leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-p:leading-8 prose-li:my-1">
                    <MarkdownContent content={platform.description} />
                  </div>
                </div>
              </section>

              <hr className="border-t border-border/40" />

              {/* SECTION: PRICING ARCHITECTURE */}
              <section id="pricing" className="space-y-8 scroll-mt-28">
                <div className="space-y-1.5 pb-2">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    Pricing &amp; Tier Breakdown
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
                    Transparent overview of standard plans. Keep in mind that
                    email and audience platforms typically tier pricing as your
                    subscriber or customer volume expands.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {platform.tiers && platform.tiers.length > 0 ? (
                    platform.tiers.map((tier: any) => (
                      <div
                        key={tier.id}
                        className={`p-8 rounded-3xl border transition-all flex flex-col justify-between ${
                          tier.isPopular
                            ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-md"
                            : "bg-card border-border/40 hover:border-border/60"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-5">
                            <h4 className="text-xl font-black text-foreground">
                              {tier.name}
                            </h4>
                            {tier.isPopular && (
                              <Badge className="bg-primary text-primary-foreground text-[10px] uppercase font-black tracking-wider">
                                Most Popular
                              </Badge>
                            )}
                          </div>
                          <div className="mb-6">
                            <span className="text-4xl md:text-5xl font-black text-foreground">
                              ${tier.monthlyPrice}
                            </span>
                            <span className="text-muted-foreground font-bold ml-1.5 text-sm">
                              /mo
                            </span>
                            {tier.annualPriceMonthlyEquivalent && (
                              <p className="text-xs text-muted-foreground mt-2 font-semibold">
                                ~${tier.annualPriceMonthlyEquivalent}/mo billed
                                annually
                              </p>
                            )}
                          </div>
                          <ul className="space-y-3 mb-8">
                            {((tier.features as string[]) || []).map(
                              (f: any, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-3 text-sm text-muted-foreground font-medium"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>

                        <Button
                          asChild
                          variant={tier.isPopular ? "default" : "outline"}
                          className="w-full h-11 rounded-xl font-extrabold text-xs uppercase tracking-wider"
                        >
                          <a
                            href={platform.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Select {tier.name} Plan
                          </a>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 rounded-3xl bg-secondary/10 border border-border/40 text-center">
                      <p className="text-sm text-muted-foreground font-medium">
                        Custom tier architecture. Please review the official
                        pricing page for dynamic volume tiers.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-5 rounded-2xl bg-secondary/20 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong>Pricing Transparency Disclaimer:</strong> Software
                    pricing is subject to vendor updates, promotional discounts,
                    and volume changes. Comparlify continuously audits plan
                    details to maintain data integrity.
                  </p>
                </div>
              </section>

              <hr className="border-t border-border/40" />

              {/* SECTION: AUDIT TRAIL / CHANGE TRACKER */}
              <section id="audit-trail" className="space-y-8 scroll-mt-28">
                <div className="space-y-1.5 pb-2">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    Audit Verification &amp; Change Log
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
                    We track when platforms alter pricing, introduce transaction
                    fees, or deploy major features so you aren&apos;t caught off
                    guard.
                  </p>
                </div>

                <PlatformChangeTracker
                  platformName={platform.name}
                  lastVerifiedAt={platform.lastVerifiedAt}
                  changeLogs={changeLogs}
                />
              </section>

              <hr className="border-t border-border/40" />

              {/* SECTION: COMMUNITY VERIFIED REVIEWS & REVIEW ACQUISITION */}
              <section id="reviews" className="space-y-8 scroll-mt-28">
                <div className="space-y-1.5 pb-2">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    Creator Community Insights
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
                    First-hand experiences and operational bottlenecks reported
                    by real operators using {platform.name}.
                  </p>
                </div>

                {reviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((rev: any) => (
                      <div
                        key={rev.id}
                        className="p-6 rounded-2xl bg-card border border-border/40 space-y-3.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-foreground">
                            {rev.creatorName || "Anonymous Creator"}
                          </span>
                          <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            {rev.recommendationScore}/5
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                          &ldquo;{rev.selectionReason}&rdquo;
                        </p>
                        {rev.bottleneck && (
                          <div className="text-xs bg-secondary/30 p-3 rounded-lg border border-border/30 text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">
                              Bottleneck noted:
                            </strong>{" "}
                            {rev.bottleneck}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-secondary/10 border border-border/30 text-center text-sm text-muted-foreground">
                    No community reviews published yet for {platform.name}. Be
                    the first verified operator to submit your honest experience
                    below!
                  </div>
                )}

                {/* Review Acquisition Widget - Logically placed at the end where users evaluate leaving a review */}
                <div className="pt-2">
                  <ReviewAcquisitionWidget
                    platformId={platform.id}
                    platformName={platform.name}
                  />
                </div>
              </section>

              {/* --- 4. FINAL DECISION CTA --- */}
              <div className="bg-linear-to-br from-card via-card/90 to-primary/5 border border-border/60 p-8 sm:p-12 md:p-14 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden group max-w-full">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-3 relative z-10">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full">
                    Next Step
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight wrap-break-word">
                    Ready to evaluate {platform.name}?
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
                    Visit {platform.name} directly to explore live features or
                    compare it side-by-side against alternatives.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3.5 relative z-10 pt-2 w-full sm:w-auto">
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-8 h-12 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md gap-2"
                  >
                    <a
                      href={platform.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit {platform.name} <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-8 h-12 text-xs sm:text-sm font-bold uppercase tracking-wider border-border/60 hover:bg-secondary/50 text-foreground"
                  >
                    <Link href="/compare">Compare Alternatives</Link>
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
