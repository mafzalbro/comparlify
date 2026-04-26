import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/breadcrumb";
import { ManagedImage } from "@/components/managed-image";
import { BookmarkButton } from "@/components/bookmark-button";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { PlatformIntelligenceModal } from "./platform-intelligence-modal";
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
    <PageHero
      title={
        <>
          {platformA.name} <br />
          <span className="text-primary italic drop-shadow-sm font-black lowercase">
            vs
          </span>{" "}
          <br />
          {platformB.name}
        </>
      }
      subtitle={summary}
    >
      <div className="flex flex-col items-center">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Comparisons", href: "/compare" },
            { name: title },
          ]}
          className="mb-12 justify-center"
        />

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
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

        {/* Platform Showdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl bg-card/40 backdrop-blur-3xl p-8 rounded-4xl border border-border/10 shadow-2xl relative mb-24">
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
                    className="absolute -top-4 -right-4 z-30 bg-primary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl ring-4 ring-background"
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
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">
                      {platform.name}
                    </h3>
                    <PlatformIntelligenceModal
                      platformName={platform.name}
                      description={platform.description}
                      triggerClassName="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors"
                    />
                  </div>
                  <Badge className="mt-4 bg-secondary/50 text-muted-foreground text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none">
                    Expert Assessment
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-6 right-6 lg:top-32 lg:bottom-auto z-[100] flex flex-col items-center gap-4 hidden sm:flex">
          {session?.user && (
            <div className="group flex flex-col items-center">
              <BookmarkButton
                comparisonId={comparisonId}
                className="h-14 w-14 rounded-full shadow-2xl bg-card border border-border/50 hover:scale-110 transition-all duration-300 p-0 flex items-center justify-center text-muted-foreground hover:text-primary"
                showText={false}
              />
            </div>
          )}
          <div className="group flex flex-col items-center">
            <ShareButton className="h-14 w-14 rounded-full shadow-2xl bg-card border border-border/50 hover:scale-110 transition-all duration-300 flex items-center justify-center text-muted-foreground hover:text-primary" />
          </div>
        </div>
      </div>
    </PageHero>
  );
}
