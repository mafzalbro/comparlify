import React from "react";
import { generateSeoMetadata } from "@/lib/seo";
import { PricingCalculator } from "@/components/tools/pricing-calculator";
import { Breadcrumbs } from "@/components/breadcrumb";
import { MotionDiv } from "@/components/motion-wrapper";
import { Calculator, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Platform Pricing Calculator | Comparlify",
    description: "Compare the total cost of Teachable, Kajabi, Podia, and more. See your real net profit after transaction and gateway fees.",
    path: "/tools/pricing-calculator",
  });
}

export default function PricingCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: "Pricing Calculator" },
        ]}
        className="mb-8 pl-4 md:pl-0"
      />
      
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
          <Calculator className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Financial Intelligence
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Platform <span className="text-primary italic">Pricing</span> Calculator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Calculate your true take-home pay by factoring in both platform subscriptions and hidden transaction fees.
        </p>
      </MotionDiv>

      <PricingCalculator />

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-24 pt-24 border-t border-border/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
               <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight italic">Net Profit Clarity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Most platforms hide fees in the fine print. We calculate your actual take-home pay after Stripe and platform transaction fees.</p>
          </div>

          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
               <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight italic">Live Verified Math</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Our calculator uses real-time platform rates and standard Stripe processing fees (2.9% + $0.30 per transaction).</p>
          </div>

          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
               <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight italic">Switch & Save Hook</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Discover how much you're "bleeding" each year by sticking with an inefficient pricing model. Data-driven switching made easy.</p>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
