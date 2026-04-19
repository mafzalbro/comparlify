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
  FileDown,
  Save,
  Loader2,
  Share2,
  Scale,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveRoiSnapshot } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  projects: any[];
}

export function ROICalculator({ platforms, projects }: ROICalculatorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Consolidate search params and defaults
  const searchRevenue = Number(searchParams.get("revenue")) || Number(searchParams.get("revenue_match")) || 5000;
  const searchSales = Number(searchParams.get("sales")) || 50;
  const searchInterval = (searchParams.get("interval") as any) || "monthly";
  const searchGateway = searchParams.get("gateway") || "stripe";
  const searchCP = searchParams.get("cp") || platforms[0]?.id || "";
  const searchCT = searchParams.get("ct") || platforms.find(p => p.id === (searchParams.get("cp") || platforms[0]?.id))?.tiers[0]?.id || "";

  const [revenue, setRevenue] = useState(searchRevenue);
  const [salesCount, setSalesCount] = useState(searchSales);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annually">(searchInterval);
  const [gatewayId, setGatewayId] = useState(searchGateway);
  const [currentPlatformId, setCurrentPlatformId] = useState(searchCP);
  const [currentTierId, setCurrentTierId] = useState(searchCT);
  
  const [contenderPlatformId, setContenderPlatformId] = useState(() => searchParams.get("vp") || "");
  const [contenderTierId, setContenderTierId] = useState(() => searchParams.get("vt") || "");
  const [projectionYears, setProjectionYears] = useState<1 | 3>(() => Number(searchParams.get("years")) as any || 1);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state to URL for sharing
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("revenue", revenue.toString());
    params.set("sales", salesCount.toString());
    params.set("interval", billingInterval);
    params.set("gateway", gatewayId);
    params.set("cp", currentPlatformId);
    params.set("ct", currentTierId);
    if (contenderPlatformId) params.set("vp", contenderPlatformId);
    if (contenderTierId) params.set("vt", contenderTierId);
    params.set("years", projectionYears.toString());
    
    const query = params.toString();
    router.replace(`/tools/roi-calculator?${query}`, { scroll: false });
  }, [revenue, salesCount, billingInterval, gatewayId, currentPlatformId, currentTierId, contenderPlatformId, contenderTierId, projectionYears, router]);

  const handlePlatformChange = (id: string, isContender = false) => {
    if (isContender) {
      if (id === "none") {
        setContenderPlatformId("");
        setContenderTierId("");
        return;
      }
      setContenderPlatformId(id);
      const platform = platforms.find((p) => p.id === id);
      if (platform?.tiers.length) {
        setContenderTierId(platform.tiers[0].id);
      }
    } else {
      setCurrentPlatformId(id);
      const platform = platforms.find((p) => p.id === id);
      if (platform?.tiers.length) {
        setCurrentTierId(platform.tiers[0].id);
      }
    }
  };

  const currentPlatform = platforms.find((p) => p.id === currentPlatformId);
  const currentTier = currentPlatform?.tiers.find((t) => t.id === currentTierId);
  const gateway = GATEWAYS[gatewayId];

  const analysisData = useMemo(() => {
    if (!currentTier || !gateway) return [];

    const safeRevenue = isNaN(revenue) ? 0 : revenue;
    const safeSales = isNaN(salesCount) ? 0 : salesCount;

    const baseline = calculateROI(safeRevenue, safeSales, currentTier, gateway, billingInterval);

    return platforms.flatMap(platform => 
      (platform.tiers || []).map(tier => {
        const stats = calculateROI(safeRevenue, safeSales, tier, gateway, billingInterval);
        return {
          platformId: platform.id || "",
          platformName: platform.name || "Unknown Platform",
          tierId: tier.id || "",
          tierName: tier.name || "Standard Plan",
          displayName: `${platform.name || "Unknown"} (${tier.name || "Standard"})`,
          ...stats,
          monthlySavings: (baseline.monthlyTotalCost || 0) - (stats.monthlyTotalCost || 0),
          annualSavings: (baseline.annualTotalCost || 0) - (stats.annualTotalCost || 0)
        };
      })
    ).sort((a, b) => (a.monthlyTotalCost || 0) - (b.monthlyTotalCost || 0));
  }, [platforms, revenue, salesCount, currentTier, gateway, billingInterval]);

  const currentStats = analysisData.find((d: any) => d.tierId === currentTierId);
  const contenderStats = analysisData.find((d: any) => d.tierId === contenderTierId);
  const bestOption = analysisData[0];
  const maxSavings = bestOption ? (currentStats?.annualTotalCost || 0) - bestOption.annualTotalCost : 0;

  // Projection data based on years
  const projectionData = useMemo(() => {
    if (!currentStats || !bestOption) return [];
    
    const months = (projectionYears || 1) * 12;
    return Array.from({ length: months }, (_, i) => {
      const monthNumber = i + 1;
      const data: any = {
        month: monthNumber % 12 === 0 ? `Y${monthNumber / 12}` : null,
        Current: (currentStats.monthlyTotalCost || 0) * monthNumber,
        Optimized: (bestOption.monthlyTotalCost || 0) * monthNumber,
      };
      if (contenderStats) {
        data.Contender = (contenderStats.monthlyTotalCost || 0) * monthNumber;
      }
      return data;
    });
  }, [currentStats, bestOption, contenderStats, projectionYears]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Financial breakdown link is now in your clipboard.",
    });
  };

  const handleSave = async () => {
    if (!selectedProjectId) {
      toast({
        title: "Project Required",
        description: "Please select a project to save this calculation.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveRoiSnapshot(selectedProjectId, {
        revenue,
        salesCount,
        billingInterval,
        gatewayId,
        currentPlatformId,
        currentTierId,
        analysis: bestOption,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        toast({
          title: "Success",
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
        title: "System Error",
        description: "Something went wrong while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
                  <Select value={gatewayId} onValueChange={setGatewayId}>
                    <SelectTrigger className="w-full bg-background/50 border border-border/10 rounded-xl h-10 px-3 text-[10px] font-bold outline-none focus:ring-primary/20">
                      <SelectValue placeholder="Select Gateway" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/10 bg-card">
                      {Object.entries(GATEWAYS).map(([id, g]) => (
                        <SelectItem key={id} value={id} className="text-[10px] font-bold">
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Avg Order</label>
                  <div className="bg-background/20 border border-border/10 rounded-xl h-10 flex items-center justify-center text-[10px] font-black text-center">
                    ${salesCount > 0 ? (revenue / salesCount).toFixed(0) : 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Current Setup</label>
                <div className="space-y-3">
                  <Select value={currentPlatformId} onValueChange={(val) => handlePlatformChange(val)}>
                    <SelectTrigger className="w-full bg-primary/5 border border-primary/20 rounded-xl h-12 px-4 text-[10px] font-black uppercase tracking-tight outline-none">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/10 bg-card">
                      {platforms.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={currentTierId} onValueChange={setCurrentTierId}>
                    <SelectTrigger className="w-full bg-background/50 border border-border/10 rounded-xl h-12 px-4 text-[10px] font-bold outline-none">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/10 bg-card">
                      {currentPlatform?.tiers.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-[10px] font-bold">
                          {t.name} - ${t.monthlyPrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block flex items-center gap-2">
                  Contender <span className="text-[8px] opacity-40 italic">(Optional)</span>
                </label>
                <div className="space-y-3">
                  <Select value={contenderPlatformId} onValueChange={(val) => handlePlatformChange(val, true)}>
                    <SelectTrigger className="w-full bg-background/30 border border-border/10 rounded-xl h-12 px-4 text-[10px] font-black uppercase tracking-tight outline-none">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/10 bg-card">
                      <SelectItem value="none" className="text-[10px] font-black uppercase opacity-50">None</SelectItem>
                      {platforms.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={contenderTierId} 
                    onValueChange={setContenderTierId}
                    disabled={!contenderPlatformId || contenderPlatformId === "none"}
                  >
                    <SelectTrigger className="w-full bg-background/50 border border-border/10 rounded-xl h-12 px-4 text-[10px] font-bold outline-none">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/10 bg-card">
                      {platforms.find(p => p.id === contenderPlatformId)?.tiers.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-[10px] font-bold">
                          {t.name} - ${t.monthlyPrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {maxSavings > 0 && (
          <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-1">Max Potential Savings</p>
                <h4 className="text-4xl font-black tracking-tighter text-emerald-500">
                  ${maxSavings.toLocaleString()} <span className="text-sm font-normal">/yr</span>
                </h4>
                <p className="text-[10px] font-bold mt-2 text-muted-foreground italic line-clamp-1">Based on switching to {bestOption.platformName}</p>
                
                <Button
                  asChild
                  className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 text-[10px] font-black uppercase tracking-widest h-10 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform"
                >
                  <a
                    href={`/api/out/${bestOption.platformId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Switch & Save <Repeat className="ml-2 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
              <div className="p-6 bg-emerald-500 text-white rounded-3xl shrink-0 shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
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
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Break-Even Point</h4>
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
              <PieChart className="h-5 w-5 text-primary" /> Cost <span className="text-primary italic">Breakdown</span>
            </h3>
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-border/10">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleShare}
                className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-border/20 mx-1" />
              <button 
                onClick={() => setProjectionYears(1)}
                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${projectionYears === 1 ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
              >
                1-Year
              </button>
              <button 
                onClick={() => setProjectionYears(3)}
                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${projectionYears === 3 ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
              >
                3-Year
              </button>
            </div>
          </div>

          {projects.length > 0 && (
            <div className="mb-8 p-4 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Save to Workspace</p>
                <p className="text-[9px] font-medium text-muted-foreground">Select a project to record these financial findings.</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-full md:w-[180px] bg-background/50 border-border/10 rounded-xl h-10 text-[10px] font-black uppercase tracking-tight">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/10 bg-card">
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
                  className="rounded-xl px-6 h-10 bg-primary text-[10px] font-black uppercase tracking-widest"
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-2" />}
                  Save
                </Button>
              </div>
            </div>
          )}

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
                {contenderStats && (
                   <Line type="monotone" dataKey="Contender" stroke="#3b82f6" strokeWidth={3} dot={false} strokeDasharray="3 3" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Industry Comparison</h5>
              <div className="flex items-center gap-4 text-[9px] font-bold">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Optimized</span>
                {contenderStats && (
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> {contenderStats.platformName}</span>
                )}
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
                      <span className="text-[8px] font-black uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded italic">Best Value</span>
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
