import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/markdown-content";
import { Target } from "lucide-react";

interface IntelligenceVerdictProps {
  conclusion: string;
  platformAName: string;
  platformBName: string;
  isPlatformAWinner: boolean;
  isCloseCall: boolean;
}

export function IntelligenceVerdict({
  conclusion,
  platformAName,
  platformBName,
  isPlatformAWinner,
  isCloseCall,
}: IntelligenceVerdictProps) {
  const winner = isPlatformAWinner ? platformAName : platformBName;

  return (
    <section className="bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors p-6 rounded-2xl shadow-md relative overflow-hidden group">
      <div className="bg-primary/5 p-6 md:p-8 rounded-xl border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
          <Target className="h-48 w-48" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-primary px-5 py-2 rounded-full text-primary-foreground text-[10px] font-extrabold uppercase tracking-widest shadow-md border-none">
              Final Verdict
            </Badge>
            {!isCloseCall && (
              <Badge
                variant="outline"
                className="px-4 py-1.5 rounded-full border-primary/40 text-primary text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-xs"
              >
                Our Pick: {winner}
              </Badge>
            )}
            {isCloseCall && (
              <Badge
                variant="outline"
                className="px-4 py-1.5 rounded-full border-amber-500/40 text-amber-500 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-xs"
              >
                Closely Matched
              </Badge>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
            The Authoritative <span className="text-primary italic">Verdict.</span>
          </h2>
          <MarkdownContent 
            content={conclusion} 
          />
        </div>
      </div>
    </section>
  );
}
