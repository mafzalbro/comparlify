"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  Percent, 
  Info, 
  Zap,
  TrendingUp,
  Coins,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORM_PRESETS = [
  { name: "Teachable (Free)", fee: 10, MonthlyBase: 0 },
  { name: "Teachable (Basic)", fee: 5, MonthlyBase: 39 },
  { name: "Kajabi (All)", fee: 0, MonthlyBase: 149 },
  { name: "Thinkific (Free)", fee: 0, MonthlyBase: 0 },
  { name: "Gumroad", fee: 10, MonthlyBase: 0 },
];

export function CourseRevenueCalculator() {
  const [price, setPrice] = useState<number>(97);
  const [students, setStudents] = useState<number>(100);
  const [fee, setFee] = useState<number>(5);
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  // Results
  const revenue = useMemo(() => price * students, [price, students]);
  const feeAmount = useMemo(() => (revenue * fee) / 100, [revenue, fee]);
  const profit = useMemo(() => revenue - feeAmount, [revenue, feeAmount]);

  // Comparison Results (Teachable Basic vs Kajabi Basic)
  // Teachable: $39/mo + 5%
  // Kajabi: $149/mo + 0%
  const teachableFee = (revenue * 5) / 100;
  const teachableProfit = revenue - teachableFee - 39;
  
  const kajabiFee = 0;
  const kajabiProfit = revenue - kajabiFee - 149;

  const betterOption = kajabiProfit > teachableProfit ? "Kajabi" : "Teachable";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-4">
          <MotionDiv 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-1.5 rounded-2xl bg-secondary/5 border border-border/10"
          >
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/5">
              <div className="flex items-center justify-between mb-6">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Course Price
                </Label>
                <div className="text-2xl font-black text-primary">
                  ${price.toLocaleString()}
                </div>
              </div>
              <Slider
                value={[price]}
                onValueChange={(v) => setPrice(v[0])}
                max={2000}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                <span>$0</span>
                <span>$1,000</span>
                <span>$2,000</span>
              </div>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-4 bg-muted/30 border-none font-bold text-center h-12 text-lg"
              />
            </div>
          </MotionDiv>

          <MotionDiv 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-1.5 rounded-2xl bg-secondary/5 border border-border/10"
          >
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/5">
              <div className="flex items-center justify-between mb-6">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total Students
                </Label>
                <div className="text-2xl font-black text-primary">
                  {students.toLocaleString()}
                </div>
              </div>
              <Slider
                value={[students]}
                onValueChange={(v) => setStudents(v[0])}
                max={1000}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                <span>0</span>
                <span>500</span>
                <span>1,000</span>
              </div>
              <Input
                type="number"
                value={students}
                onChange={(e) => setStudents(Number(e.target.value))}
                className="mt-4 bg-muted/30 border-none font-bold text-center h-12 text-lg"
              />
            </div>
          </MotionDiv>

          <MotionDiv 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-1.5 rounded-2xl bg-secondary/5 border border-border/10"
          >
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/5">
              <div className="flex items-center justify-between mb-6">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" />
                  Platform Fee
                </Label>
                <div className="text-2xl font-black text-primary">
                  {fee}%
                </div>
              </div>
              <Slider
                value={[fee]}
                onValueChange={(v) => setFee(v[0])}
                max={20}
                step={0.5}
                className="mb-2"
              />
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {PLATFORM_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setFee(p.fee)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                      fee === p.fee 
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "bg-muted/50 border-border/10 hover:border-primary/50 text-muted-foreground hover:text-primary"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-8 bg-background border border-border/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="h-12 w-12" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Total Revenue</p>
              <h2 className="text-4xl font-black tracking-tighter">
                ${revenue.toLocaleString()}
              </h2>
            </div>
          </Card>

          <Card className="p-8 bg-background border border-border/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Building2 className="h-12 w-12" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Platform Fee</p>
              <h2 className="text-4xl font-black tracking-tighter text-red-500/80">
                -${feeAmount.toLocaleString()}
              </h2>
            </div>
          </Card>
        </div>

        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-10 bg-emerald-500/5 border-2 border-emerald-500/10 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <Coins className="h-8 w-8" />
              </div>
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400 mb-2">Net Profit Forecast</p>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">
                ${profit.toLocaleString()}
              </h2>
              <div className="mt-8 flex items-center gap-4 py-2 px-6 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
                  {revenue > 0 ? (profit / revenue * 100).toFixed(1) : 0}% Profit Margin
                </span>
              </div>
            </div>
          </Card>
        </MotionDiv>

        {/* Comparison Bonus Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Platform Comparison
            </h3>
            <button 
              onClick={() => setIsComparisonMode(!isComparisonMode)}
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
            >
              {isComparisonMode ? "Hide Insights" : "Compare Platforms"}
            </button>
          </div>

          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500",
            isComparisonMode ? "opacity-100 scale-100 h-auto" : "opacity-0 scale-95 h-0 overflow-hidden pointer-events-none"
          )}>
            <div className="p-6 rounded-2xl border border-border/10 bg-background hover:border-primary/50 transition-colors group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-black uppercase tracking-tight">Teachable</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Basic Plan ($39 + 5%)</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-[8px] font-black uppercase",
                  betterOption === "Teachable" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {betterOption === "Teachable" ? "Optimal" : "Higher Fees"}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight items-baseline">
                  <span className="text-muted-foreground">Est. Monthly Profit</span>
                  <span className="text-primary text-xl">
                    ${Math.max(0, Math.round(teachableProfit)).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                   <MotionDiv 
                    className="bg-primary h-full" 
                    initial={{ width: 0 }}
                    animate={{ width: isComparisonMode ? `${(Math.max(0, teachableProfit) / Math.max(teachableProfit, kajabiProfit, 1)) * 100}%` : 0 }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border/10 bg-background hover:border-primary/50 transition-colors group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-black uppercase tracking-tight">Kajabi</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Basic Plan ($149 + 0%)</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-[8px] font-black uppercase",
                  betterOption === "Kajabi" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                   {betterOption === "Kajabi" ? "Optimal" : "Higher Fees"}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight items-baseline">
                  <span className="text-muted-foreground">Est. Monthly Profit</span>
                  <span className="text-primary text-xl">
                    ${Math.max(0, Math.round(kajabiProfit)).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                   <MotionDiv 
                    className="bg-primary h-full" 
                    initial={{ width: 0 }}
                    animate={{ width: isComparisonMode ? `${(Math.max(0, kajabiProfit) / Math.max(teachableProfit, kajabiProfit, 1)) * 100}%` : 0 }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <MotionDiv 
            animate={{ opacity: isComparisonMode ? 1 : 0 }}
            className="mt-6 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4 items-start"
          >
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">
              * Calculations include monthly subscription basic fees. {kajabiProfit > teachableProfit 
                ? "At your current volume, Kajabi's 0% transaction fee model is significantly more profitable than Teachable's 5% cut." 
                : "At your current volume, Teachable's lower $39 base price keeps your costs down, even with the 5% transaction fee."}
            </p>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}
