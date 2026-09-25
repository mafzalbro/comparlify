"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Layers,
  Image as ImageIcon,
  FileText,
  Calculator as CalcIcon,
  Code2,
  Cpu,
  LayoutGrid,
  Sliders,
  Wand2,
  Terminal,
  ShieldCheck,
  Zap,
  Globe,
  Home,
  ChevronRight,
  Heart,
  Smile,
  Star
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ToolDefinition } from "@/data/tools/registry";
import { cn } from "@/lib/utils";
import { GLASS_CARD_SM } from "@/lib/design-tokens";

// ── IMPORT ALL SURGICAL-GRADE TOOL ENGINES ─────────────────────────────────────
import { ImageWorkspace } from "./implementations/ImageWorkspace";
import { PDFWorkspace, PDFPageItem } from "./implementations/PDFWorkspace";
import { CalculatorWorkspace } from "./implementations/CalculatorWorkspace";
import { WorkflowWorkspace } from "./implementations/WorkflowWorkspace";
import { TextWorkspace } from "./implementations/TextWorkspace";
import { WebDiagnosticsWorkspace } from "./implementations/WebDiagnosticsWorkspace";
import { PDFDocument } from "pdf-lib";

// Developer Tools
import { JSONFormatter } from "./implementations/JSONFormatter";
import { JSONValidator } from "./implementations/JSONValidator";
import { JSONMinifier } from "./implementations/JSONMinifier";
import { Base64Encoder } from "./implementations/Base64Encoder";
import { Base64Decoder } from "./implementations/Base64Decoder";
import { JWTDecoder } from "./implementations/JWTDecoder";
import { UUIDGenerator } from "./implementations/UUIDGenerator";
import { PasswordGenerator } from "./implementations/PasswordGenerator";
import { RegexTester } from "./implementations/RegexTester";
import { SQLFormatterTool } from "./implementations/SQLFormatter";
import { CronGenerator } from "./implementations/CronGenerator";

// PDF Tools
import { MergePDF } from "./implementations/MergePDF";
import { SplitPDF } from "./implementations/SplitPDF";
import { CompressPDF } from "./implementations/CompressPDF";
import { JPGToPDF } from "./implementations/JPGToPDF";
import { PDFToText } from "./implementations/PDFToText";
import { PDFRotator } from "./implementations/PDFRotator";

// Financial & Creator Tools
import { PricingCalculator } from "./pricing-calculator";
import { StackOptimizer } from "./stack-optimizer";
import { ChurnForecaster } from "./churn-forecaster";
import { AdProfitPredictor } from "./ad-profit-predictor";
import { PlatformFinder } from "./implementations/PlatformFinder";

interface CategoryMeta {
  name: string;
  description: string;
  subcategories: Record<string, string>;
}

interface ToolHubSearchProps {
  tools: ToolDefinition[];
  categories: Record<string, CategoryMeta>;
}

type WorkspaceCategory = "developer" | "pdf" | "image" | "calculators" | "ai" | "text" | "web" | "all";

export function ToolHubSearch({ tools, categories }: ToolHubSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WorkspaceCategory>("developer");
  const [viewMode, setViewMode] = useState<"workspace" | "grid">("workspace");
  
  // Active sub-tool within category workspace
  const [activeSubTool, setActiveSubTool] = useState<string>("json-formatter");

  // Lock body scroll for standalone desktop workspace suite
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Sidebar Workspace Tabs List (Cute, charmingly formatted)
  const workspaceTabs = useMemo(() => [
    { id: "developer", label: "Developer Studio ✨", icon: Code2, count: tools.filter(t => t.category === "developer").length, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", emoji: "💻" },
    { id: "pdf", label: "PDF Suite Magic 📄", icon: FileText, count: tools.filter(t => t.category === "pdf").length, color: "text-rose-400 bg-rose-500/10 border-rose-500/30", emoji: "📄" },
    { id: "image", label: "Image Creative Studio 🎨", icon: ImageIcon, count: tools.filter(t => t.category === "image").length, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", emoji: "🎨" },
    { id: "calculators", label: "Calculators & ROI 💰", icon: CalcIcon, count: tools.filter(t => t.category === "calculators").length, color: "text-amber-400 bg-amber-500/10 border-amber-500/30", emoji: "🧮" },
    { id: "ai", label: "AI Creator Hub 🔮", icon: Cpu, count: tools.filter(t => t.category === "ai").length, color: "text-purple-400 bg-purple-500/10 border-purple-500/30", emoji: "🤖" },
    { id: "text", label: "Text & Data Tools 🪄", icon: Terminal, count: tools.filter(t => t.category === "text").length, color: "text-blue-400 bg-blue-500/10 border-blue-500/30", emoji: "📝" },
    { id: "web", label: "Web SEO Inspector 🚀", icon: Globe, count: tools.filter(t => t.category === "developer" || t.category === "text").length, color: "text-teal-400 bg-teal-500/10 border-teal-500/30", emoji: "🌐" },
    { id: "all", label: "Master Catalog 🌟", icon: LayoutGrid, count: tools.length, color: "text-pink-400 bg-pink-500/10 border-pink-500/30", emoji: "🔲" },
  ], [tools]);

  // Sub-tool switcher options per category
  const subToolOptions = useMemo(() => {
    switch (selectedCategory) {
      case "developer":
        return [
          { id: "json-formatter", label: "✨ JSON Formatter" },
          { id: "json-validator", label: "🔍 JSON Validator" },
          { id: "json-minifier", label: "⚡ JSON Minifier" },
          { id: "base64-encoder", label: "🔐 Base64 Encoder" },
          { id: "base64-decoder", label: "🔓 Base64 Decoder" },
          { id: "jwt-decoder", label: "🔑 JWT Decoder" },
          { id: "uuid-generator", label: "🎲 UUID Generator" },
          { id: "password-generator", label: "🛡️ Password Gen" },
          { id: "regex-tester", label: "🎯 Regex Tester" },
          { id: "sql-formatter", label: "🗄️ SQL Formatter" },
          { id: "cron-generator", label: "⏰ Cron Generator" },
          { id: "text-studio", label: "📝 Text Workspace" },
        ];
      case "pdf":
        return [
          { id: "pdf-workspace", label: "💖 PDF Studio Canvas" },
          { id: "merge-pdf", label: "🔗 Merge PDF" },
          { id: "split-pdf", label: "✂️ Split PDF" },
          { id: "compress-pdf", label: "🗜️ Compress PDF" },
          { id: "jpg-to-pdf", label: "🖼️ JPG to PDF" },
          { id: "pdf-to-text", label: "📜 PDF to Text" },
          { id: "pdf-rotator", label: "🔄 PDF Rotator" },
        ];
      case "calculators":
        return [
          { id: "general-calculators", label: "🧮 Calculator Suite" },
          { id: "pricing-calculator", label: "💵 Pricing Calculator" },
          { id: "stack-optimizer", label: "🚀 Stack Optimizer" },
          { id: "churn-forecaster", label: "📈 Churn Forecaster" },
          { id: "ad-profit", label: "📊 Ad Profit Predictor" },
          { id: "platform-finder", label: "🤝 Creator Match" },
        ];
      case "ai":
        return [
          { id: "platform-finder", label: "🔮 Creator Match AI" },
          { id: "stack-optimizer", label: "🧠 Stack Optimizer AI" },
          { id: "workflow-studio", label: "⚡ Workflow Studio" },
        ];
      case "image":
        return [
          { id: "image-studio", label: "🎨 Image Studio Canvas" },
        ];
      case "text":
        return [
          { id: "text-studio", label: "🪄 Text Utilities Canvas" },
        ];
      case "web":
        return [
          { id: "web-diagnostics", label: "🌐 Web Diagnostics Studio" },
        ];
      default:
        return [];
    }
  }, [selectedCategory]);

  // Set default sub-tool when category changes
  useEffect(() => {
    if (subToolOptions.length > 0) {
      setActiveSubTool(subToolOptions[0].id);
    }
  }, [selectedCategory, subToolOptions]);

  // Filtered tools query logic
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      if (selectedCategory !== "all" && tool.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        (tool.subcategory && tool.subcategory.toLowerCase().includes(q)) ||
        (tool.tag && tool.tag.toLowerCase().includes(q))
      );
    });
  }, [tools, searchQuery, selectedCategory]);

  const isSearching = searchQuery.trim().length > 0;

  // Handle PDF workspace process callback
  const handlePdfProcess = async (pages: PDFPageItem[], originalPdfDoc: PDFDocument): Promise<Uint8Array> => {
    const newPdf = await PDFDocument.create();
    for (const pageItem of pages) {
      const [copiedPage] = await newPdf.copyPages(originalPdfDoc, [pageItem.originalIndex]);
      if (pageItem.rotation !== 0) {
        copiedPage.setRotation((copiedPage.getRotation().angle + pageItem.rotation) % 360 as any);
      }
      newPdf.addPage(copiedPage);
    }
    return await newPdf.save();
  };

  // Render main active interactive tool component inside workspace canvas
  const renderActiveToolComponent = () => {
    switch (activeSubTool) {
      // ── DEVELOPER TOOLS ──
      case "json-formatter": return <JSONFormatter />;
      case "json-validator": return <JSONValidator />;
      case "json-minifier": return <JSONMinifier />;
      case "base64-encoder": return <Base64Encoder />;
      case "base64-decoder": return <Base64Decoder />;
      case "jwt-decoder": return <JWTDecoder />;
      case "uuid-generator": return <UUIDGenerator />;
      case "password-generator": return <PasswordGenerator />;
      case "regex-tester": return <RegexTester />;
      case "sql-formatter": return <SQLFormatterTool />;
      case "cron-generator": return <CronGenerator />;

      // ── PDF TOOLS ──
      case "pdf-workspace":
        return <PDFWorkspace onProcess={handlePdfProcess} processButtonLabel="Export PDF Studio" toolSlug="pdf-suite" />;
      case "merge-pdf": return <MergePDF />;
      case "split-pdf": return <SplitPDF />;
      case "compress-pdf": return <CompressPDF />;
      case "jpg-to-pdf": return <JPGToPDF />;
      case "pdf-to-text": return <PDFToText />;
      case "pdf-rotator": return <PDFRotator />;

      // ── CALCULATOR & FINANCIAL TOOLS ──
      case "general-calculators": return <CalculatorWorkspace activeToolId="percentage-calculator" />;
      case "pricing-calculator": return <PricingCalculator platforms={[]} />;
      case "stack-optimizer": return <StackOptimizer />;
      case "churn-forecaster": return <ChurnForecaster />;
      case "ad-profit": return <AdProfitPredictor />;
      case "platform-finder": return <PlatformFinder />;

      // ── AI & WORKFLOW ──
      case "workflow-studio": return <WorkflowWorkspace activeToolId="api-request-builder" />;

      // ── WEB DIAGNOSTICS ──
      case "web-diagnostics": return <WebDiagnosticsWorkspace activeToolId="url-analyzer" />;

      // ── IMAGE & TEXT CANVASES ──
      case "image-studio": return <ImageWorkspace defaultMode="compress" />;
      case "text-studio": return <TextWorkspace defaultMode="count" />;

      default:
        if (selectedCategory === "image") return <ImageWorkspace defaultMode="compress" />;
        if (selectedCategory === "pdf") return <PDFWorkspace onProcess={handlePdfProcess} processButtonLabel="Export PDF Studio" toolSlug="pdf-suite" />;
        if (selectedCategory === "calculators") return <CalculatorWorkspace activeToolId="percentage-calculator" />;
        if (selectedCategory === "text") return <TextWorkspace defaultMode="count" />;
        if (selectedCategory === "web") return <WebDiagnosticsWorkspace activeToolId="url-analyzer" />;
        return <JSONFormatter />;
    }
  };

  const renderGridDirectory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>✨</span>
            {selectedCategory === "all" ? "Master Tool Catalog" : `${categories[selectedCategory]?.name || selectedCategory} Utilities`}
          </h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border/30">
            {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
          </span>
        </div>
        {isSearching && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            Reset Filters
          </button>
        )}
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/20 border border-dashed border-border/40 rounded-3xl p-8 space-y-4">
          <div className="h-12 w-12 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No matching tools found ✨</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn&apos;t find any tools matching &quot;{searchQuery}&quot;. Try adjusting your search query!
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold hover:brightness-110 transition-all shadow-md"
          >
            Clear Search & View All
          </button>
        </div>
      )}
    </div>
  );

  const activeTabMeta = workspaceTabs.find(t => t.id === selectedCategory) || workspaceTabs[0];

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground h-screen w-screen flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* ── LEFT DEDICATED WORKSPACE SIDEBAR ────────────────────────────────────── */}
      <aside className="w-full md:w-72 bg-card/70 border-b md:border-b-0 md:border-r border-border/40 backdrop-blur-2xl flex flex-col justify-between p-4 shrink-0 h-auto md:h-full z-20">
        <div className="space-y-5">
          {/* Logo & Platform Telemetry */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-pink-500/20">
                ✨
              </div>
              <div>
                <span className="font-black text-sm tracking-tight text-foreground block leading-none flex items-center gap-1">
                  Comparlify <Heart className="h-3 w-3 text-pink-500 fill-pink-500 animate-pulse inline" />
                </span>
                <span className="text-[10px] font-bold text-pink-400 tracking-widest uppercase">
                  Cute Studio Workspaces
                </span>
              </div>
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Studio
            </span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

          {/* Workspaces List Navigation */}
          <div className="space-y-1.5">
            <div className="px-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="h-3 w-3 text-pink-400" /> Select Workspace:
              </span>
              <span className="text-pink-400">💖</span>
            </div>
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id as WorkspaceCategory);
                    if (tab.id !== "all" && viewMode === "grid") {
                      setViewMode("workspace");
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-between border ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500/90 via-purple-600/90 to-indigo-600/90 text-white border-pink-400/50 shadow-md shadow-pink-500/15 ring-2 ring-pink-500/20 scale-[1.02]"
                      : "bg-background/40 hover:bg-secondary/70 text-muted-foreground hover:text-foreground border-border/20 hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm shrink-0">{tab.emoji}</span>
                    <span className="truncate font-semibold">{tab.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-border/20 space-y-3 mt-4 md:mt-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground/80 px-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>100% Client-Side Private • Fast</span>
          </div>
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-background/50 hover:bg-secondary text-xs font-bold text-muted-foreground hover:text-foreground border border-border/25 transition-all group shadow-sm hover:scale-[1.01]"
          >
            <span className="flex items-center gap-2">
              <Home className="h-3.5 w-3.5 text-pink-400" /> Return to Main Site
            </span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-pink-400" />
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT CANVAS PANEL ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background/50">
        
        {/* Top App Header */}
        <header className="bg-card/50 border-b border-border/30 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-2xl border ${activeTabMeta.color} shadow-sm`}>
              <activeTabMeta.icon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
                <span>{activeTabMeta.emoji}</span> {activeTabMeta.label}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {categories[selectedCategory]?.description || "Charming, high-performance browser studio"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Search */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. 'JSON', 'PDF')..."
                className="w-full bg-background/80 border border-border/60 rounded-2xl pl-9 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-background/80 border border-border/50 p-1 rounded-2xl shrink-0">
              <button
                onClick={() => setViewMode("workspace")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "workspace"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Studio View</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Catalog Grid</span>
              </button>
            </div>
          </div>
        </header>

        {/* Sub-Tool Switcher Bar (Cute Pills) */}
        {viewMode === "workspace" && subToolOptions.length > 0 && selectedCategory !== "all" && (
          <div className="bg-background/60 border-b border-border/20 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none backdrop-blur-md">
            <span className="text-[11px] font-extrabold text-pink-400 uppercase tracking-widest mr-1 shrink-0 flex items-center gap-1">
              <Zap className="h-3 w-3 text-pink-400" /> Active Tool:
            </span>
            {subToolOptions.map((sub) => {
              const isActive = activeSubTool === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTool(sub.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 text-pink-300 border-pink-500/40 shadow-sm ring-1 ring-pink-500/20 scale-[1.02]"
                      : "bg-card/40 hover:bg-secondary/70 text-muted-foreground hover:text-foreground border-border/20 hover:scale-[1.01]"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Interactive Workspace Studio Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {viewMode === "workspace" && !isSearching ? (
            <div className="bg-card/40 rounded-3xl border border-border/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 min-h-[500px]">
              {renderActiveToolComponent()}
            </div>
          ) : (
            renderGridDirectory()
          )}
        </div>

      </main>
    </div>
  );
}

// Helper Tool Card Component
function ToolCard({ tool }: { tool: ToolDefinition }) {
  const href = tool.subcategory
    ? `/tools/${tool.category}/${tool.subcategory}/${tool.slug}`
    : `/tools/${tool.category}/${tool.slug}`;

  return (
    <Link href={href} className="group block h-full">
      <Card className={cn(GLASS_CARD_SM, "p-4 sm:p-5 h-full hover:bg-card/60 hover:border-pink-500/40 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1 rounded-3xl")}>
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-base font-bold text-foreground group-hover:text-pink-400 transition-colors flex items-center gap-1.5">
              <span>✨</span> {tool.title}
              {tool.tag === "🔥" && (
                <span className="text-[9px] font-bold bg-pink-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                  New
                </span>
              )}
            </h4>
            {tool.status && (
              <span className="text-[9px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/15">
                {tool.status}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            {tool.description}
          </p>
        </div>
        <div className="mt-5 pt-3.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-pink-400 uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-pink-400" /> Launch Tool
          </span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
