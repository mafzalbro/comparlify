"use client";

import React from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Zap, 
  Activity,
  Award,
  ChevronRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface VectorScores {
    financial: number;
    features: number;
    operational: number;
    migration: number;
}

interface ScoredPlatform {
    platformId: string;
    totalScore: number;
    monthlyCost: number;
    tierName: string;
    vectorScores: VectorScores;
    platform: {
        name: string;
        logoUrl: string;
        description: string;
    };
}

interface MatchResultsProps {
    results: ScoredPlatform[];
}

export function MatchResults({ results }: MatchResultsProps) {
    if (results.length === 0) return null;

    const topMatch = results[0];

    return (
        <div className="space-y-12 max-w-5xl mx-auto">
            {/* Top Match Hero */}
            <MotionDiv
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
            >
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-emerald-500 rounded-[3rem] blur opacity-20 animate-pulse" />
                <Card className="relative p-12 bg-card/60 backdrop-blur-3xl border border-primary/20 rounded-[3rem] overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="relative">
                            <div className="h-32 w-32 rounded-[2.5rem] bg-background border border-border/10 flex items-center justify-center p-6 shadow-2xl">
                                <img src={topMatch.platform.logoUrl} alt={topMatch.platform.name} className="h-full w-full object-contain" />
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
                                <Award className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest leading-none">
                                    Software Compatibility
                                </div>
                                <span className="text-3xl font-black italic text-primary">{topMatch.totalScore}%</span>
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter mb-4 leading-none">
                                {topMatch.platform.name} is your <br />
                                <span className="text-primary uppercase">Best Fit</span>
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-xl font-medium leading-relaxed italic opacity-80">
                                Based on your budget and technical needs, {topMatch.platform.name} is likely the most efficient choice for your business.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                             <div className="text-center mb-2">
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Estimated Cost</p>
                                 <p className="text-2xl font-black italic tracking-tighter">${topMatch.monthlyCost}<span className="text-[10px] font-bold opacity-60">/mo</span></p>
                                 <p className="text-[9px] font-bold text-primary uppercase">{topMatch.tierName} Plan</p>
                             </div>
                             <Link 
                                href={`/tools/roi-calculator?cp=${topMatch.platformId}&revenue=${5000}`}
                                className="px-10 py-5 rounded-full bg-primary text-black font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 w-full text-center"
                             >
                                 Verify Financials
                             </Link>
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 italic">Strategic Insight</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-border/10">
                        {Object.entries(topMatch.vectorScores).map(([key, value]) => (
                            <div key={key} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">{key} Score</span>
                                    <span className="text-xs font-black italic">{value}%</span>
                                </div>
                                <Progress value={value} className="h-1.5 bg-muted/20" />
                            </div>
                        ))}
                    </div>
                </Card>
            </MotionDiv>

            {/* Alternates Leaderboard */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <Activity className="h-5 w-5 text-primary opacity-50" />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Recommended <span className="text-muted-foreground not-italic uppercase tracking-widest text-sm">Alternatives</span></h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {results.slice(1, 5).map((r, idx) => (
                        <MotionDiv
                            key={r.platformId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-6 bg-card/40 backdrop-blur-3xl border border-border/10 hover:border-primary/20 transition-all group flex items-center justify-between rounded-[2rem]">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-background border border-border/5 flex items-center justify-center p-3 grayscale group-hover:grayscale-0 transition-all">
                                        <img src={r.platform.logoUrl} alt={r.platform.name} className="h-full w-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black tracking-tight mb-1 italic group-hover:text-primary transition-colors">{r.platform.name}</h4>
                                        <div className="flex items-center gap-4">
                                             <div className="flex items-center gap-1.5">
                                                 <ShieldCheck className="h-3 w-3 text-emerald-500 opacity-50" />
                                                 <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Score: {r.totalScore}%</span>
                                             </div>
                                             <div className="flex items-center gap-1.5">
                                                 <TrendingUp className="h-3 w-3 text-primary opacity-50" />
                                                 <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">High ROI</span>
                                             </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 px-8 border-x border-border/10 hidden md:flex">
                                    {Object.entries(r.vectorScores).map(([k, v]) => (
                                        <div key={k} className="text-center">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">{k.slice(0,3)}</p>
                                            <p className="text-[10px] font-black italic">{v}%</p>
                                        </div>
                                    ))}
                                </div>

                                <Link 
                                    href={`/compare/${r.platformId}`}
                                    className="p-4 rounded-2xl bg-muted/50 border border-border/10 hover:bg-primary hover:text-black hover:border-primary transition-all group"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Card>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </div>
    );
}
