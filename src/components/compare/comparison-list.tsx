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

export function ComparisonList({
  comparisons,
  emptyTitle = "No Reports Found",
  emptySubtitle = "Our intelligence engine is currently refreshing. Try adjusting your signal filters.",
}: ComparisonListProps) {
  if (comparisons.length === 0) {
    return (
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-40 rounded-[4rem] border-2 border-dashed border-border/20 bg-secondary/5"
      >
        <Zap className="mx-auto h-20 w-20 text-muted-foreground/20 mb-8" />
        <h3 className="text-4xl font-black mb-4 uppercase tracking-tight">
          {emptyTitle}
        </h3>
        <p className="text-xl text-muted-foreground max-w-md mx-auto font-medium leading-relaxed">
          {emptySubtitle}
        </p>
      </MotionDiv>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {comparisons.map((comp, index) => (
        <MotionDiv
          key={comp.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ y: -12 }}
        >
          <Card className="flex flex-col h-full group overflow-hidden rounded-[2.5rem] border border-border/10 bg-card/20 backdrop-blur-xl shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5">
            <NextLink href={`/compare/${comp.slug}`} className="block relative">
              <div className="h-56 bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center relative px-10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern-light opacity-10"></div>
                {(() => {
                  const ratingA = comp.platformA.rating || 0;
                  const ratingB = comp.platformB.rating || 0;
                  const diff = Math.abs(ratingA - ratingB);
                  if (diff >= 1.0) {
                    return (
                      <div className="absolute top-4 left-4 z-30 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                        High Signal
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="absolute -bottom-10 -right-10 text-primary/10 select-none pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                  <Zap className="w-48 h-48" />
                </div>

                <div className="flex justify-between items-center w-full relative z-10 gap-4">
                  <div className="relative h-20 w-[42%] flex items-center justify-center p-3 bg-background/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-700 group-hover:-rotate-3 translate-x-2 group-hover:translate-x-0">
                    <ManagedImage
                      src={comp.platformA.logoUrl}
                      alt={comp.platformA.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="bg-primary backdrop-blur-xl rounded-full p-3 border border-primary/50 z-20 shadow-xl group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-1000">
                    <span className="font-black text-[10px] text-primary-foreground italic uppercase tracking-tighter">
                      VS
                    </span>
                  </div>
                  <div className="relative h-20 w-[42%] flex items-center justify-center p-3 bg-background/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-700 group-hover:rotate-3 -translate-x-2 group-hover:translate-x-0">
                    <ManagedImage
                      src={comp.platformB.logoUrl}
                      alt={comp.platformB.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
              </div>
            </NextLink>
            <CardContent className="flex-1 p-8 pb-4 text-center bg-transparent">
              <h2 className="text-2xl font-black mb-4 leading-tight group-hover:text-primary transition-colors duration-500">
                <NextLink
                  href={`/compare/${comp.slug}`}
                  className="line-clamp-2 after:absolute after:inset-0"
                >
                  {comp.title}
                </NextLink>
              </h2>
              <p className="text-muted-foreground mb-8 line-clamp-2 text-sm leading-relaxed px-4 font-medium">
                {comp.summary}
              </p>
              <div className="grid grid-cols-2 bg-background/40 backdrop-blur-xl rounded-[1.5rem] border border-border/10 p-4 shadow-inner relative overflow-hidden group/rating">
                <div className="absolute inset-y-0 left-1/2 w-px bg-border/20"></div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-2xl font-black text-amber-500 mb-2 italic">
                    <Star className="w-5 h-5 fill-current" />
                    {comp.platformA.rating?.toFixed(1) || "N/A"}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 line-clamp-1 truncate w-full px-2">
                    {comp.platformA.name}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-2xl font-black text-amber-500 mb-2 italic">
                    <Star className="w-5 h-5 fill-current" />
                    {comp.platformB.rating?.toFixed(1) || "N/A"}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 line-clamp-1 truncate w-full px-2">
                    {comp.platformB.name}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 bg-transparent flex justify-center pb-8">
              <Button
                asChild
                size="xl"
                variant="ghost"
                className="w-[85%] h-14 rounded-[1.5rem] group/btn hover:bg-primary/10 text-primary font-black uppercase tracking-[0.2em] text-[10px] transition-all"
              >
                <NextLink
                  href={`/compare/${comp.slug}`}
                  className="flex items-center justify-center"
                >
                  The Full Breakdown
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover/btn:translate-x-3" />
                </NextLink>
              </Button>
            </CardFooter>
          </Card>
        </MotionDiv>
      ))}
    </div>
  );
}
