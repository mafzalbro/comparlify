"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  ShieldCheck,
  CreditCard,
  PieChart,
  Repeat,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { calculateROI, GATEWAYS, type PricingTier } from "@/lib/roi-engine";

interface PlatformWithTiers {
  id: string;
  name: string;
  tiers: PricingTier[];
}

interface ROICalculatorProps {
  platforms: PlatformWithTiers[];
}

export function ROICalculator({ platforms }: ROICalculatorProps) {
  const [revenue, setRevenue] = useState(5000);
  const [salesCount, setSalesCount] = useState(50);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annually">("monthly");
  const [gatewayId, setGatewayId] = useState("stripe");
  const [currentPlatformId, setCurrentPlatformId] = useState(platforms[0]?.id || "");
  const [currentTierId, setCurrentTierId] = useState(platforms[0]?.tiers[0]?.id || "");

  const handlePlatformChange = (id: string) => {
    setCurrentPlatformId(id);
    const platform = platforms.find((p) => p.id === id);
    if (platform?.tiers.length) {
      setCurrentTierId(platform.tiers[0].id);
    }
  };

  const currentPlatform = platforms.find((p) => p.id === currentPlatformId);
  const currentTier = currentPlatform?.tiers.find((t) => t.id === currentTierId);
  const gateway = GATEWAYS[gatewayId];

  const analysisData = useMemo(() => {
    if (!currentTier) return [];

    const baseline = calculateROI(revenue, salesCount, currentTier, gateway, billingInterval);

    return platforms.flatMap(platform => 
      platform.tiers.map(tier => {
        const stats = calculateROI(revenue, salesCount, tier, gateway, billingInterval);
        return {
          platformId: platform.id,
          platformName: platform.name,
          tierId: tier.id,
          tierName: tier.name,
          displayName: `${platform.name} (${tier.name})`,
          ...stats,
          monthlySavings: baseline.monthlyTotalCost - stats.monthlyTotalCost,
          annualSavings: baseline.annualTotalCost - stats.annualTotalCost
        };
      })
    ).sort((a, b) => a.monthlyTotalCost - b.monthlyTotalCost);
  }, [platforms, revenue, salesCount, currentTier, gateway, billingInterval]);

  const currentStats = analysisData.find(d => d.tierId === currentTierId);
  const bestOption = analysisData[0];
  const maxSavings = bestOption ? (currentStats?.annualTotalCost || 0) - bestOption.annualTotalCost : 0;

  // Projection data for 12 months
  const projectionData = useMemo(() => {
    if (!currentStats || !bestOption) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        month: `M${month}`,
        Current: currentStats.monthlyTotalCost * month,
        Optimized: bestOption.monthlyTotalCost * month,
      };
    });
  }, [currentStats, bestOption]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Financial Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Target className="h-4 w-4" /> Business Profile
              </h3>
              <Tabs 
                value={billingInterval} 
                onValueChange={(val) => setBillingInterval(val as any)}
                className="scale-90 origin-right"
              >
                <TabsList className="bg-background/50 border border-border/10 p-1">
                  <TabsTrigger value="monthly" className="text-[10px] font-black uppercase">Monthly</TabsTrigger>
                  <TabsTrigger value="annually" className="text-[10px] font-black uppercase">Annual</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Revenue</label>
                  <span className="text-2xl font-black italic tracking-tighter text-foreground">${revenue.toLocaleString()}</span>
                </div>
                <Slider value={[revenue]} onValueChange={(val) => setRevenue(val[0])} max={50000} step={500} className="py-2" />
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Sales</label>
                  <span className="text-2xl font-black italic tracking-tighter text-foreground">{salesCount}</span>
                </div>
                <Slider value={[salesCount]} onValueChange={(val) => setSalesCount(val[0])} max={1000} step={10} className="py-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Gateway</label>
                  <select
                    value={gatewayId}
                    onChange={(e) => setGatewayId(e.target.value)}
                    className="w-full bg-background/50 border border-border/10 rounded-xl p-3 text-xs font-bold outline-none"
                  >
                    {Object.entries(GATEWAYS).map(([id, g]) => (
                      <option key={id} value={id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Avg Order</label>
                  <div className="bg-background/20 border border-border/10 rounded-xl p-3 text-xs font-black text-center">
                    ${salesCount > 0 ? (revenue / salesCount).toFixed(0) : 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/10 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Your Current Setup</label>
              <div className="space-y-3">
                <select
                  value={currentPlatformId}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs font-black uppercase tracking-tight outline-none"
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select
                  value={currentTierId}
                  onChange={(e) => setCurrentTierId(e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-xl p-4 text-xs font-bold outline-none"
                >
                  {currentPlatform?.tiers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} - ${t.monthlyPrice}/mo</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {maxSavings > 0 && (
          <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-1">Max Potential Savings</p>
                <h4 className="text-4xl font-black tracking-tighter text-emerald-500">
                  ${maxSavings.toLocaleString()} <span className="text-sm font-normal">/yr</span>
                </h4>
                <p className="text-[10px] font-bold mt-2 text-muted-foreground italic">Based on switching to {bestOption.platformName}</p>
              </div>
              <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <TrendingDown className="h-8 w-8" />
              </div>
            </div>
          </MotionDiv>
        )}
      </div>

      {/* Right: Dashboard Analytics */}
      <div className="lg:col-span-7 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/40 backdrop-blur-md border border-border/10 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Repeat className="h-4 w-4" /></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Break-Even Velocity</h4>
            </div>
            <div className="text-3xl font-black">{currentStats?.breakEvenSales} <span className="text-xs font-medium text-muted-foreground ml-1">Sales / mo</span></div>
            <p className="text-[9px] font-bold mt-2 text-muted-foreground">Required sales at avg price to cover infrastructure costs.</p>
          </Card>

          <Card className="p-6 bg-card/40 backdrop-blur-md border border-border/10 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><CreditCard className="h-4 w-4" /></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Effective Tax Rate</h4>
            </div>
            <div className="text-3xl font-black">{currentStats?.effectiveFeePercent.toFixed(1)}% <span className="text-xs font-medium text-muted-foreground ml-1">of Revenue</span></div>
            <p className="text-[9px] font-bold mt-2 text-muted-foreground">Combined cost of platform and gateway fees.</p>
          </Card>
        </div>

        <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-xl overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" /> Cost <span className="text-primary italic">Intelligence</span>
            </h3>
            <div className="text-[8px] font-black uppercase tracking-widest bg-muted px-4 py-1.5 rounded-full border border-border/10">3-Year Cumulative Cost</div>
          </div>

          <div className="h-[250px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "currentColor" }} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border) / 0.1)', fontWeight: 900, fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="Current" stroke="#888888" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="Optimized" stroke="hsl(var(--primary))" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Industry Comparison</h5>
              <div className="flex items-center gap-4 text-[9px] font-bold">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Optimized</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted" /> Current</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {analysisData.slice(0, 5).map((d) => (
                <div 
                  key={d.tierId}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${d.tierId === currentTierId ? "bg-primary/5 border-primary/20" : "bg-background/20 border-border/10"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-tight">{d.platformName}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{d.tierName}</span>
                    </div>
                    {d.tierId === bestOption.tierId && (
                      <span className="text-[8px] font-black uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded italic">Efficiency King</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black italic tracking-tighter">${d.monthlyTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</div>
                    {d.monthlySavings > 0 ? (
                      <div className="text-[9px] font-black text-emerald-500 uppercase tracking-tight">Save ${d.monthlySavings.toLocaleString()}</div>
                    ) : (
                      d.monthlySavings < 0 && <div className="text-[9px] font-black text-rose-500 uppercase tracking-tight">+${Math.abs(d.monthlySavings).toLocaleString()} Loss</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
