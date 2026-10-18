import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { ArrowRight, CheckCircle2, Zap, Wrench } from "lucide-react";

interface HomeHeroProps {
  supertitle?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  isToolsEnabled?: boolean;
  isCompareEnabled?: boolean;
  toolsHref: string;
}

export function HomeHero({
  supertitle = "Independent Platform Intelligence",
  title = "Compare Creator Platforms with Absolute Precision",
  subtitle = "Zero sponsored bias. In-depth feature matrices, verified pricing breakdowns, and side-by-side analysis to pick your winning stack.",
  primaryCta = "Explore Comparisons",
  secondaryCta = "Quick Platform Match",
  isToolsEnabled = true,
  isCompareEnabled = true,
  toolsHref,
}: HomeHeroProps) {
  return (
    <section className="relative w-full min-h-[50vh] flex items-center justify-center pt-16 pb-8 overflow-hidden">
      {/* Visual Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[90px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="container mx-auto relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Zap className="h-3.5 w-3.5" />
            <span className="text-xs font-bold tracking-wider uppercase">
              {supertitle}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.15] mb-4 text-foreground">
            {title}
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-xl mb-8 leading-relaxed font-medium">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Button
              asChild
              size="default"
              className="rounded-full px-7 h-11 text-sm font-bold shadow-md shadow-primary/20 group hover:scale-102 active:scale-98 transition-all"
            >
              <NextLink href="/compare">
                {primaryCta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </NextLink>
            </Button>
            <Button
              asChild
              size="default"
              variant="outline"
              className="rounded-full px-7 h-11 text-sm font-bold border-border/60 hover:bg-secondary/50 backdrop-blur-sm transition-all hover:scale-102 active:scale-98 group"
            >
              <NextLink
                href={toolsHref || "/tools"}
                className="flex items-center gap-2"
              >
                <Wrench className="h-4 w-4 text-primary transition-transform group-hover:rotate-12" />
                <span>Explore Tools</span>
              </NextLink>
            </Button>
          </div>

          {/* Feature Tags */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/20 w-full max-w-2xl animate-in fade-in duration-700 delay-500"
          >
            {[
              { label: "Side-by-Side Matrix", icon: CheckCircle2 },
              { label: "Fee & Pricing Audits", icon: CheckCircle2 },
              { label: "Unbiased Assessments", icon: CheckCircle2 },
              { label: "Direct Platform Slugs", icon: CheckCircle2 },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center space-x-1.5 text-muted-foreground/80 justify-center"
              >
                <f.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
