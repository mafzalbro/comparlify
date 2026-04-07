"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  TrendingDown,
  DollarSign,
  Users,
  Repeat,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Save,
  Loader2,
} from "lucide-react";
import { saveChurnSnapshot } from "@/app/actions/projects";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ChurnForecaster({ projects = [] }: { projects?: any[] }) {
  const { toast } = useToast();
  const [students, setStudents] = useState(500);
  const [monthlyPrice, setMonthlyPrice] = useState(49);
  const [churnRate, setChurnRate] = useState(10);
  const [improvementGoal, setImprovementGoal] = useState(2);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const stats = useMemo(() => {
    const monthlyRevenue = students * monthlyPrice;
    const lostStudentsPerMonth = Math.ceil(students * (churnRate / 100));
    const lostRevenuePerMonth = lostStudentsPerMonth * monthlyPrice;
    
    // Compound Loss Calculation (12 months)
    let totalLostRevenue = 0;
    let currentPool = students;
    for (let i = 1; i <= 12; i++) {
        const lost = Math.ceil(currentPool * (churnRate / 100));
        totalLostRevenue += lost * monthlyPrice * (13 - i); // Each lost user from month N is lost for (13-N) months
        currentPool -= lost;
    }

    // Impact of Improvement
    const improvedChurnRate = Math.max(0, churnRate - improvementGoal);
    let totalLostRevenueImproved = 0;
    currentPool = students;
    for (let i = 1; i <= 12; i++) {
        const lost = Math.ceil(currentPool * (improvedChurnRate / 100));
        totalLostRevenueImproved += lost * monthlyPrice * (13 - i);
        currentPool -= lost;
    }

    const salvagedRevenue = totalLostRevenue - totalLostRevenueImproved;

    return {
      monthlyRevenue,
      lostStudentsPerMonth,
      lostRevenuePerMonth,
      totalLostRevenue,
      salvagedRevenue,
      improvedChurnRate
    };
  }, [students, monthlyPrice, churnRate, improvementGoal]);

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
      const result = await saveChurnSnapshot(selectedProjectId, {
        students,
        monthlyPrice,
        churnRate,
        improvementGoal,
        totalLostRevenue: stats.totalLostRevenue,
        salvagedRevenue: stats.salvagedRevenue,
      });

      if (result.success) {
        toast({
          title: "Forecast Recorded",
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
        description: "Failed to save churn forecast.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-xl overflow-hidden relative group max-w-5xl mx-auto">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
        <Repeat className="h-48 w-48 text-primary" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Inputs */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest leading-none">
              <TrendingDown className="h-3 w-3" /> Churn Forecaster
            </div>
          </div>
          
          <h3 className="text-4xl font-black tracking-tight mb-2">
            The <span className="text-primary italic">Cost</span> of Churn
          </h3>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-primary" /> Active Students
                </label>
                <span className="text-2xl font-black italic tracking-tighter">{students.toLocaleString()}</span>
              </div>
              <Slider
                value={[students]}
                onValueChange={(val) => setStudents(val[0])}
                max={5000}
                step={50}
                className="py-2"
              />
            </div>

            <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-primary" /> Monthly Price
                </label>
                <span className="text-2xl font-black italic tracking-tighter">${monthlyPrice}</span>
              </div>
              <Slider
                value={[monthlyPrice]}
                onValueChange={(val) => setMonthlyPrice(val[0])}
                max={500}
                step={5}
                className="py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-4">
                  Current Churn %
                </label>
                <div className="flex items-center justify-between gap-4">
                   <Slider
                    value={[churnRate]}
                    onValueChange={(val) => setChurnRate(val[0])}
                    max={30}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xl font-black italic min-w-[3ch]">{churnRate}%</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-4">
                  Reduction Goal %
                </label>
                <div className="flex items-center justify-between gap-4">
                   <Slider
                    value={[improvementGoal]}
                    onValueChange={(val) => setImprovementGoal(val[0])}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xl font-black italic min-w-[3ch]">{improvementGoal}%</span>
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
          <div className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/20 relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Projected Annual Loss</p>
            <h4 className="text-5xl font-black italic tracking-tighter leading-none text-red-500">
               -${stats.totalLostRevenue.toLocaleString()}
            </h4>
            <p className="text-[11px] font-medium text-muted-foreground mt-4 leading-relaxed italic opacity-80">
              Without intervention, your business bleeds <span className="text-red-500 font-bold">${stats.lostRevenuePerMonth.toLocaleString()}</span> every month in compounding retention debt.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-background/30 border border-border/10">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Monthly Leakage</p>
              <div className="text-2xl font-black tracking-tighter">-{stats.lostStudentsPerMonth} <span className="text-xs opacity-50">Students</span></div>
            </div>
             <div className="p-6 rounded-3xl bg-background/30 border border-border/10">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Revenue At Risk</p>
              <div className="text-2xl font-black tracking-tighter">${stats.monthlyRevenue.toLocaleString()}<span className="text-xs opacity-50">/mo</span></div>
            </div>
          </div>

          <MotionDiv
            key={stats.salvagedRevenue}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/30 shadow-2xl shadow-emerald-500/5 relative group/salvage"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Zap className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="relative z-10 flex items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">The Cash Back Strategy</p>
                <h4 className="text-3xl font-black italic tracking-tighter leading-none mb-3">
                   +${stats.salvagedRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground italic">recovered</span>
                </h4>
                <p className="text-[10px] font-bold text-muted-foreground">
                  By reducing churn to <span className="text-emerald-500">{stats.improvedChurnRate}%</span>, you reclaim this capital annually.
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 shrink-0">
                <ArrowUpRight className="h-7 w-7" />
              </div>
            </div>
          </MotionDiv>

          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/5 border border-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <p className="text-[10px] font-bold text-muted-foreground leading-tight italic">
              Platform recommendation based on churn-mitigation features (native CRM, re-engagement automation).
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
