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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-8 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                {platform.name} Intelligence Report
              </DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] font-bold uppercase">
                  Verified 2026
                </Badge>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase">
                  High Fidelity Data
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8">
          <div className="prose prose-invert max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 not-prose">
              <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-3 mb-4 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Best For
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                  High-intent creators looking for stable, scalable infrastructure with
                  robust automation.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-3 mb-4 text-amber-500">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Caveat
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                  Requires higher initial investment and may have a steeper learning
                  curve for non-technical users.
                </p>
              </div>
            </div>

            <ReactMarkdown
              components={{
                h2: ({ ...props }) => (
                  <h2
                    className="text-xl font-black uppercase tracking-tight mt-12 mb-6 text-primary flex items-center gap-3"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-lg font-bold uppercase tracking-tight mt-8 mb-4 text-foreground"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p className="text-muted-foreground leading-relaxed mb-6" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="text-muted-foreground mb-2" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary bg-primary/5 p-6 rounded-r-2xl italic my-8"
                    {...props}
                  />
                ),
              }}
            >
              {platform.description || "Intelligence data being compiled..."}
            </ReactMarkdown>

            <div className="mt-16 pt-12 border-t border-border/40 not-prose">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-center">
                Verdict & Strategic Fit
              </h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="block text-sm font-bold text-foreground mb-1">
                      Platform Maturity
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Enterprise-grade stability with 99.9% uptime and verified
                      security protocols.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="block text-sm font-bold text-foreground mb-1">
                      ROI Potential
                    </span>
                    <span className="text-xs text-muted-foreground">
                      High LTV extraction capabilities through advanced checkout and
                      automation funnels.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
