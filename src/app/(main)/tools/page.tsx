import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { MotionDiv } from "@/components/motion-wrapper";
import {
  Calculator,
  LayoutGrid,
  ArrowRightLeft,
  ShieldCheck,
  Sparkles,
  Wand2,
  Repeat,
  Target,
  Zap,
  Image as ImageIcon,
  FileDigit,
  ArrowRight,
  ChevronRight,
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

// ── Top 10 trending converter tool pairs ────────────────────────────────────
const TRENDING_CONVERTERS = [
  { from: "pdf",  to: "png",  label: "PDF → PNG",    local: true },
  { from: "pdf",  to: "jpg",  label: "PDF → JPG",    local: true },
  { from: "jpg",  to: "pdf",  label: "JPG → PDF",    local: true },
  { from: "png",  to: "jpg",  label: "PNG → JPG",    local: true },
  { from: "html", to: "png",  label: "HTML → PNG",   local: true },
  { from: "jpg",  to: "webp", label: "JPG → WEBP",   local: true },
  { from: "pdf",  to: "pdf",  label: "Compress PDF", local: true },
  { from: "pptx", to: "pdf",  label: "PPTX → PDF",  local: false },
  { from: "xlsx", to: "csv",  label: "XLSX → CSV",   local: false },
  { from: "epub", to: "pdf",  label: "EPUB → PDF",   local: false },
];

// ── Main tool categories ─────────────────────────────────────────────────────
const TOOL_CATEGORIES = [
  {
    name: "Strategic Savings & ROI",
    description: "Financial engineering tools to identify hidden costs and optimize your business infrastructure.",
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
    description: "Architecting high-performance stacks and forecasting profitability for your course empire.",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumbs 
        items={[{ name: "Home", href: "/" }, { name: "Tools" }]}
        className="mb-8 pl-4 md:pl-0"
      />
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Strategic Intelligence
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
          Professional <span className="text-primary italic">Creator</span>{" "}
          Toolkit
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
          Professional-grade calculators and engineering tools to help you scale your
          course business with technical precision.
        </p>
      </MotionDiv>

      {/* ── Tool categories (Creators + Creation) ────────────────────── */}
      <div className="space-y-28 mb-28">
        {TOOL_CATEGORIES.map((category, catIndex) => (
          <div key={category.name} className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/10 pb-6">
              <div className="max-w-xl">
                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
                  {category.name}
                </h2>
                <p className="text-muted-foreground font-medium">
                  {category.description}
                </p>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
                Module {catIndex + 1}.0
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {category.tools.map((tool, i) => (
                <MotionDiv
                  key={tool.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={tool.href} className="group block h-full">
                    <Card className="p-8 h-full bg-card/40 backdrop-blur-3xl border border-border/10 hover:border-primary/50 transition-all duration-500 rounded-4xl flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <tool.icon className="h-24 w-24" />
                      </div>
                      
                      <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-6 text-primary group-hover:scale-110 transition-transform duration-500 relative z-10">
                        <tool.icon className="h-8 w-8" />
                      </div>
                      
                      <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            {tool.title}
                            {tool.tag === "New" && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-2 py-1 rounded">
                                {tool.tag}
                              </span>
                            )}
                          </h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-medium">
                          {tool.description}
                        </p>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-widest flex items-center group-hover:translate-x-2 transition-transform">
                          Initialize Tool <Sparkles className="ml-2 h-3 w-3" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">{tool.status}</span>
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-28"
      >
        <ConverterDashboardSection moduleNumber="3.0" />
      </MotionDiv>

      {/* ── AI Content Hub CTA ────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="pt-16 border-t border-border/10 text-center"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">
            Module 4.0 // Strategic Automation
          </div>
          <div className="p-4 bg-muted rounded-4xl w-fit border border-border/10">
            <Wand2 className="h-10 w-10 opacity-20" />
          </div>
          <div>
            <h2 className="text-3xl font-black mb-3 italic">
              AI Content <span className="text-primary italic">Intelligence</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-sm font-medium max-w-lg mx-auto leading-relaxed">
              Scale your content velocity with our 18 technical generators — now centralized 
              to provide surgical precision for your marketing assets.
            </p>
            <Link
              href="/tools/ai"
              className="inline-flex items-center px-10 py-5 rounded-full bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
            >
              Access Strategic Hub <Sparkles className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
