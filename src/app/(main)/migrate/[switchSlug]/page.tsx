import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { SchemaScript } from "@/components/schema-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ManagedImage } from "@/components/managed-image";
import { calculateMigrationAnalysis } from "@/lib/migration-engine";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  ExternalLink,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { cache } from "react";

export const revalidate = 3600;

const getMigrationPlatforms = cache(async (switchSlug: string) => {
  // switchSlug format: "substack-to-ghost" or "teachable-to-kajabi"
  const parts = switchSlug.split("-to-");
  if (parts.length !== 2) return null;

  const [sourceSlug, targetSlug] = parts;

  const allPlatforms = await prisma.platform.findMany({
    include: {
      tiers: { orderBy: { monthlyPrice: "asc" } },
      currentReviews: {
        where: { status: "PUBLISHED" },
        take: 3,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const sourcePlatform = allPlatforms.find(
    (p: any) => p.name.toLowerCase().replace(/\s+/g, "-") === sourceSlug
  );

  const targetPlatform = allPlatforms.find(
    (p: any) => p.name.toLowerCase().replace(/\s+/g, "-") === targetSlug
  );

  if (!sourcePlatform || !targetPlatform) return null;

  return { sourcePlatform, targetPlatform };
});

export async function generateMetadata(props: {
  params: Promise<{ switchSlug: string }>;
}): Promise<Metadata> {
  const { switchSlug } = await props.params;
  const data = await getMigrationPlatforms(switchSlug);
  if (!data) return {};

  const currentYear = new Date().getFullYear();
  const { sourcePlatform, targetPlatform } = data;

  return generateSeoMetadata({
    title: `How to Migrate from ${sourcePlatform.name} to ${targetPlatform.name} (${currentYear} Guide)`,
    description: `Complete step-by-step playbook for switching from ${sourcePlatform.name} to ${targetPlatform.name}. Includes effort estimates, contractor costs, subscriber churn risk, and pre-migration audit checklist.`,
    path: `/migrate/${switchSlug}`,
  });
}

export async function generateStaticParams() {
  return [
    { switchSlug: "substack-to-ghost" },
    { switchSlug: "teachable-to-kajabi" },
    { switchSlug: "gumroad-to-lemonsqueezy" },
    { switchSlug: "kit-to-beehiiv" },
  ];
}

export default async function MigrationPlaybookPage(props: {
  params: Promise<{ switchSlug: string }>;
}) {
  const { switchSlug } = await props.params;
  const data = await getMigrationPlatforms(switchSlug);

  if (!data) notFound();

  const { sourcePlatform, targetPlatform } = data;
  const analysis = calculateMigrationAnalysis(sourcePlatform, targetPlatform);

  const playbookJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Migrate from ${sourcePlatform.name} to ${targetPlatform.name}`,
    description: `Step-by-step migration guide from ${sourcePlatform.name} to ${targetPlatform.name}.`,
    step: analysis.keySteps.map((step) => ({
      "@type": "HowToStep",
      position: step.stepNumber,
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <div className="bg-background min-h-screen pb-40">
      <SchemaScript schema={playbookJsonLd} />

      {/* --- HERO --- */}
      <section className="relative pt-16 pb-12 overflow-hidden border-b border-border/20">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-black rounded-full mb-6">
            Migration Playbook & Risk Analysis
          </Badge>

          <div className="flex items-center justify-center gap-6 mb-6">
            <ManagedImage src={sourcePlatform.logoUrl} alt={sourcePlatform.name} width={120} height={40} className="h-10 w-auto object-contain" />
            <ArrowRight className="w-6 h-6 text-primary" />
            <ManagedImage src={targetPlatform.logoUrl} alt={targetPlatform.name} width={120} height={40} className="h-10 w-auto object-contain" />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
            Migrating from <span className="text-muted-foreground">{sourcePlatform.name}</span> to <span className="text-primary">{targetPlatform.name}</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-2xl mx-auto mb-8">
            Complete technical playbook covering data exports, Stripe customer transfers, DNS re-pointing, and subscriber churn risk mitigation.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-12 space-y-16">
        {/* RISK & EFFORT SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <span>Estimated Work</span>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-black text-foreground">~{analysis.estimatedHours} hrs</div>
            <div className="text-[11px] text-muted-foreground font-medium">Estimated migration time</div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <span>Contractor Cost</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">{analysis.contractorCostRange}</div>
            <div className="text-[11px] text-muted-foreground font-medium">Optional freelancer cost</div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <span>Subscriber Churn Risk</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">{analysis.subscriberChurnRisk} Risk</div>
            <div className="text-[11px] text-muted-foreground font-medium">Payment token transfer risk</div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <span>Overall Risk Level</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-primary">{analysis.overallRisk}</div>
            <div className="text-[11px] text-muted-foreground font-medium">Combined migration difficulty</div>
          </Card>
        </div>

        {/* MIGRATION VECTORS MATRIX */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" /> Technical Migration Vectors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.vectors.map((vec, idx) => (
              <Card key={idx} className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-foreground text-base">{vec.category}</span>
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                    vec.complexity === "LOW" ? "border-emerald-500/30 text-emerald-500" :
                    vec.complexity === "MEDIUM" ? "border-amber-500/30 text-amber-500" :
                    "border-rose-500/30 text-rose-500"
                  }`}>
                    {vec.complexity} Risk
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{vec.description}</p>
                <div className="pt-2 border-t border-border/20 text-[11px] text-primary font-bold">
                  Mitigation: {vec.mitigation}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* WHAT MIGRATES VS WHAT DOES NOT */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl space-y-4">
            <span className="font-extrabold uppercase tracking-wider text-emerald-500 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> What Migrates Automatically
            </span>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              {analysis.whatMigrates.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl space-y-4">
            <span className="font-extrabold uppercase tracking-wider text-rose-500 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> What Must Be Re-built
            </span>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              {analysis.whatDoesNotMigrate.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* STEP-BY-STEP PLAYBOOK */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Step-by-Step Migration Execution
          </h2>

          <div className="space-y-4">
            {analysis.keySteps.map((step) => (
              <Card key={step.stepNumber} className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black text-lg shrink-0 border border-primary/20">
                  {step.stepNumber}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA TO COMPARE & ALTERNATIVES */}
        <div className="flex flex-wrap justify-center gap-4 pt-8">
          <Button asChild size="lg" className="rounded-full px-8 h-12 font-extrabold text-sm uppercase tracking-wider">
            <Link href={`/compare/${sourcePlatform.name.toLowerCase().replace(/\s+/g, "-")}-vs-${targetPlatform.name.toLowerCase().replace(/\s+/g, "-")}`}>
              Compare {sourcePlatform.name} vs {targetPlatform.name} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 font-extrabold text-sm uppercase tracking-wider border-border/40">
            <Link href={`/alternatives/${sourcePlatform.name.toLowerCase().replace(/\s+/g, "-")}`}>
              View All {sourcePlatform.name} Alternatives
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
