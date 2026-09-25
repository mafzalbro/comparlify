import { ToolDefinition } from "@/data/tools/registry";
import { ToolSidebarInteractive } from "./ToolSidebarInteractive";

// ── IMPORT ALL SURGICAL-GRADE TOOL ENGINES ─────────────────────────────────────
import { ImageWorkspace } from "./implementations/ImageWorkspace";
import { PDFWorkspace } from "./implementations/PDFWorkspace";
import { CalculatorWorkspace } from "./implementations/CalculatorWorkspace";
import { TextWorkspace } from "./implementations/TextWorkspace";
import { WebDiagnosticsWorkspace } from "./implementations/WebDiagnosticsWorkspace";

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

import {
  Terminal,
  FileText,
  Image as ImageIcon,
  Calculator as CalcIcon,
  Globe,
} from "lucide-react";

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

// ── SERVER-SIDE RENDERED MAIN TOOL HUB CONTAINER ────────────────────────────
export function ToolHubSearch({ tools, categories, initialSlug }: ToolHubSearchProps) {
  let selectedCategory: WorkspaceCategory = "text";
  let activeSubTool = "text-studio";

  if (initialSlug && initialSlug.length > 0) {
    const [first, second, third] = initialSlug;
    if (
      first === "text" ||
      first === "pdf" ||
      first === "image" ||
      first === "calculators" ||
      first === "web" ||
      first === "developer"
    ) {
      selectedCategory = first as WorkspaceCategory;
    }
    const targetSlug = third || second || first;
    if (targetSlug) {
      activeSubTool = targetSlug;
    }
  }

  // Server computed workspace tabs data
  const workspaceTabs = [
    { id: "text", label: "Text Tools", iconName: "Terminal", count: tools.filter((t) => t.category === "text" || t.category === "developer").length },
    { id: "pdf", label: "PDF Suite", iconName: "FileText", count: tools.filter((t) => t.category === "pdf").length },
    { id: "image", label: "Image Tools", iconName: "ImageIcon", count: tools.filter((t) => t.category === "image").length },
    { id: "calculators", label: "Calculators & ROI", iconName: "CalcIcon", count: tools.filter((t) => t.category === "calculators").length },
    { id: "web", label: "Web Diagnostics", iconName: "Globe", count: tools.filter((t) => t.category === "developer" || t.category === "text").length },
  ];

  // Server computed sub tool options
  let subToolOptions: { id: string; label: string; slug: string }[] = [];
  switch (selectedCategory) {
    case "text":
    case "developer":
      subToolOptions = [
        { id: "text-studio", label: "Text Workspace", slug: "text-studio" },
        { id: "json-formatter", label: "JSON Formatter", slug: "json-formatter" },
        { id: "json-validator", label: "JSON Validator", slug: "json-validator" },
        { id: "json-minifier", label: "JSON Minifier", slug: "json-minifier" },
        { id: "base64-encoder", label: "Base64 Encoder", slug: "base64-encoder" },
        { id: "base64-decoder", label: "Base64 Decoder", slug: "base64-decoder" },
        { id: "jwt-decoder", label: "JWT Decoder", slug: "jwt-decoder" },
        { id: "uuid-generator", label: "UUID Generator", slug: "uuid-generator" },
        { id: "password-generator", label: "Password Generator", slug: "password-generator" },
        { id: "regex-tester", label: "Regex Tester", slug: "regex-tester" },
        { id: "sql-formatter", label: "SQL Formatter", slug: "sql-formatter" },
        { id: "cron-generator", label: "Cron Generator", slug: "cron-generator" },
      ];
      break;
    case "pdf":
      subToolOptions = [
        { id: "pdf-workspace", label: "PDF Studio", slug: "pdf-suite" },
        { id: "merge-pdf", label: "Merge PDF", slug: "merge" },
        { id: "split-pdf", label: "Split PDF", slug: "split" },
        { id: "compress-pdf", label: "Compress PDF", slug: "compress" },
        { id: "jpg-to-pdf", label: "JPG to PDF", slug: "jpg-to-pdf" },
        { id: "pdf-to-text", label: "PDF to Text", slug: "pdf-to-text" },
        { id: "pdf-rotator", label: "PDF Rotator", slug: "rotate" },
      ];
      break;
    case "calculators":
      subToolOptions = [
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
      break;
    case "image":
      subToolOptions = [{ id: "image-studio", label: "Image Studio", slug: "image-studio" }];
      break;
    case "web":
      subToolOptions = [
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
      break;
  }

  const activeTabMeta = workspaceTabs.find((t) => t.id === selectedCategory) || workspaceTabs[0];

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
        return <PDFWorkspace processButtonLabel="Export PDF Studio" toolSlug="pdf-suite" />;
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
        if (selectedCategory === "pdf") return <PDFWorkspace processButtonLabel="Export PDF Studio" toolSlug="pdf-suite" />;
        if (selectedCategory === "calculators") return <CalculatorWorkspace activeToolId={activeSubTool} />;
        if (selectedCategory === "web") return <WebDiagnosticsWorkspace activeToolId={activeSubTool} />;
        return <TextWorkspace defaultMode="count" />;
    }
  };

  const IconComp =
    selectedCategory === "text" || selectedCategory === "developer"
      ? Terminal
      : selectedCategory === "pdf"
        ? FileText
        : selectedCategory === "image"
          ? ImageIcon
          : selectedCategory === "calculators"
            ? CalcIcon
            : Globe;

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground h-screen w-screen flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Tiny Interactive Client Sidebar Delegate */}
      <ToolSidebarInteractive
        workspaceTabs={workspaceTabs}
        subToolOptions={subToolOptions}
        initialCategory={selectedCategory}
        initialSubTool={activeSubTool}
        activeCategoryLabel={activeTabMeta.label}
        activeCategoryIconName={activeTabMeta.iconName}
      />

      {/* Main Content Canvas Panel - Pre-rendered on Server */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <header className="bg-card/40 border-b border-border/20 px-4 py-2 flex items-center justify-between gap-3 shrink-0 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <IconComp className="h-4 w-4 text-primary shrink-0" />
            <h2 className="text-xs font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{activeTabMeta.label}</span>
              <span className="text-muted-foreground font-normal">•</span>
              <span className="text-primary font-mono">
                {subToolOptions.find((o) => o.id === activeSubTool)?.label || activeSubTool}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              SSR Engine Enabled
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-2 sm:p-4 h-full">
          <div className="bg-card/30 rounded-xl border border-border/30 p-3 sm:p-5 shadow-sm backdrop-blur-xl h-full flex flex-col justify-start">
            {renderActiveToolComponent()}
          </div>
        </div>
      </main>
    </div>
  );
}
