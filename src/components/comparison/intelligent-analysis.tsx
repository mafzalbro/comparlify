"use client";

import React, { useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Briefcase,
  TrendingUp,
  FileSearch,
  Zap,
  BarChart4,
  Cpu,
  Layers,
  Lock,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface IntelligentAnalysisProps {
  content: string;
  platformA?: any;
  platformB?: any;
  comparison?: any;
}

export const IntelligentAnalysis: React.FC<IntelligentAnalysisProps> = ({
  content,
  platformA,
  platformB,
  comparison
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!content) return null;

  // Split content into logical sections if possible for UX
  // Assuming sections start with ##
  const sections = content.split(/(?=^## )/m);

  return (
    <section className="mt-24 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/10 pb-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[11px]">
            <div className="w-12 h-px bg-primary/30" />
            Specialized Expert Intelligence
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
            Strategic <span className="text-primary italic">Divergence.</span>
          </h2>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full px-6 font-black uppercase tracking-widest text-[10px] h-12 gap-2 border-2"
        >
          {isExpanded ? (
            <>Collapse Report <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Expand Full Report <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      </div>

      <div className={cn(
        "transition-all duration-700 ease-in-out overflow-hidden",
        isExpanded ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        {sections.length > 1 ? (
          <Accordion type="multiple" defaultValue={sections.map((_, i) => `item-${i}`)} className="space-y-6">
            {sections.map((section, index) => {
              const lines = section.trim().split("\n");
              const title = lines[0].replace(/^## /, "").trim();
              const rest = lines.slice(1).join("\n");

              // Map icons to common titles
              let Icon = FileSearch;
              const lowTitle = title.toLowerCase();
              if (lowTitle.includes("scenario")) Icon = Target;
              if (lowTitle.includes("business") || lowTitle.includes("economic")) Icon = Briefcase;
              if (lowTitle.includes("strategic") || lowTitle.includes("intelligence")) Icon = Sparkles;
              if (lowTitle.includes("monetization") || lowTitle.includes("revenue")) Icon = TrendingUp;
              if (lowTitle.includes("logic") || lowTitle.includes("architecture")) Icon = Cpu;
              if (lowTitle.includes("experience") || lowTitle.includes("ux")) Icon = Zap;
              if (lowTitle.includes("data") || lowTitle.includes("analytics")) Icon = BarChart4;
              if (lowTitle.includes("sovereignty") || lowTitle.includes("privacy")) Icon = Lock;
              if (lowTitle.includes("ecosystem") || lowTitle.includes("marketplace")) Icon = Globe;
              if (lowTitle.includes("enterprise") || lowTitle.includes("scale")) Icon = Layers;

              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-none bg-card/40 backdrop-blur-3xl rounded-4xl p-2 px-8 overflow-hidden group hover:bg-primary/5 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline py-8">
                    <div className="flex items-center gap-4 text-left">
                      <div className="bg-primary/10 p-3 rounded-2xl group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-all">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-black uppercase tracking-tighter">{title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-12 text-lg">
                    <div className="prose prose-invert prose-lg max-w-none prose-headings:hidden">
                      <MarkdownContent content={rest} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="bg-card/40 backdrop-blur-3xl rounded-[3rem] p-12 border border-border/10 shadow-2xl">
            <div className="prose prose-invert prose-xl max-w-none">
              <MarkdownContent content={content} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
