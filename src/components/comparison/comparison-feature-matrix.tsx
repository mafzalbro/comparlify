"use client";

import { MotionDiv } from "@/components/motion-wrapper";
import { CheckCircle, XCircle } from "lucide-react";

interface FeatureRow {
  id: string;
  name: string;
  value1: string;
  value2: string;
}

interface ComparisonFeatureMatrixProps {
  features: FeatureRow[];
  platformAName: string;
  platformBName: string;
}

export function ComparisonFeatureMatrix({
  features,
  platformAName,
  platformBName,
}: ComparisonFeatureMatrixProps) {
  if (features.length === 0) return null;

  const isSupported = (val: string) =>
    val.toLowerCase() !== "not included" && val !== "";

  return (
    <section className="space-y-16">
      <div className="flex items-center justify-between gap-10 border-b border-border/10 pb-8">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Feature <span className="text-primary italic">Deep Dive</span>
        </h2>
        <span className="hidden sm:inline-flex items-center px-6 py-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-black tracking-widest">
          Technical Assessment
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {features.map((feature, idx) => (
          <MotionDiv
            key={feature.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="p-8 rounded-[2rem] bg-card/40 backdrop-blur-3xl border border-border/10 shadow-lg relative overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-full md:w-1/3 lg:w-1/4">
                <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-tight">
                  {feature.name}
                </h3>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-8 w-full">
                {[
                  {
                    name: platformAName,
                    value: feature.value1,
                    hoverClass: "group-hover:bg-primary/5",
                  },
                  {
                    name: platformBName,
                    value: feature.value2,
                    hoverClass: "group-hover:bg-blue-500/5",
                  },
                ].map(({ name, value, hoverClass }) => (
                  <div
                    key={name}
                    className={`p-6 rounded-[2rem] bg-background/40 border border-border/10 ${hoverClass} transition-all`}
                  >
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      {isSupported(value) ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-destructive/60 shrink-0" />
                      )}
                      {name}
                    </p>
                    <div className="text-base font-black text-foreground italic">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}
