import { ChurnForecaster } from "@/components/tools/churn-forecaster";
import { generateSeoMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { Repeat, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { MotionDiv } from "@/components/motion-wrapper";
import { Breadcrumbs } from "@/components/breadcrumb";

import { getUserProjects } from "@/app/actions/projects";

export const metadata: Metadata = await generateSeoMetadata({
  title: "Churn-to-Cash Forecaster | Comparlify",
  description: "Visualize the compounding financial impact of student churn and discover how much revenue you can recover with better retention strategies.",
  path: "/tools/churn-forecaster",
});

export default async function ChurnForecasterPage() {
  const projects = await getUserProjects();
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container px-4 md:px-6 py-12">
        <Breadcrumbs 
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Churn Forecaster" }
          ]}
          className="mb-8 pl-0"
        />
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <Repeat className="h-6 w-6" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
                  Churn-to-<span className="text-primary not-italic uppercase">Cash</span>
                </h1>
              </div>
              <p className="text-muted-foreground text-sm max-w-xl leading-relaxed font-medium">
                Every percentage of churn is a compounded leak in your business infrastructure. 
                Use this forecaster to see the 12-month impact and the recovery potential.
              </p>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Module Intelligence</p>
              <p className="text-xs font-bold text-primary italic">Financial Forecasting v1.0.4</p>
            </div>
          </div>
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ChurnForecaster projects={projects} />
        </MotionDiv>
        
        <div className="mt-12 max-w-3xl mx-auto text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Why this matters</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-8">
                LMS platforms like Kajabi or Skool are often chosen based on price alone, but the real cost is measured in **student retention**. 
                Systems with better native engagement tools (mobile notifications, gamification, community) can reduce churn by 2-5%, 
                often paying for the entire platform cost multiple times over.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <Link 
                    href="/compare" 
                    className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    Compare Retention Features
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
