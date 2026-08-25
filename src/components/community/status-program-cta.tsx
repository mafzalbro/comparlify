import { MotionDiv } from "@/components/motion-wrapper";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Star } from "lucide-react";

export function StatusProgramCTA() {
  return (
    <section className="container max-w-5xl py-12">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group p-1 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors shadow-md"
      >
        <div className="p-8 md:p-12 rounded-xl bg-card/60 backdrop-blur-md border border-primary/20 overflow-hidden flex flex-col items-center text-center">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4 shadow-sm">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">
                Contributor Program
              </span>
            </div>
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Earn <span className="text-primary italic">Recognition</span> Through Contributions
            </h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
              Share your expertise. Active contributors get early access to new tools,
              exclusive comparisons, and a verified creator badge.
            </p>
            <Button
              asChild
              size="default"
              className="rounded-full px-8 h-11 font-extrabold uppercase tracking-widest text-xs shadow-md shadow-primary/20 hover:scale-102 active:scale-98 transition-all"
            >
              <NextLink href="#categories">View All Categories</NextLink>
            </Button>
          </div>
        </div>
      </MotionDiv>
    </section>
  );
}
