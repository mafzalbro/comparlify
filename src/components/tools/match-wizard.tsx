"use client";

import React, { useState } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: "identity", title: "Project Details", icon: Target },
  { id: "financials", title: "Budget & Revenue", icon: DollarSign },
  { id: "requirements", title: "Feature Needs", icon: Settings },
];

const STATIC_FEATURES = [
    { id: "lms", name: "Course Hosting", icon: "📚" },
    { id: "email", name: "Email Automations", icon: "📧" },
    { id: "community", name: "Community Groups", icon: "👥" },
    { id: "checkout", name: "Custom Checkout", icon: "💳" },
    { id: "affiliate", name: "Affiliate System", icon: "🤝" },
    { id: "mobile", name: "Mobile App", icon: "📱" },
];

interface MatchWizardProps {
  availableFeatures?: any[];
  onComplete: (data: any) => void;
  isLoading?: boolean;
}

export function MatchWizard({ onComplete, isLoading, availableFeatures = [] }: MatchWizardProps) {
  const dynamicFeatures = availableFeatures.length > 0 ? availableFeatures : STATIC_FEATURES;
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    revenue: 5000,
    studentCount: 100,
    technicalSkill: 3,
    requiredFeatures: [] as string[],
    monthlyBudget: 150,
  });

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const toggleFeature = (id: string) => {
    setFormData(prev => ({
        ...prev,
        requiredFeatures: prev.requiredFeatures.includes(id)
            ? prev.requiredFeatures.filter(f => f !== id)
            : [...prev.requiredFeatures, id]
    }));
  };

  return (
    <Card className="max-w-4xl mx-auto bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[3rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      {/* Sidebar Progress */}
      <div className="md:w-64 bg-background/50 border-r border-border/10 p-8 flex flex-col gap-8">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest w-fit">
            <Sparkles className="h-3 w-3" /> Logic Engine
        </div>
        
        <div className="space-y-6">
            {STEPS.map((s, idx) => (
                <div key={s.id} className={`flex items-center gap-4 transition-all ${idx === step ? "opacity-100 scale-105" : "opacity-30"}`}>
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border ${idx === step ? "bg-primary border-primary text-black" : "bg-muted border-border/20"}`}>
                        <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight">{s.title}</span>
                </div>
            ))}
        </div>

        <div className="mt-auto pt-8 border-t border-border/10">
            <p className="text-[10px] font-bold text-muted-foreground leading-relaxed italic opacity-50">
                Method: Professional weighted scoring. No AI wrappers. Pure engineering.
            </p>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 p-12 flex flex-col">
          <MotionDiv
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
              {step === 0 && (
                  <div className="space-y-8">
                      <div>
                          <h2 className="text-4xl font-black tracking-tighter mb-2 italic">Your <span className="text-primary not-italic uppercase">Project</span></h2>
                          <p className="text-xs text-muted-foreground font-medium italic opacity-70">Name your project to save your results.</p>
                      </div>
                      
                      <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Project Name</label>
                          <Input 
                            placeholder="e.g. Masterclass Q3 Launch" 
                            className="bg-background/40 border-border/10 rounded-2xl h-14 font-bold focus-visible:ring-primary/20"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Technical Skill (1-5)</label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setFormData({...formData, technicalSkill: v})}
                                        className={`h-10 w-full rounded-xl font-black transition-all border ${formData.technicalSkill === v ? "bg-primary border-primary text-black" : "bg-muted/50 border-border/5 text-muted-foreground hover:bg-muted"}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                          </div>
                      </div>
                  </div>
              )}

              {step === 1 && (
                  <div className="space-y-8">
                       <div>
                          <h2 className="text-4xl font-black tracking-tighter mb-2 italic">Budget & <span className="text-primary not-italic uppercase">Growth</span></h2>
                          <p className="text-xs text-muted-foreground font-medium italic opacity-70">Help us find the best financial fit for your scale.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Monthly Revenue ($)</label>
                             <Input 
                                type="number"
                                className="bg-background/40 border-border/10 rounded-2xl h-14 font-bold"
                                value={formData.revenue}
                                onChange={e => setFormData({...formData, revenue: Number(e.target.value)})}
                             />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Target Budget ($/mo)</label>
                             <Input 
                                type="number"
                                className="bg-background/40 border-border/10 rounded-2xl h-14 font-bold"
                                value={formData.monthlyBudget}
                                onChange={e => setFormData({...formData, monthlyBudget: Number(e.target.value)})}
                             />
                          </div>
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Total Active Students</label>
                          <Input 
                            type="number"
                            className="bg-background/40 border-border/10 rounded-2xl h-14 font-bold"
                            value={formData.studentCount}
                            onChange={e => setFormData({...formData, studentCount: Number(e.target.value)})}
                          />
                      </div>
                  </div>
              )}

              {step === 2 && (
                  <div className="space-y-8">
                      <div>
                          <h2 className="text-4xl font-black tracking-tighter mb-2 italic">Feature <span className="text-primary not-italic uppercase">Needs</span></h2>
                          <p className="text-xs text-muted-foreground font-medium italic opacity-70">Select the essential tools for your business.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          {dynamicFeatures.map(f => (
                              <button
                                key={f.id}
                                onClick={() => toggleFeature(f.id)}
                                className={`flex items-center gap-3 p-4 rounded-3xl border transition-all ${
                                    formData.requiredFeatures.includes(f.id)
                                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                                    : "bg-background/40 border-border/10 hover:border-border/30"
                                }`}
                              >
                                  <span className="text-xl">{f.icon}</span>
                                  <span className="text-[10px] font-black uppercase tracking-tight">{f.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </MotionDiv>

          <div className="mt-12 flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={prev}
                disabled={step === 0}
                className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>

              <Button 
                onClick={() => {
                  if (step === STEPS.length - 1) {
                    onComplete(formData);
                  } else {
                    next();
                  }
                }}
                disabled={(step === STEPS.length - 1 && (!formData.name || isLoading)) || (step === 0 && !formData.name)}
                className="rounded-full px-10 h-14 bg-primary text-black font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group min-w-[200px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Calculating...
                  </div>
                ) : step === STEPS.length - 1 ? (
                    <>Find My Match <Sparkles className="h-4 w-4 ml-3" /></>
                ) : (
                    <>Next Step <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
          </div>
      </div>
    </Card>
  );
}
