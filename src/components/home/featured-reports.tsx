import NextLink from "next/link";
import { ArrowRight, Zap, Star } from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManagedImage } from "@/components/managed-image";
import { calculateComparisonAverageScore } from "@/lib/scoring";
import type { Comparison, Platform } from "@prisma/client";

type ComparisonWithPlatforms = Comparison & {
  platformA: Platform;
  platformB: Platform;
};

interface FeaturedReportsProps {
  comparisons: ComparisonWithPlatforms[];
}

export function FeaturedReports({ comparisons }: FeaturedReportsProps) {
  if (comparisons.length === 0) return null;

  return (
    <section className="py-10 bg-secondary/0 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-light opacity-5 pointer-events-none"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-xs">
              <Zap className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-widest text-orange-500 font-extrabold">
                Live Assessments
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Latest <span className="text-primary italic">Intelligence</span> Reports
            </h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Raw data. Side-by-side breakdowns. Zero fluff. Find the perfect fit for your business.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="group h-10 px-4 rounded-xl hover:bg-primary/10 text-primary font-extrabold uppercase tracking-widest text-[10px] transition-all"
          >
            <NextLink href="/compare">
              View Extensive Reports{" "}
              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </NextLink>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {comparisons.map((comp, idx) => {
            if (!comp.platformA || !comp.platformB) return null;
            return (
            <MotionDiv
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <Card className="group overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md hover:border-border/60 transition-colors shadow-md h-full flex flex-col sm:flex-row">
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-1.5 bg-background/50 rounded-xl border border-border/20 w-fit">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full border border-background overflow-hidden relative shadow-sm">
                          <ManagedImage
                            fill
                            src={comp.platformA.logoUrl}
                            alt={comp.platformA.name}
                            className="object-cover"
                          />
                        </div>
                        <div className="w-7 h-7 rounded-full border border-background overflow-hidden relative shadow-sm">
                          <ManagedImage
                            fill
                            src={comp.platformB.logoUrl}
                            alt={comp.platformB.name}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1.5">
                        Comparison
                      </span>
                    </div>
                    <NextLink href={`/compare/${comp.slug}`}>
                      <h3 className="text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors leading-snug">
                        {comp.title}
                      </h3>
                    </NextLink>
                    <p className="text-muted-foreground font-medium leading-relaxed text-xs line-clamp-2">
                      {comp.summary}
                    </p>
                  </div>
                  <NextLink
                    href={`/compare/${comp.slug}`}
                    className="mt-6 flex items-center text-[10px] font-extrabold text-primary uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300"
                  >
                    The Full Breakdown <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </NextLink>
                </div>
                <div className="w-full sm:w-[150px] bg-primary/5 p-4 flex flex-col justify-center items-center gap-4 border-l border-border/20">
                  {(() => {
                    const avgScore = calculateComparisonAverageScore(
                      comp.platformA,
                      comp.platformB,
                    );
                    const progressWidth = `${parseFloat(avgScore) * 10}%`;
                    return (
                      <>
                        <div className="text-center group/score">
                          <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Rating
                          </div>
                          <div className="text-3xl text-primary italic drop-shadow-xs font-black">
                            {avgScore}
                          </div>
                        </div>
                        <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
                          <MotionDiv
                            initial={{ width: 0 }}
                            whileInView={{ width: progressWidth }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="bg-primary h-full"
                          />
                        </div>
                      </>
                    );
                  })()}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="h-2.5 w-2.5 text-amber-500 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </MotionDiv>
            );
          })}
        </div>
      </div>
    </section>
  );
}
