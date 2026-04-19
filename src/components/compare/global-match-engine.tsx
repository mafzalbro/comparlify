"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, Target, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MotionDiv, AnimatePresence } from "@/components/motion-wrapper";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import type { Platform, Comparison } from "@prisma/client";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface GlobalMatchEngineProps {
  allPlatforms: Platform[];
  allComparisons: (Comparison & { platformA: Platform; platformB: Platform })[];
}

const questions = [
  {
    id: "primary_goal",
    text: "What is your primary focus?",
    options: [
      { label: "Community First", value: "community", tags: ["community", "skool", "circle"] },
      { label: "Structured Courses", value: "courses", tags: ["courses", "teachable", "thinkific"] },
      { label: "All-in-One Marketing", value: "allinone", tags: ["all-in-one", "kajabi", "podia"] },
      { label: "Digital Product Sales", value: "sales", tags: ["gumroad", "podia"] },
    ]
  },
  {
    id: "budget",
    text: "What is your monthly budget?",
    options: [
      { label: "Zero / Revenue Share", value: "zero", tags: ["gumroad", "teachable"] },
      { label: "Less than $50/mo", value: "low", tags: ["podia"] },
      { label: "$50 - $100/mo", value: "medium", tags: ["skool", "circle", "thinkific"] },
      { label: "$149+/mo", value: "high", tags: ["kajabi", "learnworlds", "mightynetworks"] },
    ]
  },
  {
    id: "tech_savviness",
    text: "How technical are you?",
    options: [
      { label: "Give me templates", value: "low", tags: ["podia", "teachable", "skool"] },
      { label: "I want to customize everything", value: "high", tags: ["kajabi", "circle", "learnworlds"] },
    ]
  }
];

export function GlobalMatchEngine({ allPlatforms, allComparisons }: GlobalMatchEngineProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  // Sync state from URL on mount and when navigating
  useEffect(() => {
    if (searchParams.get("wizard") === "true") {
      setIsOpen(true);
      const urlStep = parseInt(searchParams.get("step") || "0", 10);
      setStep(isNaN(urlStep) ? 0 : urlStep);
      setShowResult(searchParams.get("result") === "true");

      const parsedAnswers: Record<string, string> = {};
      questions.forEach(q => {
        const val = searchParams.get(`a_${q.id}`);
        if (val) parsedAnswers[q.id] = val;
      });
      setAnswers(parsedAnswers);
    } else {
      setIsOpen(false);
    }
  }, [searchParams]);

  const syncToUrl = (newIsOpen: boolean, newStep: number, newAnswers: Record<string, string>, newShowResult: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newIsOpen) {
      params.set("wizard", "true");
      params.set("step", newStep.toString());
      if (newShowResult) params.set("result", "true");
      else params.delete("result");
      
      Object.entries(newAnswers).forEach(([k, v]) => {
        params.set(`a_${k}`, v);
      });
    } else {
      params.delete("wizard");
      params.delete("step");
      params.delete("result");
      questions.forEach(q => params.delete(`a_${q.id}`));
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, "", newUrl);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset internally if closed
      setStep(0);
      setAnswers({});
      setShowResult(false);
      syncToUrl(false, 0, {}, false);
    } else {
      syncToUrl(true, step, answers, showResult);
    }
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[step].id]: value };
    setAnswers(newAnswers);
    
    if (step < questions.length - 1) {
      setTimeout(() => {
        setStep(step + 1);
        syncToUrl(isOpen, step + 1, newAnswers, showResult);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResult(true);
        syncToUrl(isOpen, step, newAnswers, true);
      }, 300);
    }
  };

  const getRecommendations = () => {
    // Basic scoring algorithm based on tags
    const scores: Record<string, number> = {};
    allPlatforms.forEach(p => scores[p.id] = 0);

    const selectedTags = Object.values(answers).flatMap((val, i) => {
      const q = questions[i];
      const opt = q.options.find(o => o.value === val);
      return opt ? opt.tags : [];
    });

    allPlatforms.forEach(p => {
      const pName = p.name.toLowerCase().replace(/\s+/g, "");
      selectedTags.forEach(tag => {
        if (pName.includes(tag)) {
          scores[p.id] += 1;
        }
      });
      // Boost rating a bit
      if (p.rating) scores[p.id] += (p.rating * 0.1);
    });

    const sortedPlatforms = [...allPlatforms].sort((a, b) => scores[b.id] - scores[a.id]);
    const topPlatforms = sortedPlatforms.slice(0, 3); // Get top 3 recommendations

    // Find related comparisons for these top platforms
    const relatedComps = allComparisons.filter(c => 
      topPlatforms.some(tp => tp.id === c.platformAId || tp.id === c.platformBId)
    ).slice(0, 4);

    return { topPlatforms, relatedComps };
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
    syncToUrl(isOpen, 0, {}, false);
  };

  const progress = showResult ? 100 : ((step) / questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 left-6 lg:bottom-12 lg:left-12 z-[100] h-16 w-16 md:w-auto md:px-8 rounded-full shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)] bg-primary text-primary-foreground group transition-all duration-500 overflow-hidden border-4 border-background hover:scale-105 hover:-translate-y-1">
          <Sparkles className="h-6 w-6 md:mr-3 group-hover:rotate-12 transition-transform" />
          <span className="hidden md:flex font-black uppercase tracking-widest text-[11px]">Match Engine</span>
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform blur-md"></div>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none sm:rounded-[3rem]">
        <DialogTitle className="sr-only">Platform Match Engine</DialogTitle>
        <Card className="relative overflow-hidden bg-card/95 backdrop-blur-xl border border-primary/20 rounded-[3rem] shadow-2xl p-6 md:p-10 w-full">
          <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
            <BrainCircuit className="h-40 w-40" />
          </div>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <MotionDiv
            key={`step-${step}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-3">
              <Badge className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 uppercase tracking-[0.4em] text-[10px] font-black px-4 py-1.5 rounded-full">
                <Target className="h-3 w-3 mr-2" /> Match Engine
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[1]">
                Find Your Perfect <span className="text-primary italic">Platform</span>
              </h2>
              <p className="text-muted-foreground font-medium">Answer {questions.length} questions to get personalized platform recommendations.</p>
            </div>

            <div className="space-y-4">
              <Progress value={progress} className="h-1.5 rounded-full bg-primary/5 [&>div]:bg-primary" />
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tight">{questions[step].text}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[step].options.map(option => (
                  <div
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="p-5 border-2 rounded-3xl cursor-pointer transition-all duration-300 border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 text-lg font-black uppercase tracking-tight"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>
        ) : (
          <MotionDiv
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 space-y-12"
          >
             <div className="space-y-4 text-center">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-[0.4em] text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">
                  <Sparkles className="h-4 w-4 mr-2" /> Match Found
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[1]">
                  Your Recommended <span className="text-primary italic">Stack</span>
                </h2>
             </div>

             {(() => {
               const { topPlatforms, relatedComps } = getRecommendations();
               return (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   {/* Top Platforms */}
                   <div className="lg:col-span-5 space-y-6">
                     <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Target className="h-5 w-5" /> Top Matches
                     </h3>
                     <div className="space-y-4">
                       {topPlatforms.map((p, idx) => (
                         <div key={p.id} className="p-6 rounded-3xl bg-background border border-border shadow-sm flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-card border flex items-center justify-center font-black text-xl text-primary bg-primary/10">
                                #{idx + 1}
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase tracking-tighter">{p.name}</h4>
                                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Platform</p>
                              </div>
                            </div>
                         </div>
                       ))}
                     </div>
                     <Button variant="outline" onClick={reset} className="w-full rounded-xl h-12 uppercase font-black tracking-widest text-[10px]">
                       Start Over
                     </Button>
                   </div>

                   {/* Related Comparisons */}
                   <div className="lg:col-span-7 space-y-6">
                      <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <BrainCircuit className="h-5 w-5" /> Recommended Showdowns
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedComps.map(comp => (
                          <Link href={`/compare/vs/${comp.slug}`} key={comp.id} className="p-5 rounded-3xl bg-background border border-border hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col justify-between h-32">
                              <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 opacity-80">Battle Details</p>
                              <h4 className="font-black leading-tight text-lg group-hover:text-primary transition-colors line-clamp-2">{comp.title}</h4>
                             </div>
                             <div className="absolute right-4 bottom-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                               <ArrowRight className="h-4 w-4" />
                             </div>
                          </Link>
                        ))}
                     </div>
                   </div>
                 </div>
               )
             })()}
          </MotionDiv>
        )}
      </AnimatePresence>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
