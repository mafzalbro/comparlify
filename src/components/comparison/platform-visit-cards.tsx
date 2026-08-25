import { ManagedImage } from "@/components/managed-image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, XCircle, Sparkles, ShieldCheck } from "lucide-react";

interface PlatformWithExtras {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  dealDescription: string | null;
  pros: any;
  cons: any;
  lastVerifiedAt: Date | string | null;
}

interface PlatformVisitCardsProps {
  platformA: PlatformWithExtras;
  platformB: PlatformWithExtras;
}

export function PlatformVisitCards({
  platformA,
  platformB,
}: PlatformVisitCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
      {[platformA, platformB].map((platform, idx) => {
        const platformPros = Array.isArray(platform.pros) ? platform.pros : [];
        const platformCons = Array.isArray(platform.cons) ? platform.cons : [];

        return (
          <div
            key={platform.id}
            className={`p-6 rounded-2xl border shadow-md flex flex-col justify-between group h-full transition-all backdrop-blur-md ${
              idx === 0
                ? "bg-card/40 border-primary/30"
                : "bg-card/40 border-border/40 hover:border-border/60"
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <ManagedImage
                  src={platform.logoUrl ?? ""}
                  alt={platform.name}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain transition-all duration-300"
                />
                {platform.dealDescription && (
                  <div className="bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">{platform.dealDescription}</span>
                  </div>
                )}
                {platform.lastVerifiedAt && (
                   <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full px-3 py-1 flex items-center gap-1.5 shrink-0">
                    <ShieldCheck className="h-3 w-3" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Verified</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-extrabold mb-4 italic tracking-tight">
                Get Started with {platform.name}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 mb-1">The Pros</h4>
                  {platformPros.map((pro: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-[11px] font-medium text-muted-foreground leading-tight">{pro}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 mb-1">The Cons</h4>
                  {platformCons.map((con: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <XCircle className="h-3 w-3 text-rose-500 mt-0.5 shrink-0" />
                      <span className="text-[11px] font-medium text-muted-foreground leading-tight">{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              asChild
              className={`w-full rounded-xl py-5 text-xs font-extrabold uppercase tracking-widest gap-2 transition-all hover:scale-102 ${
                idx === 0
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-foreground text-background shadow-md"
              }`}
            >
              <a
                href={`/api/out/${platform.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Claim Exclusive Deal <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

