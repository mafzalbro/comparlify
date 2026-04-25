import React from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

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
    <section className="space-y-16">
      <div className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[11px]">
        <div className="w-12 h-px bg-primary/30" />
        Sovereign Intelligence Report
      </div>

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
        <div className="bg-primary/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border border-primary/10">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-tight mb-2">Expert Comparison Insight</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These reports represent the latest high-fidelity intelligence for both {platformAName} and {platformBName}.
              When choosing between them, consider the fundamental trade-off between <strong>{platformAName}'s</strong> core philosophy
              and <strong>{platformBName}'s</strong> strategic positioning. Review the "Verdict" sections above for the final expert recommendation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
