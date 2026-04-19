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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 shadow-inner relative overflow-hidden group mb-20"
    >
      <div className="absolute top-0 right-0 p-10 text-primary/5 -rotate-12 translate-x-6 -translate-y-6 group-hover:text-primary/10 transition-colors">
        <GitCompareArrows className="h-40 w-40" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-2">
          <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">
            Side-by-Side <span className="text-primary italic">Compare</span>
          </h3>
          <p className="text-sm font-medium text-muted-foreground max-w-xs">
            Can&apos;t find what you need? Select any two platforms to see a
            detailed comparison.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Select value={a} onValueChange={setA}>
            <SelectTrigger className="w-full sm:w-[200px] h-14 rounded-2xl bg-background/50 border-border/10 focus:ring-primary shadow-xl">
              <SelectValue placeholder="First Platform" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/10">
              {platforms.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={p.id === b}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-black italic shadow-inner">
            VS
          </div>

          <Select value={b} onValueChange={setB}>
            <SelectTrigger className="w-full sm:w-[200px] h-14 rounded-2xl bg-background/50 border-border/10 focus:ring-primary shadow-xl">
              <SelectValue placeholder="Second Platform" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/10">
              {platforms.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={p.id === a}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleBattle}
            disabled={!a || !b || a === b}
            size="xl"
            className="w-full sm:w-auto h-14 px-10 rounded-2xl font-black gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.05] group/btn"
          >
            <Zap className="h-5 w-5 group-hover/btn:animate-pulse" /> Compare
            Now
          </Button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center md:justify-start gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary/40" /> Real-time Data
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary/40" /> Feature Matrix
          Audit
        </div>
      </div>
    </MotionDiv>
  );
}
