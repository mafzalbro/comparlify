"use client";

import React, { useState, useMemo } from "react";
import { PlatformData } from "@/data/compare/types";
import {
  calculatePersonalMatchScore,
  calculatePlatformScore,
  UserPillarWeights,
} from "@/lib/score-engine";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles,
  Sliders,
  Trophy,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { ManagedImage } from "@/components/managed-image";

interface InteractiveComparisonMatcherProps {
  platformA?: Partial<PlatformData> & { name?: string; logoUrl?: string };
  platformB?: Partial<PlatformData> & { name?: string; logoUrl?: string };
  className?: string;
}

const DEFAULT_WEIGHTS: UserPillarWeights = {
  featuresWeight: 50,
  valueWeight: 50,
  sovereigntyWeight: 50,
  uxWeight: 50,
  integrationsWeight: 50,
};

export function InteractiveComparisonMatcher({
  platformA,
  platformB,
  className = "",
}: InteractiveComparisonMatcherProps) {
  const [userWeights, setUserWeights] =
    useState<UserPillarWeights>(DEFAULT_WEIGHTS);

  // Normalize platform objects — guard against missing/null props
  const normalizedA = useMemo(
    () =>
      platformA && platformA.name
        ? { ...platformA, name: platformA.name }
        : null,
    [platformA],
  );

  const normalizedB = useMemo(
    () =>
      platformB && platformB.name
        ? { ...platformB, name: platformB.name }
        : null,
    [platformB],
  );

  // If we don't have both platforms, render a safe fallback
  if (!normalizedA || !normalizedB) {
    return (
      <div
        className={`bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl shadow-xl ${className}`}
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Sparkles className="w-5 h-5" />
          <p className="text-sm font-semibold">
            Comparison data unavailable. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // ---- Compute scores with full error isolation ----
  let objA: ReturnType<typeof calculatePlatformScore> | null = null;
  let objB: ReturnType<typeof calculatePlatformScore> | null = null;
  let matchA = 0;
  let matchB = 0;

  try {
    objA = calculatePlatformScore(normalizedA);
    matchA = calculatePersonalMatchScore(normalizedA, userWeights);
  } catch (err) {
    console.error(
      "[InteractiveComparisonMatcher] Failed to score platform A:",
      err,
    );
  }

  try {
    objB = calculatePlatformScore(normalizedB);
    matchB = calculatePersonalMatchScore(normalizedB, userWeights);
  } catch (err) {
    console.error(
      "[InteractiveComparisonMatcher] Failed to score platform B:",
      err,
    );
  }

  if (!objA || !objB) {
    return (
      <div
        className={`bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl shadow-xl ${className}`}
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Sparkles className="w-5 h-5" />
          <p className="text-sm font-semibold">
            Unable to calculate comparison scores. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const winner =
    matchA > matchB ? normalizedA : matchB > matchA ? normalizedB : null;
  const isClose = Math.abs(matchA - matchB) <= 2;

  const sliders = [
    {
      key: "valueWeight" as const,
      label: "Pricing & Margin ROI",
      desc: "Low monthly cost & 0% take fees",
    },
    {
      key: "sovereigntyWeight" as const,
      label: "Data & Code Sovereignty",
      desc: "Full CSV/JSON exports & custom domains",
    },
    {
      key: "featuresWeight" as const,
      label: "Feature Depth & Automation",
      desc: "Native tools & workflow rules",
    },
    {
      key: "uxWeight" as const,
      label: "Ease of Use & Dashboard UX",
      desc: "Fast onboarding & clean editor",
    },
    {
      key: "integrationsWeight" as const,
      label: "Ecosystem & Webhooks",
      desc: "Zapier, Make, & REST API access",
    },
  ];

  const handleSliderChange = (key: keyof UserPillarWeights, value: number) => {
    const safeValue = Number.isFinite(value) ? value : 50;
    setUserWeights((prev) => ({ ...prev, [key]: safeValue }));
  };

  return (
    <div
      className={`bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl shadow-xl space-y-8 ${className}`}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/20">
        <div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-2">
            Interactive Priority Engine
          </Badge>
          <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Sliders className="w-6 h-6 text-primary" /> Personal Match Matrix:{" "}
            {normalizedA.name} vs {normalizedB.name}
          </h3>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Adjust your 5-pillar priority weights below to recalculate your
            personalized winner in real-time.
          </p>
        </div>

        {/* WINNER BADGE */}
        {winner && !isClose ? (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl">
            <Trophy className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                Your Personal Match Winner
              </div>
              <div className="text-sm font-extrabold text-foreground">
                {winner.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 p-3.5 rounded-2xl">
            <Sparkles className="w-6 h-6 text-primary shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-primary">
                Priority Balance
              </div>
              <div className="text-sm font-extrabold text-foreground">
                Close Call Match
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COMPARISON SCORE SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PLATFORM A MATCH */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            winner?.name === normalizedA.name
              ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
              : "bg-secondary/20 border-border/20"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              {normalizedA.logoUrl && (
                <ManagedImage
                  src={normalizedA.logoUrl}
                  alt={normalizedA.name}
                  width={80}
                  height={28}
                  className="h-7 w-auto object-contain"
                />
              )}
              <span className="font-extrabold text-base text-foreground">
                {normalizedA.name}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-muted-foreground">
                Obj: {objA.overallScore}
              </span>
              <span className="text-xl font-black text-primary">{matchA}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${matchA}%` }}
            />
          </div>
        </div>

        {/* PLATFORM B MATCH */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            winner?.name === normalizedB.name
              ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
              : "bg-secondary/20 border-border/20"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              {normalizedB.logoUrl && (
                <ManagedImage
                  src={normalizedB.logoUrl}
                  alt={normalizedB.name}
                  width={80}
                  height={28}
                  className="h-7 w-auto object-contain"
                />
              )}
              <span className="font-extrabold text-base text-foreground">
                {normalizedB.name}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-muted-foreground">
                Obj: {objB.overallScore}
              </span>
              <span className="text-xl font-black text-primary">{matchB}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${matchB}%` }}
            />
          </div>
        </div>
      </div>

      {/* PRIORITY SLIDERS */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Customize Pillar Weight Multipliers
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sliders.map((s) => (
            <div
              key={s.key}
              className="p-3.5 rounded-2xl bg-secondary/10 border border-border/10 space-y-2"
            >
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-foreground">
                    {s.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {s.desc}
                  </span>
                </div>
                <span className="font-mono font-bold text-primary">
                  {userWeights[s.key]}%
                </span>
              </div>
              <Slider
                value={[userWeights[s.key]]}
                min={0}
                max={100}
                step={5}
                onValueChange={(val) =>
                  handleSliderChange(s.key, val?.[0] ?? 50)
                }
                className="py-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
