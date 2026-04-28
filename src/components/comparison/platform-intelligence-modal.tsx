"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, ShieldCheck } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";

interface PlatformIntelligenceModalProps {
  name: string;
  description: string;
  trigger?: React.ReactNode;
}

export function PlatformIntelligenceModal({
  name,
  description,
  trigger,
}: PlatformIntelligenceModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="group flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300">
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border/50 shadow-2xl p-0 gap-0">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/10 p-6 md:p-10">
          <DialogHeader>
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              <ShieldCheck className="h-4 w-4" />
              Sovereign Intelligence Profile
            </div>
            <DialogTitle className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              {name}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
              In-depth architectural breakdown and strategic positioning
              analysis for {name}.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-8 md:p-12">
          <div className="prose prose-sm prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-li:text-muted-foreground">
            <MarkdownContent content={description} />
          </div>
        </div>
        <div className="p-6 bg-primary/5 border-t border-border/10">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center font-bold">
            Verified Intelligence Report • {new Date().getFullYear()} Cycle
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
