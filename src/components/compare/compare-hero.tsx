import { MotionDiv } from "@/components/motion-wrapper";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Layers } from "lucide-react";

interface CompareHeroProps {
  subtitle?: string;
}

export function CompareHero({ subtitle }: CompareHeroProps) {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Breadcrumbs
              items={[{ name: "Home", href: "/" }, { name: "Compare" }]}
              className="mb-10 justify-center"
            />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 shadow-sm">
              <Layers className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Tactical Assessment Hub
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-none mb-8">
              Strategic{" "}
              <span className="text-primary italic">Intelligence</span> Reports
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {subtitle ||
                "Zero fluff. Raw data. Side-by-side breakdowns to help you choose the winner for your business."}
            </p>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
