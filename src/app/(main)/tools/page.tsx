import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { MotionDiv } from "@/components/motion-wrapper";
import {
  Calculator,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Wand2,
  Repeat,
  Target,
  Zap,
  ArrowRight,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumb";
import { ConverterDashboardSection } from "./_components/converter-dashboard-section";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Creator Business Tools | Comparlify",
    description:
      "Interactive calculators, tech planners, and cost estimators built for professional course creators.",
    path: "/tools",
  });
}

// ── Main tool categories ─────────────────────────────────────────────────────
const TOOL_CATEGORIES = [
  {
    name: "Strategic Savings & ROI",
    description: "Identify hidden platform fees, prevent overlap, and optimize your margin structure.",
    tools: [
      {
        title: "Software Matchmaker",
        description: "Find the perfect software for your business based on your budget and technical needs.",
        icon: Target,
        href: "/tools/creator-match",
        status: "Recommended",
        tag: "New",
      },
      {
        title: "Pricing Calculator",
        description: "Calculate your true profit by comparing Teachable, Kajabi, Podia, and more with our real-time fee engine.",
        icon: Calculator,
        href: "/tools/pricing-calculator",
        status: "Strategic Tool",
        tag: "New",
      },
      {
        title: "Savings Calculator",
        description: "Compare transaction fees vs. flat monthly costs. Find your cheapest infrastructure option.",
        icon: Calculator,
        href: "/tools/roi-calculator",
        status: "Best for Savings",
        tag: "Live",
      },
      {
        title: "Revenue Calculator",
        description: "Calculate your net profit after platform fees. Compare Teachable vs Kajabi margins for your next launch.",
        icon: Coins,
        href: "/tools/course-revenue-calculator",
        status: "Revenue Tool",
        tag: "New",
      },
      {
        title: "Subscription Audit",
        description: "Check for redundant subscriptions. Save money by removing overlapping features.",
        icon: Zap,
        href: "/tools/stack-optimizer",
        status: "Audit Tool",
        tag: "Live",
      },
    ],
  },
  {
    name: "Growth & Operations",
    description: "Architecting high-performance stacks and forecasting profitability.",
    tools: [
      {
        title: "Tech Stack Planner",
        description: "Plan your entire software suite (Courses + Email + Community). Spot gaps instantly.",
        icon: LayoutGrid,
        href: "/tools/stack-architect",
        status: "Planning",
        tag: "Live",
      },
      {
        title: "Retention Forecaster",
        description: "See how student retention affects your long-term income. Plan your growth with math.",
        icon: Repeat,
        href: "/tools/churn-forecaster",
        status: "Growth Tool",
        tag: "Live",
      },
      {
        title: "Ad ROI Predictor",
        description: "Calculate the exact profit of your ads. Know your break-even point before you scale.",
        icon: Target,
        href: "/tools/ad-profit-predictor",
        status: "Scaling",
        tag: "Live",
      },
    ],
  },
];

export default function ToolsDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs 
        items={[{ name: "Home", href: "/" }, { name: "Tools" }]}
        className="mb-8"
      />
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary mb-4 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Strategic Intelligence Toolkit</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
          Professional <span className="text-primary italic font-semibold">Creator</span> Toolkit
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Professional-grade calculators and engineering tools to help you scale your
          course business with technical precision.
        </p>
      </MotionDiv>

      {/* ── Tool categories (Creators + Creation) ────────────────────── */}
      <div className="space-y-16 mb-20">
        {TOOL_CATEGORIES.map((category, catIndex) => (
          <div key={category.name} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-4">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight mb-1 text-foreground">
                  {category.name}
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  {category.description}
                </p>
              </div>
              <div className="text-xs font-bold text-primary/60">
                Module {catIndex + 1}.0
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.tools.map((tool, i) => (
                <MotionDiv
                  key={tool.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={tool.href} className="group block h-full">
                    <Card className="p-6 h-full bg-card/30 hover:bg-card/45 backdrop-blur-md border border-border/40 hover:border-primary/30 transition-all duration-300 rounded-2xl flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform duration-500">
                        <tool.icon className="h-20 w-20 text-foreground" />
                      </div>
                      
                      <div className="p-3 bg-primary/10 rounded-xl w-fit mb-5 text-primary group-hover:scale-103 transition-transform duration-300">
                        <tool.icon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-3">
                          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                            {tool.title}
                            {tool.tag === "New" && (
                              <span className="text-[8px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                {tool.tag}
                              </span>
                            )}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                          {tool.description}
                        </p>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-border/10 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                          Initialize Tool <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground/60">{tool.status}</span>
                      </div>
                    </Card>
                  </Link>
                </MotionDiv>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Multimedia Hub Section ───────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <ConverterDashboardSection moduleNumber="3.0" />
      </MotionDiv>

      {/* ── AI Content Hub CTA ────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="pt-12 border-t border-border/10 text-center"
      >
        <div className="flex flex-col items-center gap-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
            Module 4.0 // Strategic Automation
          </div>
          <div className="p-3 bg-muted rounded-2xl w-fit border border-border/30">
            <Wand2 className="h-8 w-8 opacity-40 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">
              AI Content <span className="text-primary italic font-semibold">Intelligence</span>
            </h2>
            <p className="text-muted-foreground mb-6 text-xs font-medium max-w-md mx-auto leading-relaxed">
              Scale your content velocity with our 18 technical generators — now centralized 
              to provide surgical precision for your marketing assets.
            </p>
            <Link
              href="/tools/ai"
              className="inline-flex items-center px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-xs tracking-wider transition-all shadow-md shadow-primary/10 hover:scale-102 active:scale-98"
            >
              Access Strategic Hub <Sparkles className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
