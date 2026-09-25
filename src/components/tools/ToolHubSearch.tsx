"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Filter,
  Layers,
  Image as ImageIcon,
  FileText,
  Calculator as CalcIcon,
  Code2,
  Cpu,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Sliders,
  Wand2,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Zap,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ToolDefinition } from "@/data/tools/registry";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { GLASS_CARD_SM } from "@/lib/design-tokens";

// ── IMPORT ALL SURGICAL-GRADE TOOL ENGINES ─────────────────────────────────────
import { ImageWorkspace } from "./implementations/ImageWorkspace";
import { PDFWorkspace, PDFPageItem } from "./implementations/PDFWorkspace";
import { CalculatorWorkspace } from "./implementations/CalculatorWorkspace";
import { WorkflowWorkspace } from "./implementations/WorkflowWorkspace";
import { TextWorkspace } from "./implementations/TextWorkspace";
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

type WorkspaceCategory = "developer" | "pdf" | "image" | "calculators" | "ai" | "text" | "all";

export function ToolHubSearch({ tools, categories }: ToolHubSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WorkspaceCategory>("developer");
  const [viewMode, setViewMode] = useState<"workspace" | "grid">("workspace");
  const [isFullscreenUniverse, setIsFullscreenUniverse] = useState(false);
  
  // Active sub-tool within category workspace
  const [activeSubTool, setActiveSubTool] = useState<string>("json-formatter");

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Handle ESC key to exit fullscreen universe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreenUniverse) {
        setIsFullscreenUniverse(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenUniverse]);

  // Lock body scroll when in Fullscreen Universe mode
  useEffect(() => {
    if (isFullscreenUniverse) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreenUniverse]);

  // Workspace Nav Options
  const workspaceTabs = useMemo(() => [
    { id: "developer", label: "Developer IDE Suite", icon: Code2, count: tools.filter(t => t.category === "developer").length, badge: "Surgical IDE" },
    { id: "pdf", label: "PDF Suite Workspace", icon: FileText, count: tools.filter(t => t.category === "pdf").length, badge: "Client Engine" },
    { id: "image", label: "Image Studio Workspace", icon: ImageIcon, count: tools.filter(t => t.category === "image").length, badge: "Live Studio" },
    { id: "calculators", label: "Calculators & ROI", icon: CalcIcon, count: tools.filter(t => t.category === "calculators").length, badge: "Financial Engine" },
    { id: "ai", label: "AI & Creator Studio", icon: Cpu, count: tools.filter(t => t.category === "ai").length, badge: "AI Powered" },
    { id: "text", label: "Text & Data Utility", icon: Terminal, count: tools.filter(t => t.category === "text").length, badge: "Data Studio" },
    { id: "all", label: "All Utilities Directory", icon: LayoutGrid, count: tools.length, badge: "Master Catalog" },
  ], [tools]);

  // Sub-tool switcher definitions per category
  const subToolOptions = useMemo(() => {
    switch (selectedCategory) {
      case "developer":
        return [
          { id: "json-formatter", label: "JSON Formatter" },
          { id: "json-validator", label: "JSON Validator" },
          { id: "json-minifier", label: "JSON Minifier" },
          { id: "base64-encoder", label: "Base64 Encoder" },
          { id: "base64-decoder", label: "Base64 Decoder" },
          { id: "jwt-decoder", label: "JWT Decoder" },
          { id: "uuid-generator", label: "UUID Generator" },
          { id: "password-generator", label: "Password Gen" },
          { id: "regex-tester", label: "Regex Tester" },
          { id: "sql-formatter", label: "SQL Formatter" },
          { id: "cron-generator", label: "Cron Generator" },
          { id: "text-studio", label: "Text Workspace" },
        ];
      case "pdf":
        return [
          { id: "pdf-workspace", label: "PDF Studio Canvas" },
          { id: "merge-pdf", label: "Merge PDF" },
          { id: "split-pdf", label: "Split PDF" },
          { id: "compress-pdf", label: "Compress PDF" },
          { id: "jpg-to-pdf", label: "JPG to PDF" },
          { id: "pdf-to-text", label: "PDF to Text" },
          { id: "pdf-rotator", label: "PDF Rotator" },
        ];
      case "calculators":
        return [
          { id: "general-calculators", label: "Calculator Suite" },
          { id: "pricing-calculator", label: "Pricing Calculator" },
          { id: "stack-optimizer", label: "Stack Optimizer" },
          { id: "churn-forecaster", label: "Churn Forecaster" },
          { id: "ad-profit", label: "Ad Profit Predictor" },
          { id: "platform-finder", label: "Creator Match" },
        ];
      case "ai":
        return [
          { id: "platform-finder", label: "Creator Match AI" },
          { id: "stack-optimizer", label: "Stack Optimizer AI" },
          { id: "workflow-studio", label: "Workflow Studio" },
        ];
      case "image":
        return [
          { id: "image-studio", label: "Image Studio Canvas" },
        ];
      case "text":
        return [
          { id: "text-studio", label: "Text Utilities Canvas" },
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

  // Render main active interactive studio canvas component
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

      // ── IMAGE & TEXT CANVASES ──
      case "image-studio": return <ImageWorkspace defaultMode="compress" />;
      case "text-studio": return <TextWorkspace defaultMode="count" />;

      default:
        if (selectedCategory === "image") return <ImageWorkspace defaultMode="compress" />;
        if (selectedCategory === "pdf") return <PDFWorkspace onProcess={handlePdfProcess} processButtonLabel="Export PDF Studio" toolSlug="pdf-suite" />;
        if (selectedCategory === "calculators") return <CalculatorWorkspace activeToolId="percentage-calculator" />;
        if (selectedCategory === "text") return <TextWorkspace defaultMode="count" />;
        return <JSONFormatter />;
    }
  };

  const renderGridDirectory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground">
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
        <div className="text-center py-16 bg-card/20 border border-dashed border-border/40 rounded-2xl p-8 space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No tools matched your query</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn&apos;t find any tools matching &quot;{searchQuery}&quot;. Try adjusting your search term.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Clear Search & View All
          </button>
        </div>
      )}
    </div>
  );

  const containerClasses = isFullscreenUniverse
    ? "fixed inset-0 z-[999] bg-background text-foreground w-screen h-screen overflow-hidden flex flex-col p-3 sm:p-6"
    : "space-y-6";

  return (
    <div className={containerClasses}>
      {/* PROFESSIONAL STUDIO HEADER TOOLBAR */}
      <div className="bg-card/70 border border-border/50 rounded-2xl p-3 sm:p-4 backdrop-blur-2xl shadow-2xl shrink-0 space-y-3 ring-1 ring-primary/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Active Studio Branding & Privacy Telemetry */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  Comparlify Studio Universe
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Engine
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/20">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  100% Client-Side Private
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                High-performance surgical web utilities & financial engines
              </p>
            </div>
          </div>

          {/* Quick Search & Workspace Mode Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. 'JSON', 'PDF', 'ROI', 'Base64')..."
                className="w-full bg-background/80 border border-border/60 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-background/80 border border-border/50 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("workspace")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "workspace"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Studio View</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Catalog Grid</span>
              </button>
            </div>

            {/* Fullscreen Universe Button */}
            <button
              onClick={() => setIsFullscreenUniverse(!isFullscreenUniverse)}
              className="p-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold"
              title={isFullscreenUniverse ? "Exit Fullscreen Workspace (Esc)" : "Expand to Fullscreen Separate Universe"}
            >
              {isFullscreenUniverse ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Exit Universe</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Fullscreen Universe</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* WORKSPACE SIDEBAR HORIZONTAL CATEGORY SWITCHER */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-border/20">
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
                className={`px-3.5 py-2 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]"
                    : "bg-background/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/30"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SUB-TOOL INTERACTIVE TOOLBAR (When in Studio View and Category has Sub-Tools) */}
        {viewMode === "workspace" && subToolOptions.length > 0 && selectedCategory !== "all" && (
          <div className="pt-2 border-t border-border/15 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mr-1 shrink-0 flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" /> Active Tool:
            </span>
            {subToolOptions.map((sub) => {
              const isActive = activeSubTool === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTool(sub.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? "bg-primary/20 text-primary border-primary/40 font-bold shadow-sm"
                      : "bg-background/50 hover:bg-secondary/70 text-muted-foreground hover:text-foreground border-border/20"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MAIN WORKSPACE STUDIO CANVAS */}
      <div className={isFullscreenUniverse ? "flex-1 overflow-y-auto mt-3 pr-1 scrollbar-none" : "min-h-[550px]"}>
        {viewMode === "workspace" && !isSearching ? (
          <div className="bg-card/40 rounded-2xl border border-border/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
            {renderActiveToolComponent()}
          </div>
        ) : (
          renderGridDirectory()
        )}
      </div>
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
      <Card className={cn(GLASS_CARD_SM, "p-4 sm:p-5 h-full hover:bg-card/60 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-0.5")}>
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              {tool.title}
              {tool.tag === "🔥" && (
                <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shadow-sm">
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
        <div className="mt-5 pt-3.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Launch Utility
          </span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
