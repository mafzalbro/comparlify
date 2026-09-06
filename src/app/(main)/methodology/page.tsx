import React from "react";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Sparkles, Scale, Database, Zap, Layers, Lock, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "How Comparlify Scores Platforms: 5-Pillar Methodology",
    description: "Discover how Comparlify calculates 0-100 platform scores, grade levels (S, A+, A), and creator fit ratings using transparent 5-pillar mathematical weighting.",
    path: "/methodology",
  });
}

export default function MethodologyPage() {
  const pillars = [
    {
      name: "Core Features & Depth",
      weight: "30%",
      icon: Layers,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      description: "Evaluates native functionality, workflow automation capabilities, email deliverability, video hosting, and system uptime reliability."
    },
    {
      name: "Value & Margin ROI",
      weight: "25%",
      icon: Scale,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Measures pricing predictability, transaction fees, tier limits, and true net revenue retained per 10,000 subscribers."
    },
    {
      name: "Data & Code Sovereignty",
      weight: "15%",
      icon: Lock,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      description: "Assesses database exportability (CSV/JSON), self-hosting support, custom code/CSS freedom, and exit lock-in risk."
    },
    {
      name: "Ease of Use & UX",
      weight: "15%",
      icon: Zap,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Audits editor response speed, dashboard UX elegance, onboarding friction, and reader-facing interface quality."
    },
    {
      name: "Ecosystem & Integrations",
      weight: "15%",
      icon: Database,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      description: "Tests REST API depth, Zapier/Make webhooks, app marketplace maturity, and third-party developer extensibility."
    }
  ];

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* HERO */}
      <section className="relative pt-20 pb-16 overflow-hidden border-b border-border/20">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-black rounded-full mb-6">
            Transparent Audit Standards
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
            How Comparlify <span className="text-primary italic">Scores Platforms</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto mb-8">
            We don't publish arbitrary star ratings. Every score is derived from a 5-pillar mathematical weighting model backed by real-world pricing simulations and data sovereignty audits.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-16 space-y-20">
        {/* FORMULA HIGHLIGHT */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/40 p-8 md:p-12 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-foreground">The 5-Pillar Score Formula</h2>
          </div>
          <div className="p-6 rounded-2xl bg-secondary/30 border border-border/30 font-mono text-xs md:text-sm text-foreground overflow-x-auto leading-relaxed">
            Overall Score (0-100) = [<br />
            &nbsp;&nbsp;(Features × 0.30) +<br />
            &nbsp;&nbsp;(Value × 0.25) +<br />
            &nbsp;&nbsp;(Sovereignty × 0.15) +<br />
            &nbsp;&nbsp;(UX × 0.15) +<br />
            &nbsp;&nbsp;(Integrations × 0.15)<br />
            ] × 20
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
            All individual pillar scores are evaluated on a 0.0 to 5.0 scale using empirical verification metrics. The final weighted sum is scaled to 100 for intuitive decision-making.
          </p>
        </Card>

        {/* 5 PILLARS BREAKDOWN */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-foreground">The 5 Evaluation Pillars</h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Every platform in our database is independently audited across these five criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => {
              const IconComp = p.icon;
              return (
                <Card key={p.name} className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className={`p-3 rounded-2xl border ${p.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="font-mono font-bold text-xs border-border/40">
                      Weight: {p.weight}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {p.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* GRADE SCALE */}
        <section className="bg-card/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl space-y-8">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> Grade Classification Standard
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { grade: "S", range: "95 – 100", label: "Industry Standard", color: "bg-primary text-primary-foreground" },
              { grade: "A+", range: "90 – 94", label: "Tier-1 Enterprise", color: "bg-emerald-500 text-white" },
              { grade: "A", range: "84 – 89", label: "High Performance", color: "bg-blue-500 text-white" },
              { grade: "B+", range: "78 – 83", label: "Solid Baseline", color: "bg-amber-500 text-white" },
              { grade: "B", range: "70 – 77", label: "Standard Workload", color: "bg-zinc-500 text-white" },
            ].map((g) => (
              <div key={g.grade} className="p-4 rounded-2xl bg-secondary/20 border border-border/20 text-center space-y-2">
                <div className={`w-10 h-10 mx-auto rounded-xl font-black text-xl flex items-center justify-center ${g.color}`}>
                  {g.grade}
                </div>
                <div className="text-xs font-mono font-extrabold text-foreground">{g.range}</div>
                <div className="text-[10px] font-bold text-muted-foreground">{g.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8">
          <Button asChild size="lg" className="rounded-full px-8 h-12 font-extrabold text-sm uppercase tracking-wider">
            <Link href="/alternatives">
              Explore Rated Platforms <CheckCircle2 className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
