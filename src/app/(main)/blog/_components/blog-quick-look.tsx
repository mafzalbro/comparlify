"use client";

import { Zap, Target } from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";

interface BlogQuickLookProps {
  keyTakeaways: string[];
}

export function BlogQuickLook({ keyTakeaways }: BlogQuickLookProps) {
  if (!keyTakeaways || keyTakeaways.length === 0) return null;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] p-8 md:p-10 mb-16 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
        <Target className="h-32 w-32" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">
            Quick Look Intelligence
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {keyTakeaways.map((takeaway, index) => (
            <div key={index} className="flex flex-col gap-4">
              <span className="text-4xl font-black text-primary/20 leading-none">0{index + 1}</span>
              <p className="text-foreground font-bold leading-relaxed tracking-tight">
                {takeaway}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MotionDiv>
  );
}
