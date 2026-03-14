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
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Advanced Creator Tools | Comparlify",
    description:
      "Interactive calculators, stack architects, and migration estimators built for professional course creators.",
    path: "/tools",
  });
}

const ADVANCED_TOOLS = [
  {
    title: "Switch & Save ROI Engine",
    description:
      "Compare transaction fees vs. flat monthly costs across all major LMS platforms. Find your cheapest stack.",
    icon: Calculator,
    href: "/tools/roi-calculator",
    status: "Best for Savings",
    tag: "Live",
  },
  {
    title: "E-Learning Stack Architect",
    description:
      "Visually build your entire tech stack (LMS + Email + Community). Flag integration gaps instantly.",
    icon: LayoutGrid,
    href: "/tools/stack-architect",
    status: "Best for Planning",
    tag: "Live",
  },
  {
    title: "True Migration Estimator",
    description:
      "Calculates the hidden costs and hours required to move your courses between platforms.",
    icon: ArrowRightLeft,
    href: "/tools/migration-estimator",
    status: "Priority 3",
    tag: "Coming Soon",
  },
];

export default function ToolsDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Business Engineering Hub
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Advanced <span className="text-primary italic">Intelligence</span>{" "}
          Tools
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
          Professional-grade calculators and planners to help you scale your
          course business with technical precision.
        </p>
      </MotionDiv>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {ADVANCED_TOOLS.map((tool, i) => (
          <MotionDiv
            key={tool.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={tool.href} className="group block h-full">
              <Card className="p-8 h-full bg-card/40 backdrop-blur-3xl border border-border/10 hover:border-primary/50 transition-all duration-500 rounded-[2rem] flex flex-col">
                <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
                  <tool.icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-black tracking-tight">
                      {tool.title}
                    </h3>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-2 py-1 rounded">
                      {tool.tag}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  View Specs <Sparkles className="ml-2 h-3 w-3" />
                </div>
              </Card>
            </Link>
          </MotionDiv>
        ))}
      </div>

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="pt-20 border-t border-border/10 text-center"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 bg-muted rounded-[2rem] w-fit border border-border/10">
            <Wand2 className="h-10 w-10 opacity-20" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-3">
              Looking for AI Generators?
            </h2>
            <p className="text-muted-foreground mb-8">
              We&apos;ve moved our 18 creator generators to their own dedicated
              hub.
            </p>
            <Link
              href="/tools/ai"
              className="inline-flex items-center px-8 py-4 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-black uppercase text-xs tracking-widest transition-all"
            >
              Access AI Hub <Sparkles className="ml-2 h-4 w-4 text-primary" />
            </Link>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
