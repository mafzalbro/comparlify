"use client";

import React from "react";
import { calculatePlatformScore, PlatformScorecard } from "@/lib/score-engine";
import { PlatformData } from "@/data/compare/types";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlatformScorecardCardProps {
  platform: Partial<PlatformData> & { name: string; logoUrl?: string };
  title?: string;
  className?: string;
}

export function PlatformScorecardCard({ platform, title, className = "" }: PlatformScorecardCardProps) {
  const scorecard: PlatformScorecard = calculatePlatformScore(platform);

  return (
    <div className={`bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl shadow-lg ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
              Verified Scorecard
            </Badge>
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" /> Audit 2026
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            {title || `${platform.name} Scorecard`}
          </h3>
        </div>

        {/* Overall Score Circle Badge */}
        <div className="flex items-center gap-3 bg-card/80 border border-border/50 p-3 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Comparlify Score</div>
            <div className="text-xs font-extrabold text-primary">Grade {scorecard.grade}</div>
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground font-black text-2xl shadow-md">
            {scorecard.overallScore}
          </div>
        </div>
      </div>

      <p className="text-sm font-medium text-muted-foreground mb-8 bg-secondary/20 p-4 rounded-xl border border-border/20">
        <Sparkles className="w-4 h-4 text-primary inline mr-2" />
        {scorecard.verdict}
      </p>

      {/* 5 Pillars Breakdown */}
      <div className="space-y-5">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>5-Pillar Architecture Audit</span>
          <span>Weight & Score</span>
        </div>

        {scorecard.pillars.map((pillar) => (
          <div key={pillar.key} className="space-y-1.5">
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
            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${(pillar.score / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
