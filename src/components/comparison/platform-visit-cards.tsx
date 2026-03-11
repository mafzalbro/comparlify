import { ManagedImage } from "@/components/managed-image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Platform } from "@prisma/client";

interface PlatformVisitCardsProps {
  platformA: Platform;
  platformB: Platform;
}

export function PlatformVisitCards({
  platformA,
  platformB,
}: PlatformVisitCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-24">
      {[platformA, platformB].map((platform, idx) => (
        <div
          key={platform.id}
          className={`p-10 rounded-[2.5rem] border shadow-2xl flex flex-col justify-between group h-full ${
            idx === 0
              ? "bg-card border-primary/20 shadow-primary/5"
              : "bg-secondary/40 border-border/10"
          }`}
        >
          <div>
            <ManagedImage
              src={platform.logoUrl}
              alt={platform.name}
              width={140}
              height={50}
              className="h-12 w-auto mb-10 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter leading-none italic">
              Try {platform.name} →
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-12 font-medium">
              {platform.description
                ? platform.description.slice(0, 140) + "..."
                : `Explore ${platform.name} and see if it fits your course creation needs.`}
            </p>
          </div>
          <Button
            asChild
            className={`w-full rounded-[2rem] py-10 text-xs font-black uppercase tracking-widest gap-4 transition-all hover:scale-[1.05] ${
              idx === 0
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                : "bg-foreground text-background shadow-xl"
            }`}
          >
            {/* Route through our affiliate tracker */}
            <a
              href={`/api/out/${platform.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Official Site <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
}
