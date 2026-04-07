import { MotionDiv } from "@/components/motion-wrapper";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Star } from "lucide-react";

export function StatusProgramCTA() {
  return (
    <section className="container max-w-6xl py-32">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group p-1.5 rounded-[3rem] bg-linear-to-br from-primary/20 via-transparent to-primary/20 border border-primary/10"
      >
        <div className="p-12 md:p-20 rounded-[2.8rem] bg-card/60 backdrop-blur-3xl border border-primary/10 shadow-3xl overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-10"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 shadow-xl ring-8 ring-primary/5">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Signal Merit Program
              </span>
            </div>
            <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-none">
              Earn <span className="text-primary italic">Status</span> Through
              Intel
            </h3>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-medium">
              Validate your expertise. High-signal contributors unlock surgical
              AI tools, secret comparisons, and elite verified creator
              credentials.
            </p>
            <Button
              asChild
              size="xl"
              className="rounded-full px-12 h-16 font-black uppercase tracking-[0.3em] text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <NextLink href="#categories">View All Categories</NextLink>
            </Button>
          </div>
        </div>
      </MotionDiv>
    </section>
  );
}
