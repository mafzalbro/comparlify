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
    <section className="bg-background border-2 border-primary/20 p-1 rounded-[3rem] shadow-2xl relative overflow-hidden group">
      <div className="bg-primary/5 p-10 md:p-14 rounded-[2.8rem] border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-12 -translate-y-12 transition-transform duration-1000 group-hover:scale-110">
          <Target className="h-64 w-64" />
        </div>
        <div className="relative z-10 space-y-10">
          <div className="flex flex-wrap items-center gap-4">
            <Badge className="bg-primary px-8 py-3 rounded-full text-primary-foreground text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl border-none">
              Final Verdict
            </Badge>
            {!isCloseCall && (
              <Badge
                variant="outline"
                className="px-6 py-2.5 rounded-full border-primary/40 text-primary text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
              >
                Our Pick: {winner}
              </Badge>
            )}
            {isCloseCall && (
              <Badge
                variant="outline"
                className="px-6 py-2.5 rounded-full border-amber-500/40 text-amber-500 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
              >
                Closely Matched
              </Badge>
            )}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter leading-[1.1]">
            The Authoritative <br />
            <span className="text-primary italic">Verdict.</span>
          </h2>
          <MarkdownContent 
            content={conclusion} 
          />
        </div>
      </div>
    </section>
  );
}
