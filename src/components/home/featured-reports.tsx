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
    <section className="py-32 bg-secondary/0 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-light opacity-5 pointer-events-none"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-6 shadow-sm">
              <Zap className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-widest text-orange-500 font-black">
                Live Assessments
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
              Latest <span className="text-primary italic">Intelligence</span>{" "}
              Reports
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Raw data. Side-by-side breakdowns. Zero fluff. Find the perfect
              fit for your business.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="group h-14 px-8 rounded-2xl hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-xs transition-all"
          >
            <NextLink href="/compare">
              View Extensive Reports{" "}
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </NextLink>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {comparisons.map((comp, idx) => (
            <MotionDiv
              key={comp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card className="group overflow-hidden rounded-[2.5rem] border border-border/10 bg-card/20 backdrop-blur-xl shadow-lg transition-all duration-700 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col sm:flex-row">
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div className="space-y-8">
                    <div className="flex items-center space-x-3 mb-4 p-2 bg-background/50 rounded-2xl border border-border/10 w-fit">
                      <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden relative shadow-lg">
                          <ManagedImage
                            fill
                            src={comp.platformA.logoUrl}
                            alt={comp.platformA.name}
                            className="object-cover"
                          />
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden relative shadow-lg">
                          <ManagedImage
                            fill
                            src={comp.platformB.logoUrl}
                            alt={comp.platformB.name}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
                        Tactical Report
                      </span>
                    </div>
                    <NextLink href={`/compare/${comp.slug}`}>
                      <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors leading-[1.1] mb-6">
                        {comp.title}
                      </h3>
                    </NextLink>
                    <p className="text-muted-foreground font-medium leading-relaxed text-sm line-clamp-2">
                      {comp.summary}
                    </p>
                  </div>
                  <NextLink
                    href={`/compare/${comp.slug}`}
                    className="mt-12 flex items-center text-[10px] font-black text-primary uppercase tracking-[0.3em] group-hover:translate-x-3 transition-transform duration-500"
                  >
                    The Full Breakdown <ArrowRight className="ml-3 h-4 w-4" />
                  </NextLink>
                </div>
                <div className="w-full sm:w-[200px] bg-primary/5 p-8 flex flex-col justify-center items-center gap-6 border-l border-border/10">
                  {(() => {
                    const avgScore = calculateComparisonAverageScore(
                      comp.platformA,
                      comp.platformB,
                    );
                    const progressWidth = `${parseFloat(avgScore) * 10}%`;
                    return (
                      <>
                        <div className="text-center group/score">
                          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
                            Signal Score
                          </div>
                          <div className="text-6xl text-primary italic drop-shadow-sm font-black">
                            {avgScore}
                          </div>
                        </div>
                        <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden shadow-inner">
                          <MotionDiv
                            initial={{ width: 0 }}
                            whileInView={{ width: progressWidth }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="bg-primary h-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                          />
                        </div>
                      </>
                    );
                  })()}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="h-3 w-3 text-amber-500 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
