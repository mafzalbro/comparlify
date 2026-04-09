import { Breadcrumbs } from "@/components/breadcrumb";
import { ManagedImage } from "@/components/managed-image";
import { BookmarkButton } from "@/components/bookmark-button";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { MotionDiv } from "@/components/motion-wrapper";
import { Scale, Zap, ShieldCheck } from "lucide-react";
import type { Platform } from "@prisma/client";
import type { Session } from "next-auth";

interface ComparisonHeroProps {
  title: string;
  summary: string;
  comparisonId: string;
  platformA: Platform;
  platformB: Platform;
  scoreA: string;
  scoreB: string;
  session: Session | null;
}

export function ComparisonHero({
  title,
  summary,
  comparisonId,
  platformA,
  platformB,
  scoreA,
  scoreB,
  session,
}: ComparisonHeroProps) {
  const isPlatformAWinner = parseFloat(scoreA) > parseFloat(scoreB);
  const isPlatformBWinner = parseFloat(scoreB) > parseFloat(scoreA);
  const isCloseCall = Math.abs(parseFloat(scoreA) - parseFloat(scoreB)) < 0.5;

  return (
    <header className="relative pt-32 pb-48 overflow-hidden border-b border-border/10">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Comparisons", href: "/compare" },
                { name: title },
              ]}
              className="mb-12 justify-center"
            />

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] shadow-sm ring-1 ring-primary/20">
                <Scale className="h-4 w-4" />
                In-Depth Comparison Analysis
              </div>

              {(platformA as any).lastVerifiedAt ||
              (platformB as any).lastVerifiedAt ? (
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] shadow-sm ring-1 ring-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" />
                  Live Truth Verified
                </div>
              ) : null}
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-12 leading-none uppercase">
              {platformA.name} <br />
              <span className="text-primary italic drop-shadow-sm font-black">
                vs
              </span>{" "}
              <br />
              {platformB.name}
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl font-medium mb-16">
              {summary}
            </p>

            {/* Platform Showdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mt-12 bg-card/60 backdrop-blur-3xl p-8 rounded-4xl border border-border/10 shadow-2xl relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-background border border-border p-5 rounded-full shadow-2xl hidden md:block">
                <Zap className="h-10 w-10 text-primary animate-pulse" />
              </div>
              {[platformA, platformB].map((platform, i) => {
                const isWinner =
                  (i === 0 && isPlatformAWinner) ||
                  (i === 1 && isPlatformBWinner);
                return (
                  <div
                    key={platform.id}
                    className="flex flex-col items-center gap-8 group relative"
                  >
                    {isWinner && !isCloseCall && (
                      <MotionDiv
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: -12 }}
                        className="absolute -top-4 -right-4 z-30 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl ring-4 ring-background"
                      >
                        Top Pick
                      </MotionDiv>
                    )}
                    <div className="relative h-32 w-full max-w-[300px] p-6 bg-muted/50 rounded-3xl border border-border flex items-center justify-center group-hover:bg-primary/5 transition-all">
                      <ManagedImage
                        src={platform.logoUrl}
                        alt={platform.name}
                        width={200}
                        height={80}
                        className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">
                        {platform.name}
                      </h3>
                      <Badge className="mt-4 bg-secondary/50 text-muted-foreground text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                        Expert Assessment
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-10 mt-20">
              {session?.user && (
                <div className="group flex flex-col items-center gap-4">
                  <BookmarkButton
                    comparisonId={comparisonId}
                    className="h-20 w-20 rounded-[2.5rem] shadow-2xl bg-card border-border hover:-translate-y-2 transition-all p-0 flex items-center justify-center"
                    showText={false}
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground group-hover:text-primary transition-colors">
                    Save
                  </span>
                </div>
              )}
              <div className="group flex flex-col items-center gap-4">
                <ShareButton className="h-20 w-20 rounded-[2.5rem] shadow-2xl bg-card border-border hover:-translate-y-2 transition-all" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground group-hover:text-primary transition-colors">
                  Share
                </span>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </header>
  );
}
