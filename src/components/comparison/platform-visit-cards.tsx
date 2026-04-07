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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-24">
      {[platformA, platformB].map((platform, idx) => {
        const platformPros = Array.isArray(platform.pros) ? platform.pros : [];
        const platformCons = Array.isArray(platform.cons) ? platform.cons : [];

        return (
          <div
            key={platform.id}
            className={`p-10 rounded-[2.5rem] border shadow-2xl flex flex-col justify-between group h-full transition-all hover:translate-y-[-4px] ${
              idx === 0
                ? "bg-card border-primary/20 shadow-primary/5"
                : "bg-secondary/40 border-border/10"
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-10">
                <ManagedImage
                  src={platform.logoUrl ?? ""}
                  alt={platform.name}
                  width={140}
                  height={50}
                  className="h-10 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                {platform.dealDescription && (
                  <div className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{platform.dealDescription}</span>
                  </div>
                )}
                {platform.lastVerifiedAt && (
                   <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 shrink-0">
                    <ShieldCheck className="h-3 w-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                  </div>
                )}
              </div>

              <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter leading-none italic">
                Get Started with {platform.name}
              </h3>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">The Pros</h4>
                  {platformPros.map((pro: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-[11px] font-bold text-muted-foreground leading-tight">{pro}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">The Cons</h4>
                  {platformCons.map((con: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-rose-500 mt-0.5 shrink-0" />
                      <span className="text-[11px] font-bold text-muted-foreground leading-tight">{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              asChild
              className={`w-full rounded-4xl py-10 text-xs font-black uppercase tracking-widest gap-4 transition-all hover:scale-[1.05] ${
                idx === 0
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                  : "bg-foreground text-background shadow-xl"
              }`}
            >
              <a
                href={`/api/out/${platform.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Claim Exclusive Deal <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

