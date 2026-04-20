import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { MotionDiv, MotionH2, MotionP } from "@/components/motion-wrapper";

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
  supertitle = "The Future of Comparisons",
  title = "Compare Tools with AI Precision",
  subtitle = "Stop wasting time on research. Use AI to find the perfect platform for your online business.",
  primaryCta = "Get Started",
  secondaryCta = "View Comparisons",
  isToolsEnabled = true,
  isCompareEnabled = true,
  toolsHref,
}: HomeHeroProps) {
  return (
    <section className="relative w-full min-h-[70vh] flex items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Visual Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-40"></div>
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8"
          >
            <Zap className="h-4 w-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              {supertitle}
            </span>
          </MotionDiv>

          <MotionH2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-5xl font-black tracking-tight leading-[1.05] mb-5 bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            {title}
          </MotionH2>

          <MotionP
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed"
          >
            {subtitle}
          </MotionP>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {isToolsEnabled && (
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 h-12 text-base font-bold shadow-xl shadow-primary/20 group hover:scale-105 active:scale-95 transition-all"
              >
                <NextLink href={toolsHref}>
                  {primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </NextLink>
              </Button>
            )}
            {isCompareEnabled && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 text-base font-bold border-border/50 hover:bg-secondary/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
              >
                <NextLink href="/compare">{secondaryCta}</NextLink>
              </Button>
            )}
          </MotionDiv>

          {/* Feature Tags */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-border/10 w-full"
          >
            {[
              { label: "AI Powered", icon: CheckCircle2 },
              { label: "Verified Data", icon: CheckCircle2 },
              { label: "Expert Chosen", icon: CheckCircle2 },
              { label: "Instant Access", icon: CheckCircle2 },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 text-muted-foreground/80 justify-center"
              >
                <f.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
