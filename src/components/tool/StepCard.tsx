"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@/lib/platformLogic";
import { cn } from "@/lib/utils";
import { MotionDiv } from "@/components/motion-wrapper";
import { Check } from "lucide-react";

interface StepCardProps {
  question: Question;
  selectedValue?: string;
  onChange: (value: string) => void;
}

export function StepCard({ question, selectedValue, onChange }: StepCardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none text-foreground/80">
          {question.text}
        </h3>
        {question.category && (
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60">
            Dimensional Analysis: {question.category}
          </p>
        )}
      </div>

      <RadioGroup
        value={selectedValue}
        onValueChange={onChange}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {question.options.map((option, idx) => {
          const isSelected = selectedValue === option.value;

          return (
            <MotionDiv
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={cn(
                "relative group flex flex-col items-start p-5 border-2 rounded-3xl cursor-pointer transition-all duration-500 overflow-hidden",
                isSelected
                  ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 ring-4 ring-primary/5"
                  : "border-border bg-muted/30 hover:border-foreground/10 hover:bg-muted/50",
              )}
              onClick={() => onChange(option.value)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 w-full relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground/40",
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="font-black text-lg cursor-pointer transition-colors uppercase tracking-tight"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(option.value);
                      }}
                    >
                      {option.label}
                    </Label>
                  </div>
                </div>

                {option.description && (
                  <p
                    className={cn(
                      "text-xs font-semibold leading-relaxed transition-opacity duration-300",
                      isSelected
                        ? "text-primary/80"
                        : "text-muted-foreground opacity-70",
                    )}
                  >
                    {option.description}
                  </p>
                )}
              </div>

              {/* Decorative Gradient for Selected state */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 transition-all duration-700",
                  isSelected ? "bg-primary w-full" : "bg-transparent w-0",
                )}
              ></div>

              <RadioGroupItem
                value={option.value}
                id={`${question.id}-${option.value}`}
                className="sr-only" // Hidden but accessible
              />
            </MotionDiv>
          );
        })}
      </RadioGroup>
    </div>
  );
}
