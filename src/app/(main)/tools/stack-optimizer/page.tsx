import { StackOptimizer } from "@/components/tools/stack-optimizer";
import prisma from "@/lib/prisma";
import { generateSeoMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { Zap, ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { MotionDiv } from "@/components/motion-wrapper";
import { Breadcrumbs } from "@/components/breadcrumb";

export const metadata: Metadata = await generateSeoMetadata({
  title: "Subscription Audit & Optimizer | Comparlify",
  description: "Identify redundant software subscriptions in your creator tech stack. Save money by detecting overlapping features.",
  path: "/tools/stack-optimizer",
});

async function getPlatforms() {
  return await prisma.platform.findMany({
    include: { tiers: { orderBy: { monthlyPrice: "asc" } }, features: { include: { feature: true } } },
    orderBy: { name: "asc" },
  });
}

export default async function StackOptimizerPage() {
  const platforms = await getPlatforms();
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container px-4 md:px-6 py-12">
        <Breadcrumbs 
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Stack Optimizer" }
          ]}
          className="mb-8 pl-0"
        />
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <Zap className="h-6 w-6" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
                  Subscription <span className="text-primary not-italic uppercase">Audit</span>
                </h1>
              </div>
              <p className="text-muted-foreground text-sm max-w-xl leading-relaxed font-medium">
                Most creators pay for the same features 3 times across different tools. 
                Our optimizer identifies these overlaps and shows you exactly which subscriptions to trim.
              </p>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Module Intelligence</p>
              <p className="text-xs font-bold text-primary italic">Stack Efficiency v3.4.1</p>
            </div>
          </div>
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StackOptimizer platforms={platforms} />
        </MotionDiv>
        
        <div className="mt-12 max-w-3xl mx-auto text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Our Methodology</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-8">
                In the 2025 creator economy, **Consolidation** is the highest-leverage business move. 
                Platform giants like Kajabi are moving toward &quot;All-in-One&quot; dominance, which means 
                third-party point solutions (like standalone email or checkout pages) are often redundant monthly expenses.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <Link 
                    href="/community/verified-stacks" 
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-foreground font-black text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all border border-border/10"
                >
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> View Lean Verified Stacks
                </Link>
                <Link 
                    href="/tools/roi-calculator" 
                    className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    Calculate Switching ROI
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
