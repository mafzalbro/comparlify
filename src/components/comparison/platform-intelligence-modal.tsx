"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Sparkles } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlatformIntelligenceModalProps {
  platformName: string;
  description: string;
  triggerClassName?: string;
}

export const PlatformIntelligenceModal: React.FC<PlatformIntelligenceModalProps> = ({
  platformName,
  description,
  triggerClassName,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={triggerClassName}
          aria-label={`View intelligence report for ${platformName}`}
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border-border/10 bg-card/95 backdrop-blur-2xl">
        <DialogHeader className="p-8 border-b border-border/5 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
                {platformName} <span className="text-primary italic">Intelligence.</span>
              </DialogTitle>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 mt-1">
                Sovereign Strategy Report
              </p>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 p-8">
          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary pb-12">
            <MarkdownContent content={description} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
