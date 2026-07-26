"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitCompareArrows, Zap, ShieldCheck } from "lucide-react";
import type { Platform } from "@prisma/client";
import { MotionDiv } from "@/components/motion-wrapper";

export function BattleSelector({ platforms }: { platforms: Platform[] }) {
  const router = useRouter();
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");

  const handleBattle = () => {
    if (a && b && a !== b) {
      // Find slugs for selected IDs
      const slugA = platforms
        .find((p) => p.id === a)
        ?.name.toLowerCase()
        .replace(/\s+/g, "-");
      const slugB = platforms
        .find((p) => p.id === b)
        ?.name.toLowerCase()
        .replace(/\s+/g, "-");
      router.push(`/compare/vs/${slugA}-vs-${slugB}`);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 md:p-10 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 shadow-sm relative overflow-hidden group mb-14"
    >
      <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 translate-x-6 -translate-y-6 group-hover:text-primary/10 transition-colors pointer-events-none">
        <GitCompareArrows className="h-32 w-32" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div className="flex-1 space-y-2">
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none text-foreground">
            Side-by-Side <span className="text-primary italic">Compare</span>
          </h3>
          <p className="text-xs md:text-sm font-medium text-muted-foreground max-w-md">
            Can&apos;t find what you need? Select any two platforms to see a
            detailed, data-driven comparison immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
          <div className="w-full sm:w-[220px]">
            <Select value={a} onValueChange={setA}>
              <SelectTrigger className="w-full h-11 rounded-full bg-accent-surface dark:bg-white/5 border border-border/40 focus:ring-primary shadow-none text-xs font-semibold px-5 text-foreground">
                <SelectValue placeholder="First Platform" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-border/40 bg-background max-h-[300px]">
                {platforms.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={p.id === b} className="text-xs font-semibold">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-black italic text-[10px] shrink-0">
            VS
          </div>

          <div className="w-full sm:w-[220px]">
            <Select value={b} onValueChange={setB}>
              <SelectTrigger className="w-full h-11 rounded-full bg-accent-surface dark:bg-white/5 border border-border/40 focus:ring-primary shadow-none text-xs font-semibold px-5 text-foreground">
                <SelectValue placeholder="Second Platform" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-border/40 bg-background max-h-[300px]">
                {platforms.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={p.id === a} className="text-xs font-semibold">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleBattle}
            disabled={!a || !b || a === b}
            size="lg"
            className="w-full sm:w-auto h-11 px-8 rounded-full font-bold gap-2 shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Zap className="h-4 w-4" /> Compare Now
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center lg:justify-start gap-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 border-t border-border/20 pt-4">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary/40" /> Real-time Data
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary/40" /> Feature Matrix Audit
        </div>
      </div>
    </MotionDiv>
  );
}
