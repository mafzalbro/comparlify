"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MotionDiv } from "@/components/motion-wrapper";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  platformName: string;
  reasons: string[];
  alternativeName: string;
  affiliateUrl?: string;
  matchPercentage?: number;
}

export function ResultCard({ 
  platformName, 
  reasons, 
  alternativeName, 
  affiliateUrl,
  matchPercentage = 85
}: ResultCardProps) {
  return (
    <div className="space-y-12 text-center relative z-10">
      {/* Header Logic Section */}
      <div className="flex flex-col items-center gap-6">
        <MotionDiv 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="relative h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-12 ring-primary/5"
        >
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          <div className="absolute -top-3 -right-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 ring-2 ring-background">
            Primary Match
          </div>
        </MotionDiv>
        
        <div className="space-y-4">
          <Badge className="bg-muted text-muted-foreground border-none uppercase tracking-[0.4em] text-[9px] font-black px-6 py-2 rounded-full">
             Optimization Analysis Complete
          </Badge>
          <h3 className="text-4xl font-black md:text-7xl text-foreground tracking-tighter leading-[0.8]">
            Your best fit is <br className="md:hidden" />
            <span className="text-primary italic underline decoration-primary/10 underline-offset-12">{platformName}</span>
          </h3>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="max-w-xs mx-auto space-y-3">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
           <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Match Confidence</span>
           <span className="text-primary">{matchPercentage}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-0.5">
           <MotionDiv 
            initial={{ width: 0 }}
            animate={{ width: `${matchPercentage}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full bg-primary rounded-full"
           />
        </div>
      </div>
      
      {/* Reason Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {reasons.map((reason, i) => (
          <MotionDiv 
            key={i} 
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (i * 0.1) }}
            className="flex items-start gap-5 p-7 rounded-[2.5rem] bg-card border border-border text-left transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 group"
          >
            <div className="h-10 w-10 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:rotate-12 transition-all duration-500">
              <CheckCircle className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-1 pt-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-50">Match Logic #{i+1}</p>
               <p className="text-sm font-bold opacity-90 leading-relaxed">{reason}</p>
            </div>
          </MotionDiv>
        ))}
      </div>

      {/* Runner Up Section */}
      <MotionDiv 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="max-w-xl mx-auto p-1 rounded-[3rem] bg-muted"
      >
        <div className="bg-card/80 backdrop-blur-sm m-0.5 rounded-[2.9rem] p-8 space-y-4 border border-border shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 text-foreground/40" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Structural Runner-up</p>
          </div>
          <p className="text-2xl font-black uppercase tracking-tighter italic opacity-80">Consider <span className="text-foreground underline decoration-foreground/10">{alternativeName}</span></p>
          <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
            Secondary compatibility detected. Best for projects requiring high manual flexibility or a different cost overhead.
          </p>
        </div>
      </MotionDiv>

      {/* Final Action CTA */}
      <div className="flex flex-col gap-8 max-w-sm mx-auto pt-8">
        <div className="space-y-4">
          <Button size="xl" className="w-full rounded-4xl font-black text-xl h-20 shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground group overflow-hidden relative" asChild>
            <a href={affiliateUrl || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4">
              <span className="relative z-10 flex items-center gap-3">Deploy with {platformName} <ExternalLink className="h-6 w-6" /></span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
            </a>
          </Button>
          <div className="flex items-center justify-center gap-4 opacity-50">
             <div className="h-px bg-border flex-1"></div>
             <p className="text-[9px] font-black uppercase tracking-widest">Secure Handshake</p>
             <div className="h-px bg-border flex-1"></div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Verified Affiliate Link • No hidden costs</p>
      </div>
    </div>
  );
}

