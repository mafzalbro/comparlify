import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import prisma from "@/lib/prisma";
import { ROICalculator } from "./_components/roi-calculator";
import { MotionDiv } from "@/components/motion-wrapper";
import { ShieldCheck, Calculator, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Switch & Save ROI Engine | Comparlify",
    description:
      "Calculate exactly how much you're losing to transaction fees. Compare Kajabi, Teachable, Thinkific and more with our real-time ROI calculator.",
    path: "/tools/roi-calculator",
  });
}

async function getPlatforms() {
  return await prisma.platform.findMany({
    include: {
      tiers: {
        orderBy: {
          monthlyPrice: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export default async function ROICalculatorPage() {
  const platforms = await getPlatforms();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
          Switch & Save <span className="text-primary italic">ROI Engine</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Stop overpaying for your course infrastructure. Our engine calculates
          the hidden cost of transaction fees and student caps across every
          major platform.
        </p>
      </MotionDiv>

      <ROICalculator platforms={platforms as any} />

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 pt-20 border-t border-border/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              Why{" "}
              <span className="text-primary italic">Financial Fidelity</span>{" "}
              Matters
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Most comparison sites just show you the headline price. We dig
              deeper into the math of transaction fees. At $10k/month, a 5%
              transaction fee costs you **$6,000 per year** in lost revenue. Our
              mission is to put that money back in your pocket.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest leading-normal">
                All data is periodically verified by our research team for 2024
                accuracy.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-secondary/5 border border-border/10 relative group">
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                Pro Insight
              </h3>
              <p className="text-sm text-muted-foreground italic">
                "Creators switching from tier-1 platforms with transaction fees
                to flat-rate systems like LearnWorlds or Kajabi often see an
                immediate 5-12% increase in net profit margins."
              </p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
