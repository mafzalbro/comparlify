"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Image as ImageIcon,
  FileText,
  Calculator as CalcIcon,
  Terminal,
  Zap,
  Globe,
  Home,
  ChevronRight,
} from "lucide-react";
import { ToolDefinition } from "@/data/tools/registry";

// ── IMPORT ALL SURGICAL-GRADE TOOL ENGINES ─────────────────────────────────────
import { ImageWorkspace } from "./implementations/ImageWorkspace";
import { PDFWorkspace, PDFPageItem } from "./implementations/PDFWorkspace";
import { CalculatorWorkspace } from "./implementations/CalculatorWorkspace";
import { TextWorkspace } from "./implementations/TextWorkspace";
import { WebDiagnosticsWorkspace } from "./implementations/WebDiagnosticsWorkspace";
import { PDFDocument } from "pdf-lib";

// Developer & Text Tools
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
  initialSlug?: string[];
}

type WorkspaceCategory = "text" | "pdf" | "image" | "calculators" | "web" | "developer";

export function ToolHubSearch({ tools, categories, initialSlug }: ToolHubSearchProps) {

  const [selectedCategory, setSelectedCategory] = useState<WorkspaceCategory>("text");
  const [activeSubTool, setActiveSubTool] = useState<string>("text-studio");
  const [inSubNavView, setInSubNavView] = useState<boolean>(true);

  // Lock body scroll for standalone desktop workspace suite
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Parse initial slug to sync active workspace category and sub-tool on mount
  useEffect(() => {
    if (initialSlug && initialSlug.length > 0) {
      const [first, second, third] = initialSlug;
      if (first === "text" || first === "pdf" || first === "image" || first === "calculators" || first === "web" || first === "developer") {
        setSelectedCategory(first as WorkspaceCategory);
      }
      const targetSlug = third || second || first;
      if (targetSlug) {
        setActiveSubTool(targetSlug);
      }
    }
  }, [initialSlug]);

  // Sidebar Workspace Tabs List
  const workspaceTabs = useMemo(() => [
    { id: "text", label: "Text Tools", icon: Terminal, count: tools.filter(t => t.category === "text" || t.category === "developer").length },
    { id: "pdf", label: "PDF Suite", icon: FileText, count: tools.filter(t => t.category === "pdf").length },
    { id: "image", label: "Image Tools", icon: ImageIcon, count: tools.filter(t => t.category === "image").length },
    { id: "calculators", label: "Calculators & ROI", icon: CalcIcon, count: tools.filter(t => t.category === "calculators").length },
    { id: "web", label: "Web Diagnostics", icon: Globe, count: tools.filter(t => t.category === "developer" || t.category === "text").length },
  ], [tools]);

  // Sub-tool switcher options per category
  const subToolOptions = useMemo(() => {
    switch (selectedCategory) {
      case "text":
      case "developer":
        return [
          { id: "text-studio", label: "Text Workspace", slug: "text-studio" },
          { id: "json-formatter", label: "JSON Formatter", slug: "json-formatter" },
          { id: "json-validator", label: "JSON Validator", slug: "json-validator" },
          { id: "json-minifier", label: "JSON Minifier", slug: "json-minifier" },
          { id: "base64-encoder", label: "Base64 Encoder", slug: "base64-encoder" },
          { id: "base64-decoder", label: "Base64 Decoder", slug: "base64-decoder" },
          { id: "jwt-decoder", label: "JWT Decoder", slug: "jwt-decoder" },

          // Grouped close together as requested: UUID Generator, Password Gen, Regex Tester
          { id: "uuid-generator", label: "UUID Generator", slug: "uuid-generator" },
          { id: "password-generator", label: "Password Generator", slug: "password-generator" },
          { id: "regex-tester", label: "Regex Tester", slug: "regex-tester" },

          { id: "sql-formatter", label: "SQL Formatter", slug: "sql-formatter" },
          { id: "cron-generator", label: "Cron Generator", slug: "cron-generator" },
        ];
      case "pdf":
        return [
          { id: "pdf-workspace", label: "PDF Studio", slug: "pdf-suite" },
          { id: "merge-pdf", label: "Merge PDF", slug: "merge" },
          { id: "split-pdf", label: "Split PDF", slug: "split" },
          { id: "compress-pdf", label: "Compress PDF", slug: "compress" },
          { id: "jpg-to-pdf", label: "JPG to PDF", slug: "jpg-to-pdf" },
          { id: "pdf-to-text", label: "PDF to Text", slug: "pdf-to-text" },
          { id: "pdf-rotator", label: "PDF Rotator", slug: "rotate" },
        ];
      case "calculators":
        return [
          { id: "general-calculators", label: "Calculator Suite", slug: "percentage-calculator" },
          { id: "roi-calculator", label: "ROI Calculator", slug: "roi-calculator" },
          { id: "pricing-calculator", label: "Pricing Calculator", slug: "pricing-calculator" },
          { id: "stack-optimizer", label: "Stack Optimizer", slug: "stack-optimizer" },
          { id: "churn-forecaster", label: "Churn Forecaster", slug: "churn-forecaster" },
          { id: "ad-profit-predictor", label: "Ad Profit Predictor", slug: "ad-profit-predictor" },
          { id: "percentage-calculator", label: "Percentage", slug: "percentage-calculator" },
          { id: "age-calculator", label: "Age Calculator", slug: "age-calculator" },
          { id: "date-difference-calculator", label: "Date Difference", slug: "date-difference-calculator" },
          { id: "time-zone-converter", label: "Time Zone Converter", slug: "time-zone-converter" },
          { id: "unit-converter", label: "Unit Converter", slug: "unit-converter" },
          { id: "discount-calculator", label: "Discount Calculator", slug: "discount-calculator" },
          { id: "gst-tax-calculator", label: "GST Tax", slug: "gst-tax-calculator" },
          { id: "emi-loan-calculator", label: "EMI Loan", slug: "emi-loan-calculator" },
          { id: "salary-calculator", label: "Salary Calculator", slug: "salary-calculator" },
          { id: "compound-interest-calculator", label: "Compound Interest", slug: "compound-interest-calculator" },
        ];
      case "image":
        return [
          { id: "image-studio", label: "Image Studio", slug: "image-studio" },
        ];
      case "web":
        return [
          { id: "url-analyzer", label: "URL Intelligence", slug: "url-analyzer" },
          { id: "http-status-checker", label: "HTTP Diagnostics", slug: "http-status-checker" },
          { id: "dns-lookup", label: "DNS Lookup", slug: "dns-lookup" },
          { id: "ip-lookup", label: "IP Lookup", slug: "ip-lookup" },
          { id: "user-agent-parser", label: "User Agent Parser", slug: "user-agent-parser" },
          { id: "meta-tag-analyzer", label: "SEO Meta Inspector", slug: "meta-tag-analyzer" },
          { id: "robots-txt-generator", label: "Robots.txt Generator", slug: "robots-txt-generator" },
          { id: "sitemap-generator", label: "Sitemap Generator", slug: "sitemap-generator" },
          { id: "open-graph-preview", label: "Open Graph Preview", slug: "open-graph-preview" },
          { id: "schema-markup-generator", label: "Schema JSON-LD", slug: "schema-markup-generator" },
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

  // Sync category and active sub-tool to browser URL link dynamically
  const selectSubToolWithUrlSync = (toolId: string) => {
    setActiveSubTool(toolId);
    const subOption = subToolOptions.find(opt => opt.id === toolId);
    const slug = subOption?.slug || toolId;
    const targetPath = `/tools/${selectedCategory}/${slug}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  };

  const selectCategoryWithUrlSync = (cat: WorkspaceCategory) => {
    setSelectedCategory(cat);
    if (cat === "image") {
      setInSubNavView(false);
    } else {
      setInSubNavView(true);
    }

    const targetPath = `/tools/${cat}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  };

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
      // ── TEXT & DEVELOPER UTILITIES ──
      case "text-studio": return <TextWorkspace defaultMode="count" />;
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
      case "general-calculators":
      case "percentage-calculator":
      case "age-calculator":
      case "date-difference-calculator":
      case "time-zone-converter":
      case "unit-converter":
      case "discount-calculator":
      case "gst-tax-calculator":
      case "emi-loan-calculator":
      case "salary-calculator":
      case "compound-interest-calculator":
        return <CalculatorWorkspace activeToolId={activeSubTool} />;

      case "pricing-calculator": return <PricingCalculator platforms={[]} />;
      case "stack-optimizer": return <StackOptimizer />;
      case "churn-forecaster": return <ChurnForecaster />;
      case "ad-profit":
      case "ad-profit-predictor":
        return <AdProfitPredictor />;
      case "platform-finder": return <PlatformFinder />;

      // ── WEB DIAGNOSTICS ──
      case "url-analyzer":
      case "http-status-checker":
      case "dns-lookup":
      case "ip-lookup":
      case "user-agent-parser":
      case "meta-tag-analyzer":
      case "robots-txt-generator":
      case "sitemap-generator":
      case "open-graph-preview":
      case "schema-markup-generator":
      case "web-diagnostics":
        return <WebDiagnosticsWorkspace activeToolId={activeSubTool} />;

      // ── IMAGE ──
      case "image-studio": return <ImageWorkspace defaultMode="compress" />;

      default:
        if (selectedCategory === "image") return <ImageWorkspace defaultMode="compress" />;
        if (selectedCategory === "pdf") return <PDFWorkspace onProcess={handlePdfProcess} processButtonLabel="Export PDF Studio" toolSlug="pdf-suite" />;
        if (selectedCategory === "calculators") return <CalculatorWorkspace activeToolId={activeSubTool} />;
        if (selectedCategory === "web") return <WebDiagnosticsWorkspace activeToolId={activeSubTool} />;
        return <TextWorkspace defaultMode="count" />;
    }
  };

  const activeTabMeta = workspaceTabs.find(t => t.id === selectedCategory) || workspaceTabs[0];
  const hasMultipleSubTools = subToolOptions.length > 1;

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground h-screen w-screen flex flex-col md:flex-row overflow-hidden font-sans">

      {/* ── COMPACTED LEFT SIDEBAR WITH DYNAMIC ANIMATED SUB-TOOL SWITCHER ─────── */}
      <aside className="w-full md:w-56 bg-card/40 border-b md:border-b-0 md:border-r border-border/30 backdrop-blur-xl flex flex-col justify-between p-3 shrink-0 h-auto md:h-full z-20">
        <div className="space-y-3">
          {/* Logo */}
          <div className="flex items-center justify-between px-1 pt-0.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                C
              </div>
              <span className="font-extrabold text-xs tracking-tight text-foreground block leading-none">
                Comparlify Tools
              </span>
            </div>
          </div>

          <div className="h-px bg-border/20" />

          {/* DYNAMIC SIDEBAR LIST: MAIN WORKSPACES VS SUB-TOOL UTILITIES */}
          {inSubNavView && hasMultipleSubTools ? (
            <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
              {/* Back button to return to master Workspaces list */}
              <button
                onClick={() => setInSubNavView(false)}
                className="w-full mb-2 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground text-xs font-bold flex items-center gap-1.5 border border-border/30 transition-all group"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180 text-primary transition-transform group-hover:-translate-x-0.5" />
                <span>All Workspaces</span>
              </button>

              <div className="px-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
                <activeTabMeta.icon className="h-3 w-3" />
                {activeTabMeta.label}
              </div>

              <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-none pr-0.5">
                {subToolOptions.map((sub) => {
                  const isActive = activeSubTool === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => selectSubToolWithUrlSync(sub.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-between border ${isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                        : "bg-background/20 hover:bg-secondary/70 text-muted-foreground hover:text-foreground border-border/15"
                        }`}
                    >
                      <span className="truncate">{sub.label}</span>
                      {isActive && <Zap className="h-3 w-3 shrink-0 ml-1 fill-primary-foreground" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5">
                Workspaces:
              </div>
              {workspaceTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => selectCategoryWithUrlSync(tab.id as WorkspaceCategory)}
                    className={`w-full px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-between border ${isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                      : "bg-background/20 hover:bg-secondary/70 text-muted-foreground hover:text-foreground border-border/15"
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${isActive
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
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="pt-2 border-t border-border/20 mt-3 md:mt-0">
          <Link
            href="/"
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-background/50 hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground border border-border/20 transition-all group"
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <Home className="h-3 w-3 text-primary" /> Return Home
            </span>
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 text-muted-foreground" />
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT CANVAS PANEL (CLEAN & SIMPLE TOP BAR) ────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">

        {/* Simple & Clean Top App Header */}
        <header className="bg-card/40 border-b border-border/20 px-4 py-2 flex items-center justify-between gap-3 shrink-0 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <activeTabMeta.icon className="h-4 w-4 text-primary shrink-0" />
            <h2 className="text-xs font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{activeTabMeta.label}</span>
              <span className="text-muted-foreground font-normal">•</span>
              <span className="text-primary font-mono">{subToolOptions.find(o => o.id === activeSubTool)?.label || activeSubTool}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Browser Engine
            </div>
          </div>
        </header>

        {/* Main Tool Business Canvas Area (100% Focused & Single Source of Truth) */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 h-full">
          <div className="bg-card/30 rounded-xl border border-border/30 p-3 sm:p-5 shadow-sm backdrop-blur-xl h-full flex flex-col justify-start">
            {renderActiveToolComponent()}
          </div>
        </div>

      </main>
    </div>
  );
}
