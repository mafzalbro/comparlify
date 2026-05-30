"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  Mail,
  Users,
  CreditCard,
  Layers,
  Sparkles,
  Info,
  Workflow,
  Save,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createStackFromBlueprint } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ToolOption {
  id: string;
  name: string;
  monthlyPrice: number;
  category: "LMS" | "EMAIL" | "COMMUNITY" | "PAYMENTS";
  includes?: string[];
  description: string;
}

const STATIC_EXTERNAL_TOOLS: ToolOption[] = [
  {
    id: "convertkit",
    name: "ConvertKit",
    monthlyPrice: 29,
    category: "EMAIL",
    description: "Creators' favorite email marketing.",
  },
  {
    id: "activecampaign",
    name: "ActiveCampaign",
    monthlyPrice: 49,
    category: "EMAIL",
    description: "Advanced automation for growth.",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    monthlyPrice: 20,
    category: "EMAIL",
    description: "Standard newsletter tool.",
  },
  {
    id: "circle",
    name: "Circle.so",
    monthlyPrice: 99,
    category: "COMMUNITY",
    description: "Premium community experience.",
  },
  {
    id: "skool",
    name: "Skool",
    monthlyPrice: 99,
    category: "COMMUNITY",
    description: "Gamified community & courses.",
  },
  {
    id: "stripe",
    name: "Stripe",
    monthlyPrice: 0,
    category: "PAYMENTS",
    description: "Standard payment processing.",
  },
];

interface StackArchitectProps {
  platforms: any[];
  projects: any[];
}

export function StackArchitect({ platforms, projects }: StackArchitectProps) {
  const { toast } = useToast();

  const dynamicLMS = useMemo(() => {
    return platforms.filter(p =>
        !p.name.toLowerCase().includes("email") &&
        !p.name.toLowerCase().includes("community")
    );
  }, [platforms]);

  const dynamicEmail = useMemo(() => {
    const dbEmail = platforms
        .filter(p => p.name.toLowerCase().includes("email") || p.name === "Kit")
        .map(p => ({
            id: p.id,
            name: p.name,
            monthlyPrice: p.tiers?.[0]?.monthlyPrice || 0,
            category: "EMAIL" as const,
            description: p.description.substring(0, 50) + "..."
        }));
    return [...dbEmail, ...STATIC_EXTERNAL_TOOLS.filter(t => t.category === "EMAIL")];
  }, [platforms]);

  const dynamicCommunity = useMemo(() => {
    const dbComm = platforms
        .filter(p => p.name.toLowerCase().includes("community") || p.name === "Skool" || p.name === "Circle")
        .map(p => ({
            id: p.id,
            name: p.name,
            monthlyPrice: p.tiers?.[0]?.monthlyPrice || 0,
            category: "COMMUNITY" as const,
            description: p.description.substring(0, 50) + "..."
        }));
    return [...dbComm, ...STATIC_EXTERNAL_TOOLS.filter(t => t.category === "COMMUNITY")];
  }, [platforms]);

  const [selectedLMS, setSelectedLMS] = useState<string>("");
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [selectedPayments, setSelectedPayments] = useState<string>("stripe");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const lmsData = dynamicLMS.find((p) => p.id === selectedLMS);
  const emailData = dynamicEmail.find((t) => t.id === selectedEmail);
  const communityData = dynamicCommunity.find((t) => t.id === selectedCommunity);
  const paymentData = STATIC_EXTERNAL_TOOLS.find((t) => t.id === selectedPayments);

  const stack = [
    { label: "LMS Core", data: lmsData, icon: Layers, type: "LMS" },
    { label: "Email Marketing", data: emailData, icon: Mail, type: "EMAIL" },
    { label: "Community", data: communityData, icon: Users, type: "COMMUNITY" },
    {
      label: "Payments",
      data: paymentData,
      icon: CreditCard,
      type: "PAYMENTS",
    },
  ];

  const totalCost =
    (lmsData?.tiers?.[0]?.monthlyPrice || 0) +
    (emailData?.monthlyPrice || 0) +
    (communityData?.monthlyPrice || 0);

  const handleSaveStack = async () => {
    if (!selectedProjectId) {
      toast({
        title: "Project Required",
        description: "Please select a project to link this stack to.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const selectedPlatforms = [];
      if (selectedLMS) selectedPlatforms.push({ platformId: selectedLMS, role: "LMS" });
      if (selectedEmail) selectedPlatforms.push({ platformId: selectedEmail, role: "EMAIL" });
      if (selectedCommunity) selectedPlatforms.push({ platformId: selectedCommunity, role: "COMMUNITY" });
      if (selectedPayments) selectedPlatforms.push({ platformId: selectedPayments, role: "PAYMENTS" });

      const result = await createStackFromBlueprint(selectedProjectId, selectedPlatforms);

      if (result.success) {
        toast({
          title: "Blueprint Recorded",
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
        description: "Failed to save stack.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const warnings = useMemo(() => {
    const list = [];
    if (lmsData?.name === "Kajabi") {
      if (selectedEmail)
        list.push(
          "Kajabi includes robust Email Marketing. You likely don't need " +
            emailData?.name +
            ".",
        );
      if (selectedCommunity)
        list.push(
          "Kajabi has built-in Communities. Switching to Circle/Skool adds extra cost.",
        );
    }
    if (lmsData?.name === "Teachable" && !selectedCommunity) {
      list.push(
        "Teachable's native community features are basic. Consider adding Circle or Skool for higher engagement.",
      );
    }
    return list;
  }, [selectedEmail, selectedCommunity, lmsData, emailData, communityData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Configuration */}
      <div className="lg:col-span-5 space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-4">
          Assemble Your Stack
        </h3>

        <div className="space-y-4">
          {/* LMS Selection */}
          <Card className="p-6 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-sm font-black uppercase tracking-tight">
                LMS Platform (Core)
              </span>
            </div>
            <select
              value={selectedLMS}
              onChange={(e) => setSelectedLMS(e.target.value)}
              className="w-full bg-background/50 border border-border/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Select Platform...</option>
              {dynamicLMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.tiers?.[0]?.monthlyPrice || 0}/mo)
                </option>
              ))}
            </select>
          </Card>

          {/* Email Selection */}
          <Card className="p-6 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-sm font-black uppercase tracking-tight">
                Email Marketing
              </span>
            </div>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full bg-background/50 border border-border/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">No External Tool (Use LMS Native)</option>
              {dynamicEmail.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (+${t.monthlyPrice}/mo)
                </option>
              ))}
            </select>
          </Card>

          {/* Community Selection */}
          <Card className="p-6 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-sm font-black uppercase tracking-tight">
                Community Tool
              </span>
            </div>
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full bg-background/50 border border-border/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">No External Tool (Use LMS Native)</option>
              {dynamicCommunity.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (+${t.monthlyPrice}/mo)
                </option>
              ))}
            </select>
          </Card>
        </div>
      </div>

      {/* Right: Stack Visualization */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
              Stack <span className="text-primary italic">Blueprint</span>
            </h3>
            <div className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xl font-black italic">
              ${totalCost}/mo
            </div>
          </div>

          {projects.length > 0 && (
            <div className="mb-8 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Workflow className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Architectural Sync</p>
                  <p className="text-[9px] font-medium text-muted-foreground uppercase opacity-60">Record this blueprint in a Workspace</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-border/10 rounded-xl h-12 text-[10px] font-black uppercase tracking-tight">
                    <SelectValue placeholder="Select Project" />
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
                  onClick={handleSaveStack}
                  disabled={isSaving || !selectedProjectId}
                  className="rounded-xl px-8 h-12 bg-primary text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Record
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4 relative z-10">
            {stack.map((item, i) => (
              <MotionDiv
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                    "flex items-center gap-6 p-6 rounded-3xl border transition-all",
                    item.data ? "bg-background/80 border-primary/20 shadow-lg" : "bg-muted/30 border-dashed border-border/20 opacity-50"
                )}
              >
                <div
                  className={cn(
                      "p-4 rounded-2xl",
                      item.data ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">
                    {item.label}
                  </p>
                  <h4 className="text-lg font-black tracking-tight">
                    {item.data?.name || "Not Selected"}
                  </h4>
                </div>
                {item.data && (
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">
                      $
                      {(item.data as any).monthlyPrice ||
                        (item.data as any).tiers?.[0]?.monthlyPrice ||
                        0}
                    </p>
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                      Fixed Cost
                    </p>
                  </div>
                )}
              </MotionDiv>
            ))}
          </div>

          {warnings.length > 0 && (
            <div className="mt-12 space-y-3">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" /> Stack Optimization Alerts
              </h5>
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-200 leading-relaxed"
                >
                  {w}
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 p-8 rounded-4xl bg-muted/30 border border-border/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">
                  Total Yearly Investment
                </p>
                <p className="text-2xl font-black text-foreground">
                  ${(totalCost * 12).toLocaleString()}
                </p>
              </div>
            </div>
            <button className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
              Get Best Pricing <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
