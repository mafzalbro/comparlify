"use client";

import React, { useState } from "react";
import { PlatformData } from "@/data/compare/types";
import { calculatePersonalMatchScore, calculatePlatformScore, UserPillarWeights } from "@/lib/score-engine";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Sliders, ShieldCheck } from "lucide-react";

interface PersonalizedMatchCardProps {
  platform: Partial<PlatformData> & { name: string; logoUrl?: string };
  className?: string;
}

export function PersonalizedMatchCard({ platform, className = "" }: PersonalizedMatchCardProps) {
  const [userWeights, setUserWeights] = useState<UserPillarWeights>({
    featuresWeight: 50,
    valueWeight: 50,
    sovereigntyWeight: 50,
    uxWeight: 50,
    integrationsWeight: 50,
  });

  const objectiveScorecard = calculatePlatformScore(platform);
  const personalMatchScore = calculatePersonalMatchScore(platform, userWeights);

  const sliders = [
    { key: "valueWeight" as const, label: "Pricing & Margin ROI", desc: "Low monthly fees & 0% revenue take" },
    { key: "sovereigntyWeight" as const, label: "Data & Code Sovereignty", desc: "Full exportability & custom domain code" },
    { key: "featuresWeight" as const, label: "Feature Depth & Automation", desc: "Native workflows & video hosting" },
    { key: "uxWeight" as const, label: "Ease of Use & Dashboard UX", desc: "Minimal learning curve & fast setup" },
    { key: "integrationsWeight" as const, label: "Ecosystem & API Webhooks", desc: "Zapier, REST APIs, & webhooks" },
  ];

  return (
    <div className={`bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl shadow-lg space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/20">
        <div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-1">
            Personalized Decision Engine
          </Badge>
          <h3 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" /> Personal Match Score for {platform.name}
          </h3>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Objective Comparlify Score ({objectiveScorecard.overallScore}) vs. Personalized Match for YOUR workflow.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 p-3 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase text-muted-foreground">Your Match</div>
            <div className="text-xs font-extrabold text-primary">Personal Fit</div>
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground font-black text-2xl shadow-md">
            {personalMatchScore}%
          </div>
        </div>
      </div>

      {/* SLIDERS MATRIX */}
      <div className="space-y-5">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Adjust Your Priority Weights
        </div>

        {sliders.map((s) => (
          <div key={s.key} className="space-y-2 p-3.5 rounded-2xl bg-secondary/10 border border-border/10">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-foreground">{s.label}</span>
                <span className="text-[10px] text-muted-foreground block">{s.desc}</span>
              </div>
              <span className="font-mono font-bold text-primary">{userWeights[s.key]}%</span>
            </div>
            <Slider
              value={[userWeights[s.key]]}
              min={0}
              max={100}
              step={5}
              onValueChange={(val) => setUserWeights((prev) => ({ ...prev, [s.key]: val[0] }))}
              className="py-1"
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground font-medium italic bg-secondary/20 p-3.5 rounded-xl border border-border/20">
        <Sparkles className="w-3.5 h-3.5 text-primary inline mr-1.5" />
        {personalMatchScore >= 88
          ? `${platform.name} is an exceptional match for your specific priorities (${personalMatchScore}% fit).`
          : personalMatchScore >= 78
          ? `${platform.name} offers a strong overall fit (${personalMatchScore}% match), though minor trade-offs exist.`
          : `${platform.name} scored ${personalMatchScore}% for your weighted priorities; explore alternatives for higher alignment.`}
      </p>
    </div>
  );
}
