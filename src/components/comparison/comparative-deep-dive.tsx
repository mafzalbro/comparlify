"use client";

import React from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Info, ShieldCheck, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ComparativeDeepDiveProps {
  platformAName: string;
  platformBName: string;
  platformADescription: string;
  platformBDescription: string;
}

export const ComparativeDeepDive: React.FC<ComparativeDeepDiveProps> = ({
  platformAName,
  platformBName,
  platformADescription,
  platformBDescription,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center py-12">
          <Button 
            variant="outline" 
            className="group relative h-auto py-6 px-10 rounded-3xl border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-2xl shadow-primary/5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center gap-8">
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-[12px] font-black uppercase text-primary backdrop-blur-sm rotate-[-12deg] group-hover:rotate-0 transition-transform duration-500">
                  {platformAName[0]}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-[12px] font-black uppercase text-secondary-foreground backdrop-blur-sm rotate-[12deg] group-hover:rotate-0 transition-transform duration-500">
                  {platformBName[0]}
                </div>
              </div>
              
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-1 flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  Sovereign Intelligence
                </span>
                <span className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  {platformAName} vs {platformBName}
                  <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border/50 shadow-2xl p-0 gap-0">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/10 p-8 lg:p-12">
          <DialogHeader>
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[11px] mb-4">
              <div className="w-12 h-px bg-primary/30" />
              Sovereign Intelligence Report
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter sm:text-5xl lg:text-6xl mb-4">
              {platformAName} <span className="text-muted-foreground/20">/</span> {platformBName}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              Detailed architectural breakdown, philosophical differences, and strategic positioning analysis for the current market cycle.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 lg:p-12 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Platform A Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[9px] font-black px-4 py-1">
                  Architecture: {platformAName}
                </Badge>
              </div>
              <div className="prose prose-sm prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
                <MarkdownContent content={platformADescription} />
              </div>
            </div>

            {/* Platform B Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <Badge className="bg-secondary/10 text-secondary-foreground border-secondary-foreground/20 uppercase tracking-widest text-[9px] font-black px-4 py-1">
                  Architecture: {platformBName}
                </Badge>
              </div>
              <div className="prose prose-sm prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
                <MarkdownContent content={platformBDescription} />
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-border/10">
            <div className="bg-primary/5 rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-10 border border-primary/10">
              <div className="bg-primary/10 p-5 rounded-2xl shrink-0">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-3">Expert Comparison Insight</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These reports represent the latest high-fidelity intelligence for both {platformAName} and {platformBName}.
                  When choosing between them, consider the fundamental trade-off between <strong>{platformAName}'s</strong> core philosophy
                  and <strong>{platformBName}'s</strong> strategic positioning. Review the primary verdict sections for final expert recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
