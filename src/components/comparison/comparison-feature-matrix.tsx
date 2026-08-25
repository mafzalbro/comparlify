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
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-6 border-b border-border/20 pb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Feature <span className="text-primary italic">Deep Dive</span>
        </h2>
        <span className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-extrabold tracking-widest">
          Technical Assessment
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {features.map((feature, idx) => (
          <MotionDiv
            key={feature.id}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.04 }}
            className="p-5 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors shadow-md relative overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row gap-4 items-start relative z-10">
              <div className="w-full md:w-1/3 lg:w-1/4">
                <h3 className="text-base font-extrabold tracking-tight text-foreground leading-snug">
                  {feature.name}
                </h3>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
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
                    className={`p-4 rounded-xl bg-background/50 border border-border/20 ${hoverClass} transition-all`}
                  >
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      {isSupported(value) ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-destructive/60 shrink-0" />
                      )}
                      {name}
                    </p>
                    <div className="text-sm font-extrabold text-foreground italic">
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
