"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  DollarSign,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Target,
} from "lucide-react";
import { calculateROI, GATEWAYS, type PricingTier } from "@/lib/roi-engine";
import { Button } from "../ui/button";

interface PlatformWithTiers {
  id: string;
  name: string;
  tiers: PricingTier[];
  lastVerifiedAt?: Date | string | null;
}

interface InlineROICalculatorProps {
  platformA: PlatformWithTiers;
  platformB: PlatformWithTiers;
}

export function InlineROICalculator({
  platformA,
  platformB,
}: InlineROICalculatorProps) {
  const [revenue, setRevenue] = useState(5000);
  const [salesCount, setSalesCount] = useState(50);
  const [billingInterval, setBillingInterval] = useState<
    "monthly" | "annually"
  >("monthly");
  const [gatewayId, setGatewayId] = useState("stripe");

  // Pick the most popular or first tier by default
  const tierA =
    platformA.tiers.find((t) => (t as any).isPopular) || platformA.tiers[0];
  const tierB =
    platformB.tiers.find((t) => (t as any).isPopular) || platformB.tiers[0];

  const gateway = GATEWAYS[gatewayId];

  const statsA = useMemo(() => {
    if (!tierA) return null;
    return calculateROI(revenue, salesCount, tierA, gateway, billingInterval);
  }, [revenue, salesCount, tierA, gateway, billingInterval]);

  const statsB = useMemo(() => {
    if (!tierB) return null;
    return calculateROI(revenue, salesCount, tierB, gateway, billingInterval);
  }, [revenue, salesCount, tierB, gateway, billingInterval]);

  if (!statsA || !statsB) return null;

  const savings = statsA.monthlyTotalCost - statsB.monthlyTotalCost;
  const absSavings = Math.abs(savings);
  const yearlySavings = absSavings * 12;

  const winner = savings > 0 ? platformB : platformA;
  const loser = savings > 0 ? platformA : platformB;

  return (
    <Card className="p-6 bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors rounded-2xl shadow-md overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-105 duration-500">
        <Calculator className="h-36 w-36" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Controls */}
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest leading-none">
              <TrendingDown className="h-3 w-3" /> Cost Comparison
            </div>
            <Tabs
              value={billingInterval}
              onValueChange={(val) => setBillingInterval(val as any)}
              className="scale-75 origin-right"
            >
              <TabsList className="bg-background/50 border border-border/10 p-0.5">
                <TabsTrigger
                  value="monthly"
                  className="text-[8px] font-black uppercase"
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="annually"
                  className="text-[8px] font-black uppercase"
                >
                  Annual
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <h3 className="text-3xl font-black tracking-tight mb-2">
            The <span className="text-primary italic">Math</span> of Switching
          </h3>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-background/50 border border-border/10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-primary" /> Monthly
                  Revenue
                </label>
                <span className="text-2xl font-black italic tracking-tighter tabular-nums">
                  ${revenue.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[revenue]}
                onValueChange={(val) => setRevenue(val[0])}
                max={50000}
                step={500}
                className="py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/30 border border-border/10 rounded-2xl p-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                  Gateway
                </label>
                <select
                  value={gatewayId}
                  onChange={(e) => setGatewayId(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold outline-none cursor-pointer"
                >
                  {Object.entries(GATEWAYS).map(([id, g]) => (
                    <option key={id} value={id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-background/30 border border-border/10 rounded-2xl p-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                  Order Value
                </label>
                <div className="text-xs font-bold">
                  ${salesCount > 0 ? (revenue / salesCount).toFixed(0) : 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-5 rounded-3xl border transition-all ${savings > 0 ? "bg-muted/30 border-border/10 opacity-70" : "bg-primary/5 border-primary/20 ring-1 ring-primary/10 shadow-lg shadow-primary/5"}`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                  {platformA.name}
                </p>
                {platformA.lastVerifiedAt && (
                  <ShieldCheck className="h-3 w-3 text-primary opacity-50" />
                )}
              </div>
              <p className="text-2xl font-black tracking-tighter tabular-nums">
                ${statsA.monthlyTotalCost.toFixed(0)}
                <span className="text-xs opacity-50">/mo</span>
              </p>
              <p className="text-[8px] font-bold uppercase tracking-tight text-muted-foreground mt-1 line-clamp-1">
                {tierA?.name} Tier
              </p>
            </div>

            <div
              className={`p-5 rounded-3xl border transition-all ${savings < 0 ? "bg-muted/30 border-border/10 opacity-70" : "bg-primary/5 border-primary/20 ring-1 ring-primary/10 shadow-lg shadow-primary/5"}`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                  {platformB.name}
                </p>
                {platformB.lastVerifiedAt && (
                  <ShieldCheck className="h-3 w-3 text-primary opacity-50" />
                )}
              </div>
              <p className="text-2xl font-black tracking-tighter tabular-nums">
                ${statsB.monthlyTotalCost.toFixed(0)}
                <span className="text-xs opacity-50">/mo</span>
              </p>
              <p className="text-[8px] font-bold uppercase tracking-tight text-muted-foreground mt-1 line-clamp-1">
                {tierB?.name} Tier
              </p>
            </div>
          </div>

          {absSavings > 0 ? (
            <MotionDiv
              key={absSavings}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group/result"
            >
              <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">
                    Winning Efficiency Blueprint
                  </p>
                  <h4 className="text-3xl font-black italic tracking-tighter leading-none">
                    Save{" "}
                    <span className="text-emerald-500 font-black tabular-nums">
                      ${yearlySavings.toLocaleString()}
                    </span>{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      / year
                    </span>
                  </h4>
                  <p className="text-[10px] font-bold mt-2 text-muted-foreground">
                    Switch to{" "}
                    <span className="text-emerald-500 uppercase">
                      {winner.name}
                    </span>{" "}
                    and secure your growth.
                  </p>

                  <Button
                    asChild
                    className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 text-[10px] font-black uppercase tracking-widest h-10 shadow-lg shadow-emerald-500/20 group-hover/result:scale-105 transition-transform"
                  >
                    <a
                      href={`/api/out/${winner.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Switch & Save <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
                <div className="h-16 w-16 rounded-3xl bg-emerald-500 shrink-0 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover/result:rotate-12 transition-transform">
                  <TrendingDown className="h-8 w-8" />
                </div>
              </div>
            </MotionDiv>
          ) : (
            <div className="p-8 rounded-[2.5rem] bg-muted/30 border border-border/10 flex items-center gap-6">
              <ShieldCheck className="h-10 w-10 text-muted-foreground opacity-30" />
              <p className="text-xs font-bold leading-relaxed text-muted-foreground italic">
                Infrastructure parity detected. Both systems present identical
                economic footprints at this revenue scale.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
