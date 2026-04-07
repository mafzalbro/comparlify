import React, { Suspense } from "react";
import { generateSeoMetadata } from "@/lib/seo";
import { CourseRevenueCalculator } from "./_components/course-revenue-calculator";
import { MotionDiv } from "@/components/motion-wrapper";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Calculator, Sparkles, Loader2, Coins, TrendingUp } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Course Revenue Calculator | Comparlify",
    description:
      "Calculate your potential course revenue, platform fees, and net profit instantly. Compare Teachable vs Kajabi fees and maximize your creator earnings.",
    path: "/tools/course-revenue-calculator",
  });
}

export default function CourseRevenueCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: "Course Revenue Calculator" },
        ]}
        className="mb-8 pl-4 md:pl-0"
      />
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-8">
          <Coins className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Revenue Forecaster
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Course <span className="text-primary italic">Revenue Engine</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Plan your launch with precision. Calculate exactly how much you'll take home after platform fees and discover the most profitable pricing strategy for your expertise.
        </p>
      </MotionDiv>

      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CourseRevenueCalculator />
      </Suspense>

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-20 pt-20 border-t border-border/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              Scale Your <span className="text-primary italic">Knowledge Business</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Revenue is vanity, profit is sanity. Understanding the impact of platform fees on your bottom line is the difference between a project and a sustainable business. Every percentage point saved is an investment back into your content.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/10">
              <TrendingUp className="h-6 w-6 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest leading-normal">
                Optimize your margins by choosing the right platform for your scale.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 relative group">
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                Growth Strategy
              </h3>
              <p className="text-sm text-muted-foreground italic">
                "High-volume creators should prioritize flat-fee platforms. Transaction fees are scalable costs that can eventually exceed the cost of premium monthly subscriptions by 10x."
              </p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
