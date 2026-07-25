import { MotionDiv } from "@/components/motion-wrapper";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Zap } from "lucide-react";
import NextLink from "next/link";
import { ManagedImage } from "@/components/managed-image";
import type { Comparison, Platform } from "@prisma/client";

type ComparisonWithPlatforms = Comparison & {
  platformA: Platform;
  platformB: Platform;
};

interface ComparisonListProps {
  comparisons: ComparisonWithPlatforms[];
  emptyTitle?: string;
  emptySubtitle?: string;
}

import { InfiniteScrollGrid } from "@/components/infinite-scroll-grid";

export function ComparisonList({
  comparisons,
  emptyTitle = "No Reports Found",
  emptySubtitle = "Our intelligence engine is currently refreshing. Try adjusting your signal filters.",
}: ComparisonListProps) {
  const emptyState = (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20 rounded-3xl border border-dashed border-border/40 bg-secondary/5"
    >
      <Zap className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" />
      <h3 className="text-2xl font-bold mb-2 tracking-tight">
        {emptyTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
        {emptySubtitle}
      </p>
    </MotionDiv>
  );

  return (
    <InfiniteScrollGrid batchSize={9} emptyState={emptyState}>
      {comparisons.map((comp, index) => (
        <MotionDiv
          key={comp.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: (index % 3) * 0.05 }}
        >
          <Card className="flex flex-col h-full group overflow-hidden rounded-2xl border border-border/40 bg-card/20 hover:bg-card/30 backdrop-blur-md shadow-sm transition-all duration-500 hover:shadow-md hover:border-primary/20">
            <NextLink href={`/compare/${comp.slug}`} className="block relative">
              <div className="h-44 bg-linear-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center relative px-8 overflow-hidden border-b border-border/10">
                <div className="absolute inset-0 bg-grid-pattern-light opacity-5"></div>
                {(() => {
                  const ratingA = comp.platformA.rating || 0;
                  const ratingB = comp.platformB.rating || 0;
                  const diff = Math.abs(ratingA - ratingB);
                  if (diff >= 1.0) {
                    return (
                      <div className="absolute top-3 left-3 z-30 bg-primary/90 text-primary-foreground px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        High Signal
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex justify-between items-center w-full relative z-10 gap-3">
                  <div className="relative h-16 w-[42%] flex items-center justify-center p-2.5 bg-background/90 backdrop-blur-md rounded-xl shadow-sm border border-border/30 group-hover:scale-103 transition-transform duration-500">
                    <ManagedImage
                      src={comp.platformA.logoUrl}
                      alt={comp.platformA.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="bg-primary backdrop-blur-md rounded-full p-2 border border-primary/30 z-20 shadow-md flex items-center justify-center min-w-[32px] h-[32px]">
                    <span className="font-bold text-[9px] text-primary-foreground italic">
                      VS
                    </span>
                  </div>
                  <div className="relative h-16 w-[42%] flex items-center justify-center p-2.5 bg-background/90 backdrop-blur-md rounded-xl shadow-sm border border-border/30 group-hover:scale-103 transition-transform duration-500">
                    <ManagedImage
                      src={comp.platformB.logoUrl}
                      alt={comp.platformB.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                </div>
              </div>
            </NextLink>
            <CardContent className="flex-1 p-6 text-center bg-transparent">
              <h2 className="text-lg font-bold mb-3 leading-tight group-hover:text-primary transition-colors duration-300">
                <NextLink
                  href={`/compare/${comp.slug}`}
                  className="line-clamp-2 after:absolute after:inset-0"
                >
                  {comp.title}
                </NextLink>
              </h2>
              <p className="text-muted-foreground mb-6 line-clamp-2 text-xs leading-relaxed font-medium">
                {comp.summary}
              </p>
              <div className="grid grid-cols-2 bg-background/30 rounded-xl border border-border/40 p-3 relative overflow-hidden">
                <div className="absolute inset-y-0 left-1/2 w-px bg-border/20"></div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-lg font-bold text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    {comp.platformA.rating?.toFixed(1) || "N/A"}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 line-clamp-1 truncate w-full px-1.5">
                    {comp.platformA.name}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-lg font-bold text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    {comp.platformB.rating?.toFixed(1) || "N/A"}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 line-clamp-1 truncate w-full px-1.5">
                    {comp.platformB.name}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 bg-transparent flex justify-center pb-6">
              <Button
                asChild
                variant="ghost"
                className="w-[90%] h-11 rounded-xl group/btn hover:bg-primary/10 text-primary font-bold uppercase tracking-wider text-xs transition-all"
              >
                <NextLink
                  href={`/compare/${comp.slug}`}
                  className="flex items-center justify-center"
                >
                  The Full Breakdown
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </NextLink>
              </Button>
            </CardFooter>
          </Card>
        </MotionDiv>
      ))}
    </InfiniteScrollGrid>
  );
}
