"use client";

import React from "react";
import { calculatePlatformScore, PlatformScorecard } from "@/lib/score-engine";
import { PlatformData } from "@/data/compare/types";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, Sparkles, CheckCircle2, XCircle, TrendingUp, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

interface PlatformScorecardCardProps {
  platform: Partial<PlatformData> & { name: string; logoUrl?: string };
  title?: string;
  className?: string;
  showDetails?: boolean;
}

export function PlatformScorecardCard({ platform, title, className = "", showDetails = true }: PlatformScorecardCardProps) {
  const scorecard: PlatformScorecard = calculatePlatformScore(platform);

  return (
    <div className={`bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl shadow-lg space-y-6 ${className}`}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
              Verified Scorecard
            </Badge>
            {scorecard.scoreTrend && (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{scorecard.scoreTrend.change6Months} pts (6 mo)
              </Badge>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            {title || `${platform.name} Scorecard`}
          </h3>
        </div>

        {/* Overall Score Circle Badge */}
        <div className="flex items-center gap-3 bg-card/80 border border-border/50 p-3 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-end gap-1">
              Comparlify Score
              <Link href="/methodology" aria-label="Score methodology">
                <HelpCircle className="w-3 h-3 text-muted-foreground/60 hover:text-primary" />
              </Link>
            </div>
            <div className="text-xs font-extrabold text-primary">Grade {scorecard.grade}</div>
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground font-black text-2xl shadow-md">
            {scorecard.overallScore}
          </div>
        </div>
      </div>

      <p className="text-xs md:text-sm font-medium text-muted-foreground bg-secondary/20 p-4 rounded-xl border border-border/20">
        <Sparkles className="w-4 h-4 text-primary inline mr-2" />
        {scorecard.verdict}
      </p>

      {/* 5 PILLARS WITH EVIDENCE EXPLANATIONS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>5-Pillar Architecture Audit</span>
          <span>Weight & Score</span>
        </div>

        {scorecard.pillars.map((pillar) => (
          <div key={pillar.key} className="space-y-1.5 p-3 rounded-2xl bg-secondary/10 border border-border/10">
            <div className="flex justify-between items-center text-sm">
              <span className="font-extrabold text-foreground flex items-center gap-1.5">
                {pillar.name}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label={`Info about ${pillar.name}`}>
                        <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs p-2.5">
                      {pillar.description} (Weight: {pillar.weightLabel})
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs font-bold text-muted-foreground">({pillar.weightLabel})</span>
                <span className="font-extrabold text-primary">{pillar.score}/5.0</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${(pillar.score / 5) * 100}%` }}
              />
            </div>

            {/* Evidence Callout */}
            <p className="text-[11px] text-muted-foreground/90 font-medium italic pt-1">
              "Why this score? {pillar.evidence}"
            </p>
          </div>
        ))}
      </div>

      {/* WHY CHOOSE / WHY NOT CHOOSE */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/20 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <span className="font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Why Choose {platform.name}?
            </span>
            <ul className="space-y-1 text-muted-foreground font-medium">
              {scorecard.whyChoose.map((point, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
            <span className="font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Why NOT Choose {platform.name}?
            </span>
            <ul className="space-y-1 text-muted-foreground font-medium">
              {scorecard.whyNotChoose.map((point, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* CREATOR FIT SCORES */}
      {showDetails && (
        <div className="pt-4 border-t border-border/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Creator Type Fit Ratings
            </span>
            <span className="text-[10px] font-semibold text-primary">Segment Match</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {scorecard.creatorFits.map((fit) => (
              <div key={fit.type} className="p-3 rounded-2xl bg-secondary/20 border border-border/20 text-center space-y-1">
                <div className="text-[10px] font-extrabold text-foreground truncate">{fit.label}</div>
                <div className="text-base font-black text-primary">{fit.score}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
