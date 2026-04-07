"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart4,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  MousePointerClick,
  Save,
  Loader2,
} from "lucide-react";
import { saveAdSnapshot } from "@/app/actions/projects";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdProfitPredictor({ projects = [] }: { projects?: any[] }) {
  const { toast } = useToast();
  const [budget, setBudget] = useState(1000);
  const [coursePrice, setCoursePrice] = useState(197);
  const [conversionRate, setConversionRate] = useState(2);
  const [cpc, setCpc] = useState(1.5);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const stats = useMemo(() => {
    const clicks = Math.floor(budget / cpc);
    const sales = Math.floor(clicks * (conversionRate / 100));
    const revenue = sales * coursePrice;
    const profit = revenue - budget;
    const roi = budget > 0 ? (profit / budget) * 100 : 0;
    
    // Break-even analysis
    const breakEvenSales = Math.ceil(budget / coursePrice);
    const maxCpc = (coursePrice * (conversionRate / 100));

    return {
      clicks,
      sales,
      revenue,
      profit,
      roi,
      breakEvenSales,
      maxCpc
    };
  }, [budget, coursePrice, conversionRate, cpc]);

  const handleSave = async () => {
    if (!selectedProjectId) {
      toast({
        title: "Project Required",
        description: "Please select a project to save this forecast.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveAdSnapshot(selectedProjectId, {
        adSpend: budget,
        cpc,
        conversionRate,
        productPrice: coursePrice,
        totalProfit: stats.profit,
        roas: stats.roi / 100,
      });

      if (result.success) {
        toast({
          title: "Ad ROI Recorded",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save ad forecast.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-xl overflow-hidden relative group max-w-5xl mx-auto">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
        <Target className="h-48 w-48 text-primary" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Inputs */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest leading-none">
              <BarChart4 className="h-3 w-3" /> Growth Modeling
            </div>
          </div>
          
          <h3 className="text-4xl font-black tracking-tight mb-2">
            Ad <span className="text-primary italic">Profit</span> Predictor
          </h3>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-primary" /> Monthly Ad Budget
                </label>
                <span className="text-2xl font-black italic tracking-tighter">${budget.toLocaleString()}</span>
              </div>
              <Slider
                value={[budget]}
                onValueChange={(val) => setBudget(val[0])}
                max={50000}
                step={500}
                className="py-2"
              />
            </div>

            <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-primary" /> Course Price
                </label>
                <span className="text-2xl font-black italic tracking-tighter">${coursePrice}</span>
              </div>
              <Slider
                value={[coursePrice]}
                onValueChange={(val) => setCoursePrice(val[0])}
                max={2000}
                step={10}
                className="py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-4">
                  Conv. Rate %
                </label>
                <div className="flex items-center justify-between gap-4">
                   <Slider
                    value={[conversionRate]}
                    onValueChange={(val) => setConversionRate(val[0])}
                    max={10}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xl font-black italic min-w-[3ch]">{conversionRate}%</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-4">
                  Target CPC ($)
                </label>
                <div className="flex items-center justify-between gap-4">
                   <Slider
                    value={[cpc * 100]}
                    onValueChange={(val) => setCpc(val[0] / 100)}
                    max={1000}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-xl font-black italic min-w-[3ch]">${cpc.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {projects.length > 0 && (
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Strategic Workspace</p>
                <p className="text-[8px] font-medium text-muted-foreground uppercase opacity-60 italic leading-tight">Link this forecast to a project</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-full md:w-[150px] h-10 bg-background/50 border-border/10 rounded-xl text-[10px] font-black uppercase tracking-tight">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/10">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase tracking-tight">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || !selectedProjectId}
                  className="rounded-xl h-10 px-6 bg-primary text-[9px] font-black uppercase tracking-widest"
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-2" />}
                  Record
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Results */}
        <div className="flex flex-col justify-center space-y-6">
          <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden transition-all duration-500 ${stats.profit > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${stats.profit > 0 ? "text-emerald-500" : "text-red-500"}`}>Estimated Monthly Profit</p>
            <h4 className={`text-5xl font-black italic tracking-tighter leading-none ${stats.profit > 0 ? "text-emerald-500" : "text-red-500"}`}>
               {stats.profit >= 0 ? "+" : ""}${stats.profit.toLocaleString()}
            </h4>
            <div className="flex items-center gap-4 mt-6">
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                    ROI: {stats.roi.toFixed(0)}%
                </div>
                <div className="px-3 py-1 rounded-full bg-background/50 border border-border/10 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {stats.sales} Sales Generated
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-background/30 border border-border/10 relative group/box">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Break-Even Sales</p>
              <div className="text-2xl font-black tracking-tighter">{stats.breakEvenSales} <span className="text-xs opacity-50 uppercase font-black tracking-widest italic ml-1 text-primary">Target</span></div>
              <div className="absolute top-4 right-4 opacity-10 group-hover/box:opacity-30 transition-opacity">
                <Zap className="h-4 w-4" />
              </div>
            </div>
             <div className="p-6 rounded-3xl bg-background/30 border border-border/10 relative group/box">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Max Profitable CPC</p>
              <div className="text-2xl font-black tracking-tighter">${stats.maxCpc.toFixed(2)}</div>
               <div className="absolute top-4 right-4 opacity-10 group-hover/box:opacity-30 transition-opacity">
                <MousePointerClick className="h-4 w-4" />
              </div>
            </div>
          </div>

          <MotionDiv
            key={stats.revenue}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group/final text-center"
          >
            <div className="absolute inset-0 bg-radial-at-t from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Projected Monthly Revenue</p>
              <h4 className="text-4xl font-black tracking-tighter leading-none mb-4">
                 ${stats.revenue.toLocaleString()}
              </h4>
              <div className="h-px w-full bg-border/20 mb-4" />
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed italic px-6">
                Scaling your course requires precision. If your LMS doesn&apos;t support high-converting checkout pages, your effective ROI drops by 15-20%.
              </p>
            </div>
          </MotionDiv>

          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/5 border border-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <p className="text-[10px] font-bold text-muted-foreground leading-tight italic">
              Pro Tip: Tools like Kajabi and Circle offer native upsell funnels that can increase average order value (AOV) by 35%.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
