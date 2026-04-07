"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calculator,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { calculateROI, GATEWAYS, PricingTier } from "@/lib/roi-engine";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_DEFAULTS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export function PricingCalculator() {
  const [price, setPrice] = useState<number>(97);
  const [students, setStudents] = useState<number>(50);
  const [platform1Id, setPlatform1Id] = useState<string>("teachable");
  const [platform2Id, setPlatform2Id] = useState<string>("kajabi");
  const [isComparison, setIsComparison] = useState<boolean>(true);

  const revenue = price * students;

  const result1 = useMemo(() => {
    return calculateROI(revenue, students, PLATFORM_DEFAULTS[platform1Id].tier, GATEWAYS.stripe);
  }, [revenue, students, platform1Id]);

  const result2 = useMemo(() => {
    return calculateROI(revenue, students, PLATFORM_DEFAULTS[platform2Id].tier, GATEWAYS.stripe);
  }, [revenue, students, platform2Id]);

  const profit1 = revenue - result1.monthlyTotalCost;
  const profit2 = revenue - result2.monthlyTotalCost;

  const winner = profit1 > profit2 ? PLATFORM_DEFAULTS[platform1Id] : PLATFORM_DEFAULTS[platform2Id];
  const loser = profit1 > profit2 ? PLATFORM_DEFAULTS[platform2Id] : PLATFORM_DEFAULTS[platform1Id];
  const savings = Math.abs(profit1 - profit2);

  const chartData = useMemo(() => [
    {
      name: PLATFORM_DEFAULTS[platform1Id].name,
      fees: result1.monthlyTotalCost - PLATFORM_DEFAULTS[platform1Id].tier.monthlyPrice,
      subscription: PLATFORM_DEFAULTS[platform1Id].tier.monthlyPrice,
    },
    {
      name: PLATFORM_DEFAULTS[platform2Id].name,
      fees: result2.monthlyTotalCost - PLATFORM_DEFAULTS[platform2Id].tier.monthlyPrice,
      subscription: PLATFORM_DEFAULTS[platform2Id].tier.monthlyPrice,
    }
  ], [platform1Id, platform2Id, result1, result2]);

  return (
    <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-xl overflow-hidden relative group max-w-6xl mx-auto">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
        <Calculator className="h-64 w-64 text-primary" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest leading-none mb-4">
              <Sparkles className="h-3 w-3" /> Profit Engine
            </div>
            <h3 className="text-4xl font-black tracking-tight mb-2">
              Calculate <span className="text-primary italic">Profit</span>
            </h3>
            <p className="text-xs text-muted-foreground font-medium italic opacity-70">
              See how much you actually keep after platform and gateway fees.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Course Price</Label>
                <span className="text-sm font-black text-primary">${price}</span>
              </div>
              <Slider 
                value={[price]} 
                onValueChange={(v) => setPrice(v[0])} 
                max={2000} 
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Students / month</Label>
                <span className="text-sm font-black text-primary">{students}</span>
              </div>
              <Slider 
                value={[students]} 
                onValueChange={(v) => setStudents(v[0])} 
                max={1000} 
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Compare Options</Label>
                <Switch 
                  checked={isComparison} 
                  onCheckedChange={setIsComparison}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase opacity-50">Platform A</Label>
                  <Select value={platform1Id} onValueChange={setPlatform1Id}>
                    <SelectTrigger className="bg-background/40 border-border/10 rounded-xl h-10 text-xs font-bold">
                      <SelectValue placeholder="Select Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PLATFORM_DEFAULTS).map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-xs font-bold uppercase">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isComparison && (
                  <MotionDiv
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-2"
                  >
                    <Label className="text-[9px] font-bold uppercase opacity-50">Platform B</Label>
                    <Select value={platform2Id} onValueChange={setPlatform2Id}>
                      <SelectTrigger className="bg-background/40 border-border/10 rounded-xl h-10 text-xs font-bold">
                        <SelectValue placeholder="Select Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PLATFORM_DEFAULTS).map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-xs font-bold uppercase">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </MotionDiv>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live Verified Rates</span>
            </div>
            <p className="text-[9px] text-muted-foreground font-medium italic">
              All platform fees and Stripe rates are updated as of March 2026.
            </p>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Card 1 */}
            <MotionDiv 
              layout
              className={`p-8 rounded-[2.5rem] bg-background/50 border border-border/10 relative overflow-hidden flex flex-col justify-between ${!isComparison ? 'md:col-span-2' : ''}`}
            >
              <div>
                <Badge variant="outline" className="mb-4 text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5">
                  {PLATFORM_DEFAULTS[platform1Id].name}
                </Badge>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Monthly Net Profit</p>
                <h4 className="text-5xl font-black tracking-tighter italic text-primary">${profit1.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                
                <div className="mt-8 space-y-3">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase">Total Revenue</span>
                    <span>${revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase">Platform Fees</span>
                    <span className="text-red-500">-${result1.monthlyPlatformCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase">Gateway (Stripe)</span>
                    <span className="text-red-400">-${result1.monthlyGatewayFees.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-border/10 flex justify-between text-xs font-black italic">
                    <span className="uppercase">Net Take-Home</span>
                    <span className="text-emerald-500">{((profit1 / revenue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {!isComparison && (
                 <div className="mt-8">
                    <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group/btn hover:scale-[1.02] transition-transform">
                      Switch to {PLATFORM_DEFAULTS[platform1Id].name} <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                 </div>
              )}
            </MotionDiv>

            {/* Card 2 (Comparison) */}
            {isComparison && (
              <MotionDiv 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 rounded-[2.5rem] bg-background/30 border border-border/10 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <Badge variant="outline" className="mb-4 text-[10px] font-black uppercase tracking-widest border-muted/20 bg-muted/5">
                    {PLATFORM_DEFAULTS[platform2Id].name}
                  </Badge>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Monthly Net Profit</p>
                  <h4 className="text-5xl font-black tracking-tighter italic opacity-60">${profit2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground uppercase">Total Revenue</span>
                      <span>${revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground uppercase">Platform Fees</span>
                      <span className="text-red-500">-${result2.monthlyPlatformCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground uppercase">Gateway (Stripe)</span>
                      <span className="text-red-400">-${result2.monthlyGatewayFees.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-border/10 flex justify-between text-xs font-black italic">
                      <span className="uppercase">Net Take-Home</span>
                      <span className="text-emerald-500/60">{((profit2 / revenue) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            )}

            {/* Fee Breakdown Chart */}
            <MotionDiv
              layout
              className="md:col-span-2 p-8 rounded-[2.5rem] bg-background/20 border border-border/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <TrendingDown className="h-3.5 w-3.5" /> Monthly Cost Anatomy
                </h5>
                <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Subscription</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary/30" /> Transaction Fees</div>
                </div>
              </div>
              
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" barGap={8}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border) / 0.1)', fontWeight: 900, fontSize: '10px' }}
                    />
                    <Bar dataKey="subscription" stackId="a" fill="hsl(var(--primary))" radius={[4, 0, 0, 4]} barSize={32} />
                    <Bar dataKey="fees" stackId="a" fill="hsl(var(--primary) / 0.3)" radius={[0, 4, 4, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </MotionDiv>

            {/* Winner Analysis */}
            {isComparison && (
              <MotionDiv 
                layout
                className="md:col-span-2 p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-8"
              >
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xl font-black tracking-tight mb-1 uppercase italic">
                      {winner.name} Wins by <span className="text-emerald-500">${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                    </h5>
                    <p className="text-sm font-black text-muted-foreground italic">
                      You lose <span className="text-red-500 text-base underline decoration-2 underline-offset-4">${(savings * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })} per year</span> by sticking with {loser.name}.
                    </p>
                  </div>
                </div>
                
                <a 
                  href={`/api/out/${winner.id}`}
                  className="px-8 py-4 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest whitespace-nowrap hover:scale-105 transition-transform flex items-center gap-2 group/win shadow-lg shadow-emerald-500/20"
                >
                  Switch and Save <ArrowRight className="h-4 w-4 transition-transform group-hover/win:translate-x-1" />
                </a>
              </MotionDiv>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
