import { AdProfitPredictor } from "@/components/tools/ad-profit-predictor";
import { generateSeoMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { Target, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { MotionDiv } from "@/components/motion-wrapper";
import { Breadcrumbs } from "@/components/breadcrumb";

import { getUserProjects } from "@/app/actions/projects";

export const metadata: Metadata = await generateSeoMetadata({
  title: "Ad-Spend Profit Predictor | Comparlify",
  description: "Calculate the ROI of your course ads. Predict profit, break-even sales, and max CPC for scaling your online academy.",
  path: "/tools/ad-profit-predictor",
});

export default async function AdProfitPredictorPage() {
  const projects = await getUserProjects();
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container px-4 md:px-6 py-12">
        <Breadcrumbs 
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Ad Predictor" }
          ]}
          className="mb-8 pl-0"
        />
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <Target className="h-6 w-6" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
                  Ad-Spend <span className="text-primary not-italic uppercase">Predictor</span>
                </h1>
              </div>
              <p className="text-muted-foreground text-sm max-w-xl leading-relaxed font-medium">
                Scaling your course isn&apos;t a guessing game. Use the predictor to calculate 
                your profit margins and identify your non-negotiable ad KPIs before spending a single dollar.
              </p>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Module Intelligence</p>
              <p className="text-xs font-bold text-primary italic">Growth Modeling v2.1.0</p>
            </div>
          </div>
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AdProfitPredictor projects={projects} />
        </MotionDiv>
        
        <div className="mt-12 max-w-3xl mx-auto text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">The Engineering Moat</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-8">
                Most course creators fail at scaling because their **Checkout Conversion Rate** doesn&apos;t match their **Ad CTR**. 
                Professional platforms like Kajabi and Teachable provide specialized checkout builders and 1-click upsells 
                specifically designed to keep your ROAS (Return on Ad Spend) positive.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <Link 
                    href="/compare" 
                    className="px-6 py-3 rounded-2xl bg-secondary text-foreground font-black text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all"
                >
                    Review Funnel Capabilities
                </Link>
                <Link 
                    href="/tools/roi-calculator" 
                    className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    Run Fee Comparison
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
