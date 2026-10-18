import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Platform } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface PlatformIntelligenceModalProps {
  platform: Platform;
  children: React.ReactNode;
}

export function PlatformIntelligenceModal({
  platform,
  children,
}: PlatformIntelligenceModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full max-w-4xl max-h-[90vh] h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl sm:rounded-3xl border border-border/50">
        <DialogHeader className="p-4 sm:p-6 md:p-8 pb-3 sm:pb-4 border-b shrink-0 pr-12">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight wrap-break-word">
                {platform.name} Intelligence Report
              </DialogTitle>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge
                  variant="outline"
                  className="text-[9px] sm:text-[10px] font-bold uppercase"
                >
                  Verified 2026
                </Badge>
                <Badge className="bg-primary/10 text-primary border-none text-[9px] sm:text-[10px] font-bold uppercase">
                  High Fidelity Data
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 overscroll-contain">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 not-prose">
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-emerald-500/5 border border-emerald-500/15">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-emerald-500">
                  <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Best For
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed">
                  High-intent creators looking for stable, scalable
                  infrastructure with robust automation.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-500/5 border border-amber-500/15">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-amber-500">
                  <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Caveat
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed">
                  Requires higher initial investment and may have a steeper
                  learning curve for non-technical users.
                </p>
              </div>
            </div>

            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-lg sm:text-2xl font-black tracking-tight mt-6 sm:mt-10 mb-4 text-foreground wrap-break-word"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-base sm:text-xl font-black uppercase tracking-tight mt-8 sm:mt-12 mb-4 sm:mb-6 text-primary flex items-center gap-2 sm:gap-3 wrap-break-word"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-sm sm:text-lg font-bold uppercase tracking-tight mt-6 sm:mt-8 mb-3 text-foreground wrap-break-word"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li
                    className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed"
                    {...props}
                  />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary bg-primary/5 p-4 sm:p-6 rounded-r-2xl italic my-6 text-xs sm:text-sm"
                    {...props}
                  />
                ),
                table: ({ ...props }) => (
                  <div className="w-full my-6 overflow-x-auto rounded-2xl border border-border/40 bg-card/40 shadow-xs overscroll-contain">
                    <table
                      className="w-full text-left text-xs border-collapse min-w-100"
                      {...props}
                    />
                  </div>
                ),
                th: ({ ...props }) => (
                  <th
                    className="bg-secondary/40 px-3 py-2.5 font-bold text-foreground border-b border-border/40 whitespace-nowrap text-[11px] uppercase tracking-wider"
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td
                    className="px-3 py-2.5 border-b border-border/20 text-muted-foreground whitespace-nowrap text-xs"
                    {...props}
                  />
                ),
              }}
            >
              {platform.description || "Intelligence data being compiled..."}
            </ReactMarkdown>

            <div className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-border/40 not-prose">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-6 sm:mb-8 text-center text-muted-foreground">
                Verdict &amp; Strategic Fit
              </h4>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/20">
                  <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-foreground mb-0.5">
                      Platform Maturity
                    </span>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Enterprise-grade stability with 99.9% uptime and verified
                      security protocols.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/20">
                  <Target className="h-4 sm:h-5 w-4 sm:w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-foreground mb-0.5">
                      ROI Potential
                    </span>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      High LTV extraction capabilities through advanced checkout
                      and automation funnels.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
