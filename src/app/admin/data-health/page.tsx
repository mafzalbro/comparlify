import React from "react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { calculatePlatformScore } from "@/lib/score-engine";
import { ShieldCheck, AlertTriangle, Clock, Database, CheckCircle2, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Comparlify Data Health & Intelligence Dashboard",
    description: "Internal command center auditing platform data completeness, verification freshness, confidence distribution, and evidence integrity.",
    path: "/admin/data-health",
  });
}

export default async function DataHealthAdminPage() {
  const platforms = await prisma.platform.findMany({
    include: {
      tiers: true,
      features: true,
    },
  });

  const totalPlatforms = platforms.length;
  let highConfidenceCount = 0;
  let moderateConfidenceCount = 0;
  let basicConfidenceCount = 0;

  let freshPricingCount = 0;
  let stalePricingCount = 0;

  const problemPlatforms: { name: string; slug: string; issue: string }[] = [];

  platforms.forEach((p: any) => {
    const scorecard = calculatePlatformScore(p);

    if (scorecard.confidence === "HIGH") highConfidenceCount++;
    else if (scorecard.confidence === "MODERATE") moderateConfidenceCount++;
    else basicConfidenceCount++;

    const lastVerifiedDate = p.lastVerifiedAt ? new Date(p.lastVerifiedAt) : new Date("2026-01-01");
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - lastVerifiedDate.getTime()) / (1000 * 3600 * 24));

    if (daysAgo <= 90) {
      freshPricingCount++;
    } else {
      stalePricingCount++;
      problemPlatforms.push({
        name: p.name,
        slug: p.name.toLowerCase().replace(/\s+/g, "-"),
        issue: `Verification date >90 days ago (${daysAgo} days old)`,
      });
    }

    if (!p.sourceUrl) {
      problemPlatforms.push({
        name: p.name,
        slug: p.name.toLowerCase().replace(/\s+/g, "-"),
        issue: "Missing official documentation source URL",
      });
    }
  });

  const completenessPercentage = totalPlatforms > 0
    ? Math.round(((highConfidenceCount * 1.0 + moderateConfidenceCount * 0.7 + basicConfidenceCount * 0.4) / totalPlatforms) * 100)
    : 100;

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* HERO */}
      <section className="relative pt-16 pb-12 overflow-hidden border-b border-border/20">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 uppercase tracking-widest text-[10px] font-black rounded-full mb-4">
            Internal Data Command Center
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
            Data Health & <span className="text-primary italic">Intelligence Dashboard</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl mx-auto">
            Real-time audit metrics for platform verification freshness, confidence distribution, and evidence completeness.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-12 space-y-12">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <span>Total Platforms</span>
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-black text-foreground">{totalPlatforms}</div>
            <div className="text-[11px] text-muted-foreground font-medium">Platforms tracked in database</div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <span>Dataset Health</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-500">{completenessPercentage}%</div>
            <div className="text-[11px] text-muted-foreground font-medium">Weighted completeness score</div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <span>Fresh Pricing (&lt;90d)</span>
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-blue-500">{freshPricingCount}</div>
            <div className="text-[11px] text-muted-foreground font-medium">{stalePricingCount} platforms pending re-audit</div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <span>HIGH Confidence</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-foreground">{highConfidenceCount}</div>
            <div className="text-[11px] text-muted-foreground font-medium">{moderateConfidenceCount} Moderate, {basicConfidenceCount} Basic</div>
          </Card>
        </div>

        {/* CONFIDENCE DISTRIBUTION */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl space-y-6">
          <h2 className="text-xl font-black text-foreground">Verification Confidence Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex justify-between text-xs font-extrabold text-emerald-500 uppercase">
                <span>HIGH Confidence</span>
                <span>{highConfidenceCount}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Pricing verified &lt;90d, high feature data density, and audited change logs.</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex justify-between text-xs font-extrabold text-amber-500 uppercase">
                <span>MODERATE Confidence</span>
                <span>{moderateConfidenceCount}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Standard pricing verified; partial evidence or older audit date.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-500/10 border border-zinc-500/20 space-y-2">
              <div className="flex justify-between text-xs font-extrabold text-zinc-400 uppercase">
                <span>BASIC Confidence</span>
                <span>{basicConfidenceCount}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Baseline platform metadata; requires full evidence audit.</p>
            </div>
          </div>
        </Card>

        {/* DATA AUDIT ISSUES */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-foreground">Data Re-Audit Queue ({problemPlatforms.length} Alerts)</h2>
          </div>

          {problemPlatforms.length === 0 ? (
            <p className="text-xs text-muted-foreground font-medium">All platform records pass 100% freshness and evidence verification standards.</p>
          ) : (
            <div className="space-y-3">
              {problemPlatforms.slice(0, 10).map((prob, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 rounded-2xl bg-secondary/20 border border-border/20 text-xs">
                  <div>
                    <span className="font-extrabold text-foreground">{prob.name}</span>
                    <span className="text-muted-foreground block text-[11px]">{prob.issue}</span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="rounded-xl text-[11px] font-bold">
                    <Link href={`/platform/${prob.slug}`}>Review Platform</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
