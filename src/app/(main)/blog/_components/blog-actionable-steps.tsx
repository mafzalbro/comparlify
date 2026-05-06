"use client";

import { CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ChecklistItem {
  item: string;
  description?: string;
}

interface BlogActionableStepsProps {
  steps: ChecklistItem[];
}

export function BlogActionableSteps({ steps }: BlogActionableStepsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="bg-card/50 backdrop-blur-3xl border border-border/10 rounded-[3rem] p-8 md:p-12 my-16 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">
            <CheckCircle2 className="h-4 w-4" />
            Actionable Intelligence
          </div>
          <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">
            Implementation <span className="text-blue-500 italic">Checklist</span>
          </h3>
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group flex items-start gap-6 p-6 rounded-3xl bg-background/40 border border-transparent hover:border-blue-500/20 transition-all hover:bg-background/80"
          >
            <div className="pt-1">
              <Checkbox id={`step-${index}`} className="h-6 w-6 rounded-lg border-2 border-blue-500/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`step-${index}`}
                className="text-lg font-black text-foreground cursor-pointer group-hover:text-blue-500 transition-colors uppercase tracking-tight"
              >
                {step.item}
              </Label>
              {step.description && (
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
