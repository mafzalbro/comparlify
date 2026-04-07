"use client";

import { useState, useEffect, useRef } from "react";
import {
  Answers,
  platformQuestions,
  calculatePlatformRecommendation,
  RecommendationResult,
} from "@/lib/platformLogic";
import { StepCard } from "./StepCard";
import { ResultCard } from "./ResultCard";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BrainCircuit,
  Mail,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MotionDiv, AnimatePresence } from "@/components/motion-wrapper";
import { cn } from "@/lib/utils";

interface PlatformPickerProps {
  platformA: { id: string; name: string; affiliateUrl?: string | null };
  platformB: { id: string; name: string; affiliateUrl?: string | null };
}

const STORAGE_KEY = "comparlify_picker_answers";

export function PlatformPicker({ platformA, platformB }: PlatformPickerProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for back
  const pickerRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved answers", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  const totalSteps = platformQuestions.length;

  const progress = showEmailCapture
    ? 92
    : result
      ? 100
      : ((step + 1) / (totalSteps + 1)) * 100;

  const currentQuestion = platformQuestions[step];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
    // Auto-advance for simple radio questions
    if (currentQuestion.id !== "features") {
      setTimeout(() => handleNext(), 300);
    }
  };

  const handleNext = () => {
    setDirection(1);
    if (step < totalSteps - 1) {
      setStep(step + 1);
      pickerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setShowEmailCapture(true);
    }
  };

  const handleShowResult = () => {
    const res = calculatePlatformRecommendation(answers);
    setResult(res);
    setShowEmailCapture(false);
    localStorage.removeItem(STORAGE_KEY);
    pickerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBack = () => {
    setDirection(-1);
    if (showEmailCapture) {
      setShowEmailCapture(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const reset = () => {
    setDirection(-1);
    setStep(0);
    setAnswers({});
    setEmail("");
    setShowEmailCapture(false);
    setResult(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const variant = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const winnerData = result?.winnerId === platformA.id ? platformA : platformB;

  return (
    <div ref={pickerRef} className="container max-w-6xl mx-auto px-4">
      <Card className="relative p-1 md:p-1 overflow-hidden bg-black/5 dark:bg-white/5 border-none rounded-[3.5rem] shadow-2xl">
        {/* Animated Inner Container */}
        <div className="bg-card m-0.5 rounded-[3.4rem] p-8 md:p-16 relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5 shadow-inner">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 p-12 text-black/5 dark:text-white/5 select-none pointer-events-none -rotate-12 translate-x-12 -translate-y-12">
            <BrainCircuit className="h-64 w-64" />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            {!result ? (
              <MotionDiv
                key={showEmailCapture ? "email" : `step-${step}`}
                custom={direction}
                variants={variant}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-12 relative z-10"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors uppercase tracking-[0.4em] text-[10px] font-black px-6 py-2 rounded-full">
                      <Target className="h-3 w-3 mr-2" /> Match Engine v2.0
                    </Badge>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] max-w-2xl">
                    Discover your <br />
                    <span className="text-primary italic underline decoration-primary/20 underline-offset-8">
                      high-velocity
                    </span>{" "}
                    stack
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {showEmailCapture
                        ? "Finalizing Report"
                        : `Phase ${step + 1} of ${totalSteps}`}
                    </span>
                    <span className="font-mono">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-1.5 rounded-full bg-primary/5 [&>div]:bg-primary transition-all duration-700"
                  />
                </div>

                <div className="min-h-[320px]">
                  {showEmailCapture ? (
                    <div className="space-y-8 max-w-xl">
                      <div className="space-y-4 text-left">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-black px-3 py-1 bg-background/5 border-none uppercase tracking-widest text-foreground/60"
                        >
                          Optional Protocol
                        </Badge>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">
                          Secure your{" "}
                          <span className="text-primary">Decision Matrix.</span>
                        </h3>
                        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                          We'll transmit your customized strategy and our
                          "Scaling Infrastructure" guide to your professional
                          vector.
                        </p>
                      </div>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 group-focus-within:text-primary group-focus-within:scale-110 transition-all" />
                        <Input
                          type="email"
                          placeholder="professional@creator.io"
                          className="h-16 pl-14 text-lg rounded-3xl border-input focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all outline-none bg-background/50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
                        Zero redundancy. Periodic high-signal updates only.
                      </p>
                    </div>
                  ) : (
                    <StepCard
                      question={currentQuestion}
                      selectedValue={answers[currentQuestion.id] as string}
                      onChange={handleAnswer}
                    />
                  )}
                </div>

                <div className="flex justify-between items-center pt-10 border-t border-black/5">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 0 && !showEmailCapture}
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8 hover:bg-black/5 transition-all active:scale-95 disabled:opacity-20"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back-step
                  </Button>
                  <Button
                    onClick={showEmailCapture ? handleShowResult : handleNext}
                    disabled={
                      !showEmailCapture && !answers[currentQuestion?.id]
                    }
                    className="rounded-2xl font-black uppercase tracking-widest text-[11px] h-14 bg-foreground text-background hover:bg-foreground/90 px-12 transition-all active:scale-95 shadow-xl shadow-black/10 group overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {showEmailCapture
                        ? "Execute Matching"
                        : step === totalSteps - 1
                          ? "Initialize Result"
                          : "Proceed"}
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-white/10 to-primary/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                  </Button>
                </div>
              </MotionDiv>
            ) : (
              <MotionDiv
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10"
              >
                <ResultCard
                  platformName={result.winnerName}
                  alternativeName={result.alternativeName}
                  reasons={result.reasons}
                  affiliateUrl={winnerData?.affiliateUrl || undefined}
                />
                <div className="pt-12 flex flex-col items-center gap-6">
                  <Button
                    variant="ghost"
                    onClick={reset}
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 hover:bg-black/5 group border border-black/5"
                  >
                    <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-1000 ease-in-out" />{" "}
                    Re-run Algorithm
                  </Button>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Tool Trust Footer */}
      <div className="mt-8 flex flex-wrap justify-center gap-10 opacity-30 grayscale transition-all hover:grayscale-0 hover:opacity-100 duration-1000">
        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
          <Target className="h-4 w-4" /> 98.4% Match Rate
        </div>
        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
          <BrainCircuit className="h-4 w-4" /> Adaptive Logic
        </div>
      </div>
    </div>
  );
}
