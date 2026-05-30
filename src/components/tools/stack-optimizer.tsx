"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolCategory {
  id: string;
  name: string;
}

interface StackTool {
  id: string;
  name: string;
  category: string;
  cost: number;
  features: string[];
}

const CATEGORIES: ToolCategory[] = [
  { id: "lms", name: "LMS / Course Hosting" },
  { id: "email", name: "Email Marketing" },
  { id: "community", name: "Community Platform" },
  { id: "checkout", name: "Checkout / Funnels" },
];

const STATIC_TOOLS_LIBRARY: StackTool[] = [
    // LMS
    { id: "kajabi", name: "Kajabi", category: "lms", cost: 199, features: ["lms", "email", "funnels", "community", "crm"] },
    { id: "teachable", name: "Teachable", category: "lms", cost: 119, features: ["lms", "checkout"] },
    { id: "podia", name: "Podia", category: "lms", cost: 75, features: ["lms", "email", "community", "checkout"] },
    { id: "thinkific", name: "Thinkific", category: "lms", cost: 99, features: ["lms"] },
    
    // Email
    { id: "activecampaign", name: "ActiveCampaign", category: "email", cost: 149, features: ["email", "crm"] },
    { id: "convertkit", name: "ConvertKit", category: "email", cost: 59, features: ["email"] },
    { id: "mailchimp", name: "Mailchimp", category: "email", cost: 45, features: ["email"] },

    // Community
    { id: "circle", name: "Circle.so", category: "community", cost: 99, features: ["community", "lms"] },
    { id: "skool", name: "Skool", category: "community", cost: 99, features: ["community", "lms", "gamification"] },
    { id: "mighty", name: "Mighty Networks", category: "community", cost: 119, features: ["community", "lms"] },

    // Checkout
    { id: "samcart", name: "SamCart", category: "checkout", cost: 99, features: ["checkout", "funnels"] },
    { id: "thrivecart", name: "ThriveCart", category: "checkout", cost: 0, features: ["checkout"] }, // Lifetime usually
];

interface StackOptimizerProps {
  platforms?: any[];
}

export function StackOptimizer({ platforms = [] }: StackOptimizerProps) {
  const dynamicTools = useMemo(() => {
    if (!platforms || platforms.length === 0) return STATIC_TOOLS_LIBRARY;

    const dbTools: StackTool[] = platforms.map(p => ({
      id: p.id,
      name: p.name,
      category: p.name.toLowerCase().includes("email") || p.name === "Kit" ? "email" :
                p.name.toLowerCase().includes("community") || p.name === "Skool" || p.name === "Circle" ? "community" :
                p.name.toLowerCase().includes("stripe") || p.name.toLowerCase().includes("squeezy") ? "checkout" : "lms",
      cost: p.tiers?.[0]?.monthlyPrice || 0,
      features: p.features?.map((f: any) => f.feature?.name.toLowerCase()) || []
    }));

    // Merge logic: prefer DB tools, fallback to static for missing categories if needed, but here we just use DB if present
    return dbTools;
  }, [platforms]);

  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  
  const selectedTools = useMemo(() => 
    dynamicTools.filter(t => selectedToolIds.includes(t.id)),
  [selectedToolIds, dynamicTools]);

  const analysis = useMemo(() => {
    const redundancies: { tool: StackTool, redundantWith: StackTool, feature: string }[] = [];
    const featurePool: Record<string, StackTool> = {};

    selectedTools.forEach(tool => {
        tool.features.forEach(feature => {
            if (featurePool[feature] && featurePool[feature].id !== tool.id) {
                const provider = featurePool[feature];
                if (provider.category === "lms" && tool.category === "email" && feature === "email") {
                    redundancies.push({ tool, redundantWith: provider, feature });
                } else if (tool.category === "lms" && provider.category === "email" && feature === "email") {
                    redundancies.push({ tool: provider, redundantWith: tool, feature });
                }
                if (provider.category === "community" && tool.category === "lms" && feature === "lms") {
                    redundancies.push({ tool, redundantWith: provider, feature });
                }
                if (provider.category === "lms" && tool.category === "checkout" && feature === "checkout") {
                    redundancies.push({ tool, redundantWith: provider, feature });
                }
            } else {
                featurePool[feature] = tool;
            }
        });
    });

    const uniqueRedundancies = Array.from(new Set(redundancies.map(r => r.tool.id)))
        .map(id => redundancies.find(r => r.tool.id === id)!);

    const monthlyWaste = uniqueRedundancies.reduce((acc, r) => acc + r.tool.cost, 0);

    return {
        redundancies: uniqueRedundancies,
        monthlyWaste,
        totalCost: selectedTools.reduce((acc, t) => acc + t.cost, 0),
        techDebt: selectedTools.length > 4 ? "High" : selectedTools.length > 2 ? "Moderate" : "Low"
    };
  }, [selectedTools]);

  const toggleTool = (id: string) => {
    setSelectedToolIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  return (
    <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-xl overflow-hidden relative group max-w-6xl mx-auto">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
        <Zap className="h-48 w-48 text-primary" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Side: Tool Picker */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest leading-none mb-4">
              <Sparkles className="h-3 w-3" /> Audit Engine
            </div>
            <h3 className="text-4xl font-black tracking-tight mb-2">
              Select Your <span className="text-primary italic">Stack</span>
            </h3>
            <p className="text-xs text-muted-foreground font-medium italic opacity-70">
                Click the tools you currently pay for to detect feature overlap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CATEGORIES.map(cat => (
                <div key={cat.id} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border/10 pb-2">{cat.name}</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {dynamicTools.filter(t => t.category === cat.id).map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => toggleTool(tool.id)}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                    selectedToolIds.includes(tool.id) 
                                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                                    : "bg-background/40 border-border/10 hover:border-border/30"
                                )}
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div className={cn("h-2 w-2 rounded-full", selectedToolIds.includes(tool.id) ? "bg-primary animate-pulse" : "bg-muted")} />
                                    <span className="text-xs font-bold uppercase tracking-tight">{tool.name}</span>
                                </div>
                                <span className="text-[10px] font-black opacity-40">${tool.cost}/mo</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* Right Side: Analysis */}
        <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-background/50 border border-border/10 flex flex-col justify-center h-full min-h-[400px]">
                {selectedTools.length === 0 ? (
                    <div className="text-center py-10 opacity-30 italic">
                        <Layers className="h-10 w-10 mx-auto mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Select your tools to start analysis</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Monthly Cost</p>
                                <Badge variant="outline" className={cn(
                                    "text-[8px] font-black uppercase tracking-tighter border-none px-2",
                                    analysis.techDebt === "High" ? "bg-red-500/10 text-red-500" : 
                                    analysis.techDebt === "Moderate" ? "bg-amber-500/10 text-amber-500" : 
                                    "bg-emerald-500/10 text-emerald-500"
                                )}>
                                    {analysis.techDebt} Complexity
                                </Badge>
                            </div>
                            <h4 className="text-5xl font-black tracking-tighter italic">${analysis.totalCost}</h4>
                        </div>

                        {analysis.redundancies.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-red-500">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Gaps Detected</span>
                                </div>
                                
                                <div className="space-y-3">
                                    {analysis.redundancies.map((r, idx) => (
                                        <MotionDiv 
                                            key={idx}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 group/item"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Trash2 className="h-3 w-3 text-red-500" />
                                                    <span className="text-xs font-black uppercase tracking-tight italic">{r.tool.name}</span>
                                                </div>
                                                <span className="text-[9px] font-black text-red-500">-${r.tool.cost}</span>
                                            </div>
                                            <p className="text-[9px] font-medium text-muted-foreground leading-relaxed">
                                                Redundant! Your <span className="text-primary font-bold uppercase">{r.feature}</span> features are already covered by <span className="text-primary font-bold uppercase">{r.redundantWith.name}</span>.
                                            </p>
                                        </MotionDiv>
                                    ))}
                                </div>

                                <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Actionable Savings</p>
                                    <h5 className="text-3xl font-black tracking-tighter italic text-emerald-500">+${analysis.monthlyWaste * 12} / year</h5>
                                    <p className="text-[9px] font-bold text-muted-foreground mt-2 italic">By trimming these redundancies from your stack.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="py-10 text-center space-y-4">
                                <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 italic">Efficient Setup</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium italic mt-2">No overlapping tools detected. Your stack is operating at peak efficiency.</p>
                                </div>
                            </div>
                        )}

                        <div className={cn(
                            "pt-6 border-t border-border/10 flex items-center gap-3",
                            analysis.techDebt === "High" && "bg-red-500/5 -mx-8 px-8 py-4 mt-2"
                        )}>
                            <Zap className={cn("h-4 w-4", analysis.techDebt === "High" ? "text-red-500" : "text-primary opacity-50")} />
                            <p className="text-[9px] font-bold text-muted-foreground leading-tight italic">
                                {analysis.techDebt === "High" 
                                    ? "Critical: Your tech stack is over-engineered. Overlapping subscriptions are costing you more than just money—they're creating technical debt."
                                    : "Strategy: Consider consolidating your community and LMS into one ecosystem to reduce technical debt."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </Card>
  );
}
