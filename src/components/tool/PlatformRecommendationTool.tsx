"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateTopRecommendations,
  Answers,
  ScoredResult,
  platformRegistry,
} from "@/lib/platformLogic";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Share2,
  ExternalLink,
  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "budget",
    title: "Monthly Budget",
    description: "What is your target investment for platform fees?",
    options: [
      { value: "low", label: "Low", detail: "Under $50/mo" },
      { value: "medium", label: "Medium", detail: "$50 - $150/mo" },
      { value: "high", label: "High", detail: "$150+/mo" },
    ],
  },
  {
    id: "skill",
    title: "Technical Skill",
    description: "How much experience do you have with tech tools?",
    options: [
      { value: "beginner", label: "Beginner", detail: "Plug & play only" },
      {
        value: "intermediate",
        label: "Intermediate",
        detail: "Comfortable with settings",
      },
      { value: "advanced", label: "Advanced", detail: "I want full control" },
    ],
  },
  {
    id: "goal",
    title: "Primary Goal",
    description: "What are you primarily trying to build?",
    options: [
      {
        value: "simple",
        label: "Simple Course",
        detail: "Single course / offer",
      },
      {
        value: "membership",
        label: "Membership",
        detail: "Recurring community",
      },
      {
        value: "business",
        label: "Full Business",
        detail: "Email, Funnels & Courses",
      },
    ],
  },
  {
    id: "features",
    title: "Key Features",
    description: "Select the specific tools you need (Multi-select)",
    type: "multiselect",
    options: [
      { value: "email marketing", label: "Email Marketing", detail: "" },
      { value: "funnel builder", label: "Funnel Builder", detail: "" },
      { value: "affiliate system", label: "Affiliate System", detail: "" },
    ],
  },
];

function ToolContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    budget: "medium",
    skill: "beginner",
    goal: "simple",
    features: [],
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<ScoredResult[] | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync with URL params
  useEffect(() => {
    const budget = searchParams.get("budget") as any;
    const skill = searchParams.get("skill") as any;
    const goal = searchParams.get("goal") as any;
    const features = searchParams.get("features")?.split(",") || [];

    if (budget || skill || goal) {
      setAnswers((prev) => ({
        ...prev,
        ...(budget && { budget }),
        ...(skill && { skill }),
        ...(goal && { goal }),
        features: features.filter(Boolean),
      }));

      // If all params present, trigger calculation automatically
      if (budget && skill && goal) {
        handleCalculate({
          budget,
          skill,
          goal,
          features: features.filter(Boolean),
        });
      }
    }
  }, [searchParams]);

  const updateAnswers = (key: keyof Answers, value: any) => {
    if (key === "features") {
      const current = (answers.features as string[]) || [];
      const next = current.includes(value)
        ? current.filter((f: string) => f !== value)
        : [...current, value];
      setAnswers({ ...answers, features: next });
    } else {
      setAnswers({ ...answers, [key]: value });
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleCalculate(answers);
    }
  };

  const handleCalculate = (finalAnswers: Answers) => {
    setIsCalculating(true);
    // Update URL
    const params = new URLSearchParams();
    params.set(
      "budget",
      Array.isArray(finalAnswers.budget)
        ? finalAnswers.budget[0]
        : finalAnswers.budget,
    );
    params.set(
      "skill",
      Array.isArray(finalAnswers.skill)
        ? finalAnswers.skill[0]
        : finalAnswers.skill,
    );
    params.set(
      "goal",
      Array.isArray(finalAnswers.goal)
        ? finalAnswers.goal[0]
        : finalAnswers.goal,
    );
    if (
      Array.isArray(finalAnswers.features) &&
      finalAnswers.features.length > 0
    ) {
      params.set("features", finalAnswers.features.join(","));
    }
    router.push(`?${params.toString()}`, { scroll: false });

    setTimeout(() => {
      const res = calculateTopRecommendations(finalAnswers);
      setResults(res);
      setIsCalculating(false);
    }, 1500); // Simulate calculation
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (results) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tight">
            Your Top Matches
          </h2>
          <p className="text-muted-foreground font-medium">
            Based on your specific needs, here are the best fits.
          </p>
        </div>

        <div className="grid gap-6">
          {results.map((res, i) => (
            <div
              key={res.platform.id}
              className={`p-6 md:p-8 rounded-2xl border transition-all hover:shadow-xl ${
                i === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-card-foreground"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  {i === 0 && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-2 py-0.5 rounded">
                      Best Fit
                    </span>
                  )}
                  <h3 className="text-2xl font-black">{res.platform.name}</h3>
                </div>
                <div
                  className={`text-2xl font-black ${i === 0 ? "text-white" : "text-black"}`}
                >
                  {res.matchPercentage}%
                </div>
              </div>

              <p
                className={`text-sm mb-8 leading-relaxed font-medium ${i === 0 ? "opacity-90" : "text-muted-foreground"}`}
              >
                <span className="font-bold underline decoration-current underline-offset-4 mr-2 italic">
                  Best for you because:
                </span>
                {res.reason}
              </p>

              <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(res.categoryScores).map(([cat, score]) => (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between items-end text-[8px] font-black uppercase tracking-widest opacity-60">
                      <span>{cat}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          i === 0 ? "bg-white" : "bg-primary"
                        )}
                        style={{ width: `${(score / (cat === 'features' ? 10 : 35)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={res.platform.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 ${
                    i === 0
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  Visit Platform <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {copied ? "Link Copied" : "Share these results"}
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setResults(null);
              setStep(0);
              router.push(window.location.pathname);
            }}
            className="text-[10px] font-black uppercase tracking-widest bg-muted hover:bg-muted/80 px-6 py-3 rounded-xl"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  return (
    <div className="max-w-[800px] mx-auto min-h-[600px] flex flex-col">
      {/* Progress */}
      <div className="mb-12 space-y-4">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <span>Match in progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isCalculating ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
          <Loader2 className="h-12 w-12 animate-spin text-black/20" />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight">
              Finding your matches...
            </h3>
            <p className="text-muted-foreground text-sm font-medium">
              Scoring {platformRegistry.length} platforms based on your profile.
            </p>
          </div>
        </div>
      ) : (
        <div
          key={step}
          className="flex-1 animate-in fade-in slide-in-from-right-8 duration-500 ease-out flex flex-col"
        >
          <div className="mb-10 space-y-2">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              {currentStep.title}
            </h2>
            <p className="text-muted-foreground font-medium text-lg">
              {currentStep.description}
            </p>
          </div>

          <div className="grid gap-4 mb-10">
            {currentStep.options.map((opt) => {
              const isSelected = Array.isArray(
                answers[currentStep.id as keyof Answers],
              )
                ? (
                    answers[currentStep.id as keyof Answers] as string[]
                  ).includes(opt.value)
                : answers[currentStep.id as keyof Answers] === opt.value;

              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    updateAnswers(currentStep.id as keyof Answers, opt.value)
                  }
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 text-left transition-all duration-300 group ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                      : "border-border hover:border-primary/20 hover:bg-muted"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="block font-black uppercase tracking-tight text-lg">
                      {opt.label}
                    </span>
                    {opt.detail && (
                      <span
                        className={`text-xs font-medium ${isSelected ? "opacity-70" : "text-muted-foreground"}`}
                      >
                        {opt.detail}
                      </span>
                    )}
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-10 border-t border-border flex justify-between items-center">
            <button
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-opacity ${
                step === 0
                  ? "opacity-0 pointer-events-none"
                  : "hover:text-primary"
              }`}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleNext}
              className="bg-primary text-primary-foreground px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2"
            >
              {step === STEPS.length - 1 ? "Get Results" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlatformRecommendationTool() {
  return (
    <div className="py-24 px-4 bg-background min-h-screen text-foreground font-sans selection:bg-primary/20 selection:text-foreground">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-24">
            <Loader2 className="animate-spin" />
          </div>
        }
      >
        <ToolContent />
      </Suspense>
    </div>
  );
}
