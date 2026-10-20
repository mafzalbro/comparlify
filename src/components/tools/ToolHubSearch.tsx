import React from "react";
import { ToolDefinition, getToolBySlug } from "@/data/tools/registry";
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

type WorkspaceCategory =
  "text" | "pdf" | "image" | "calculators" | "web" | "developer";

// ── SERVER-SIDE RENDERED MAIN TOOL HUB COMPONENT ─────────────────────────────
export function ToolHubSearch({
  tools,
  categories,
  initialSlug,
}: ToolHubSearchProps) {
  let selectedCategory: WorkspaceCategory = "text";
  let activeSubTool = "text-studio";

  if (initialSlug && initialSlug.length > 0) {
    const [first] = initialSlug;

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

    // Resolve via the registry so URL slug ("formatter") maps to
    // the switch-statement id ("json-formatter").
    const matchedTool = getToolBySlug(initialSlug);
    if (matchedTool) {
      activeSubTool = matchedTool.id;
    } else {
      // Category-only URL (e.g. /tools/developer) — keep default subtool
      const lastSegment = initialSlug[initialSlug.length - 1];
      if (lastSegment) activeSubTool = lastSegment;
    }
  }

  // Server computed workspace tabs data
  const workspaceTabs = [
    {
      id: "text",
      label: "Text Tools",
      iconName: "Terminal",
      count: tools.filter(
        (t) => t.category === "text" || t.category === "developer",
      ).length,
    },
    {
      id: "pdf",
      label: "PDF Suite",
      iconName: "FileText",
      count: tools.filter((t) => t.category === "pdf").length,
    },
    {
      id: "image",
      label: "Image Tools",
      iconName: "ImageIcon",
      count: tools.filter((t) => t.category === "image").length,
    },
    {
      id: "calculators",
      label: "Calculators & ROI",
      iconName: "CalcIcon",
      count: tools.filter((t) => t.category === "calculators").length,
    },
    {
      id: "web",
      label: "Web Diagnostics",
      iconName: "Globe",
      count: tools.filter(
        (t) => t.category === "developer" || t.category === "text",
      ).length,
    },
  ];

  // Server computed sub tool options
  let subToolOptions: {
    id: string;
    label: string;
    slug: string;
    path: string;
  }[] = [];
  switch (selectedCategory) {
    // ── TEXT ── (no subcategory in registry → 2-segment URL)
    case "text":
      subToolOptions = [
        {
          id: "text-studio",
          label: "Text Workspace",
          slug: "text-studio",
          path: "/tools/text",
        },
        {
          id: "word-counter",
          label: "Word Counter",
          slug: "word-counter",
          path: "/tools/text/word-counter",
        },
        {
          id: "character-counter",
          label: "Character Counter",
          slug: "character-counter",
          path: "/tools/text/character-counter",
        },
        {
          id: "case-converter",
          label: "Case Converter",
          slug: "case-converter",
          path: "/tools/text/case-converter",
        },
        {
          id: "remove-duplicate-lines",
          label: "Remove Duplicates",
          slug: "remove-duplicate-lines",
          path: "/tools/text/remove-duplicate-lines",
        },
        {
          id: "remove-empty-lines",
          label: "Remove Empty Lines",
          slug: "remove-empty-lines",
          path: "/tools/text/remove-empty-lines",
        },
        {
          id: "text-sorter",
          label: "Text Sorter",
          slug: "text-sorter",
          path: "/tools/text/text-sorter",
        },
        {
          id: "text-reverser",
          label: "Text Reverser",
          slug: "text-reverser",
          path: "/tools/text/text-reverser",
        },
        {
          id: "text-diff-checker",
          label: "Text Diff Checker",
          slug: "text-diff-checker",
          path: "/tools/text/text-diff-checker",
        },
        {
          id: "find-and-replace",
          label: "Find & Replace",
          slug: "find-and-replace",
          path: "/tools/text/find-and-replace",
        },
        {
          id: "slug-generator",
          label: "Slug Generator",
          slug: "slug-generator",
          path: "/tools/text/slug-generator",
        },
      ];
      break;

    // ── DEVELOPER ── (all subcategorized → 3-segment URL)
    case "developer":
      subToolOptions = [
        {
          id: "json-formatter",
          label: "JSON Formatter",
          slug: "formatter",
          path: "/tools/developer/json/formatter",
        },
        {
          id: "json-validator",
          label: "JSON Validator",
          slug: "validator",
          path: "/tools/developer/json/validator",
        },
        {
          id: "json-minifier",
          label: "JSON Minifier",
          slug: "minifier",
          path: "/tools/developer/json/minifier",
        },
        {
          id: "json-viewer",
          label: "JSON Viewer",
          slug: "viewer",
          path: "/tools/developer/json/viewer",
        },
        {
          id: "base64-encoder",
          label: "Base64 Encoder",
          slug: "base64-encoder",
          path: "/tools/developer/encoding/base64-encoder",
        },
        {
          id: "base64-decoder",
          label: "Base64 Decoder",
          slug: "base64-decoder",
          path: "/tools/developer/encoding/base64-decoder",
        },
        {
          id: "url-encoder",
          label: "URL Encoder",
          slug: "url-encoder",
          path: "/tools/developer/encoding/url-encoder",
        },
        {
          id: "url-decoder",
          label: "URL Decoder",
          slug: "url-decoder",
          path: "/tools/developer/encoding/url-decoder",
        },
        {
          id: "jwt-decoder",
          label: "JWT Decoder",
          slug: "jwt-decoder",
          path: "/tools/developer/encoding/jwt-decoder",
        },
        {
          id: "uuid-generator",
          label: "UUID Generator",
          slug: "uuid-generator",
          path: "/tools/developer/generators/uuid-generator",
        },
        {
          id: "password-generator",
          label: "Password Generator",
          slug: "password-generator",
          path: "/tools/developer/generators/password-generator",
        },
        {
          id: "cron-expression-generator",
          label: "Cron Generator",
          slug: "cron-generator",
          path: "/tools/developer/generators/cron-generator",
        },
        {
          id: "regex-tester",
          label: "Regex Tester",
          slug: "regex-tester",
          path: "/tools/developer/testing/regex-tester",
        },
        {
          id: "html-formatter",
          label: "HTML Formatter",
          slug: "html-formatter",
          path: "/tools/developer/formatters/html-formatter",
        },
        {
          id: "css-formatter",
          label: "CSS Formatter",
          slug: "css-formatter",
          path: "/tools/developer/formatters/css-formatter",
        },
        {
          id: "javascript-formatter",
          label: "JS Formatter",
          slug: "javascript-formatter",
          path: "/tools/developer/formatters/javascript-formatter",
        },
        {
          id: "sql-formatter",
          label: "SQL Formatter",
          slug: "sql-formatter",
          path: "/tools/developer/formatters/sql-formatter",
        },
        {
          id: "xml-formatter",
          label: "XML Formatter",
          slug: "xml-formatter",
          path: "/tools/developer/formatters/xml-formatter",
        },
        {
          id: "yaml-formatter",
          label: "YAML Formatter",
          slug: "yaml-formatter",
          path: "/tools/developer/formatters/yaml-formatter",
        },
        {
          id: "unix-timestamp-converter",
          label: "Unix Timestamp",
          slug: "unix-timestamp-converter",
          path: "/tools/developer/converters/unix-timestamp-converter",
        },
      ];
      break;

    // ── PDF ── (no subcategory → 2-segment URL)
    case "pdf":
      subToolOptions = [
        {
          id: "pdf-suite",
          label: "PDF Studio",
          slug: "pdf-suite",
          path: "/tools/pdf",
        },
        {
          id: "merge-pdf",
          label: "Merge PDF",
          slug: "merge",
          path: "/tools/pdf/merge",
        },
        {
          id: "split-pdf",
          label: "Split PDF",
          slug: "split",
          path: "/tools/pdf/split",
        },
        {
          id: "compress-pdf",
          label: "Compress PDF",
          slug: "compress",
          path: "/tools/pdf/compress",
        },
        {
          id: "jpg-to-pdf",
          label: "JPG to PDF",
          slug: "jpg-to-pdf",
          path: "/tools/pdf/jpg-to-pdf",
        },
        {
          id: "pdf-to-jpg",
          label: "PDF to JPG",
          slug: "pdf-to-jpg",
          path: "/tools/pdf/pdf-to-jpg",
        },
        {
          id: "pdf-to-png",
          label: "PDF to PNG",
          slug: "pdf-to-png",
          path: "/tools/pdf/pdf-to-png",
        },
        {
          id: "pdf-to-text",
          label: "PDF to Text",
          slug: "pdf-to-text",
          path: "/tools/pdf/pdf-to-text",
        },
        {
          id: "pdf-rotator",
          label: "PDF Rotator",
          slug: "rotate",
          path: "/tools/pdf/rotate",
        },
        {
          id: "extract-pages-pdf",
          label: "Extract Pages",
          slug: "extract-pages",
          path: "/tools/pdf/extract-pages",
        },
        {
          id: "delete-pages-pdf",
          label: "Delete Pages",
          slug: "delete-pages",
          path: "/tools/pdf/delete-pages",
        },
      ];
      break;

    // ── IMAGE ── (no subcategory → 2-segment URL)
    case "image":
      subToolOptions = [
        {
          id: "image-studio",
          label: "Image Studio",
          slug: "image-studio",
          path: "/tools/image",
        },
        {
          id: "image-compressor",
          label: "Image Compressor",
          slug: "compressor",
          path: "/tools/image/compressor",
        },
        {
          id: "image-resizer",
          label: "Image Resizer",
          slug: "resizer",
          path: "/tools/image/resizer",
        },
        {
          id: "image-cropper",
          label: "Image Cropper",
          slug: "cropper",
          path: "/tools/image/cropper",
        },
        {
          id: "image-rotator",
          label: "Image Rotator",
          slug: "rotator",
          path: "/tools/image/rotator",
        },
        {
          id: "jpg-to-png",
          label: "JPG to PNG",
          slug: "jpg-to-png",
          path: "/tools/image/jpg-to-png",
        },
        {
          id: "png-to-jpg",
          label: "PNG to JPG",
          slug: "png-to-jpg",
          path: "/tools/image/png-to-jpg",
        },
        {
          id: "jpg-to-webp",
          label: "JPG to WebP",
          slug: "jpg-to-webp",
          path: "/tools/image/jpg-to-webp",
        },
        {
          id: "png-to-webp",
          label: "PNG to WebP",
          slug: "png-to-webp",
          path: "/tools/image/png-to-webp",
        },
        {
          id: "webp-to-jpg",
          label: "WebP to JPG",
          slug: "webp-to-jpg",
          path: "/tools/image/webp-to-jpg",
        },
        {
          id: "image-to-base64",
          label: "Image to Base64",
          slug: "image-to-base64",
          path: "/tools/image/image-to-base64",
        },
      ];
      break;

    // ── CALCULATORS ── (mixed subcategories)
    case "calculators":
      subToolOptions = [
        {
          id: "pricing-calculator",
          label: "Pricing Calculator",
          slug: "pricing",
          path: "/tools/calculators/strategic/pricing",
        },
        {
          id: "roi-calculator",
          label: "ROI Calculator",
          slug: "roi",
          path: "/tools/calculators/strategic/roi",
        },
        {
          id: "course-revenue-calculator",
          label: "Revenue Calculator",
          slug: "revenue",
          path: "/tools/calculators/strategic/revenue",
        },
        {
          id: "stack-optimizer",
          label: "Stack Optimizer",
          slug: "subscription-audit",
          path: "/tools/calculators/strategic/subscription-audit",
        },
        {
          id: "churn-forecaster",
          label: "Churn Forecaster",
          slug: "retention-forecaster",
          path: "/tools/calculators/strategic/retention-forecaster",
        },
        {
          id: "ad-profit-predictor",
          label: "Ad Profit Predictor",
          slug: "ad-roi-predictor",
          path: "/tools/calculators/strategic/ad-roi-predictor",
        },
        {
          id: "creator-match",
          label: "Software Matchmaker",
          slug: "matchmaker",
          path: "/tools/calculators/strategic/matchmaker",
        },
        {
          id: "stack-architect",
          label: "Tech Stack Planner",
          slug: "stack-planner",
          path: "/tools/calculators/strategic/stack-planner",
        },
        {
          id: "percentage-calculator",
          label: "Percentage",
          slug: "percentage",
          path: "/tools/calculators/percentage",
        },
        {
          id: "age-calculator",
          label: "Age Calculator",
          slug: "age",
          path: "/tools/calculators/age",
        },
        {
          id: "date-difference-calculator",
          label: "Date Difference",
          slug: "date-difference",
          path: "/tools/calculators/date-difference",
        },
        {
          id: "time-zone-converter",
          label: "Time Zone Converter",
          slug: "time-zone",
          path: "/tools/calculators/time-zone",
        },
        {
          id: "unit-converter",
          label: "Unit Converter",
          slug: "unit-converter",
          path: "/tools/calculators/unit-converter",
        },
        {
          id: "discount-calculator",
          label: "Discount Calculator",
          slug: "discount",
          path: "/tools/calculators/discount",
        },
        {
          id: "gst-tax-calculator",
          label: "GST / Tax",
          slug: "gst-tax",
          path: "/tools/calculators/gst-tax",
        },
        {
          id: "emi-loan-calculator",
          label: "EMI / Loan",
          slug: "emi-loan",
          path: "/tools/calculators/emi-loan",
        },
        {
          id: "salary-calculator",
          label: "Salary Calculator",
          slug: "salary",
          path: "/tools/calculators/salary",
        },
        {
          id: "compound-interest-calculator",
          label: "Compound Interest",
          slug: "compound-interest",
          path: "/tools/calculators/compound-interest",
        },
      ];
      break;

    // ── WEB ── (mixed subcategories)
    case "web":
      subToolOptions = [
        {
          id: "url-analyzer",
          label: "URL Intelligence",
          slug: "url-analyzer",
          path: "/tools/web/diagnostics/url-analyzer",
        },
        {
          id: "http-status-checker",
          label: "HTTP Diagnostics",
          slug: "http-status-checker",
          path: "/tools/web/diagnostics/http-status-checker",
        },
        {
          id: "dns-lookup",
          label: "DNS Lookup",
          slug: "dns-lookup",
          path: "/tools/web/diagnostics/dns-lookup",
        },
        {
          id: "ip-lookup",
          label: "IP Lookup",
          slug: "ip-lookup",
          path: "/tools/web/diagnostics/ip-lookup",
        },
        {
          id: "user-agent-parser",
          label: "User Agent Parser",
          slug: "user-agent-parser",
          path: "/tools/web/diagnostics/user-agent-parser",
        },
        {
          id: "meta-tag-analyzer",
          label: "SEO Meta Inspector",
          slug: "meta-tag-analyzer",
          path: "/tools/web/seo/meta-tag-analyzer",
        },
        {
          id: "robots-txt-generator",
          label: "Robots.txt Generator",
          slug: "robots-txt-generator",
          path: "/tools/web/seo/robots-txt-generator",
        },
        {
          id: "sitemap-generator",
          label: "Sitemap Generator",
          slug: "sitemap-generator",
          path: "/tools/web/seo/sitemap-generator",
        },
        {
          id: "open-graph-preview",
          label: "Open Graph Preview",
          slug: "open-graph-preview",
          path: "/tools/web/seo/open-graph-preview",
        },
        {
          id: "schema-markup-generator",
          label: "Schema JSON-LD",
          slug: "schema-generator",
          path: "/tools/web/seo/schema-generator",
        },
      ];
      break;
  }

  const activeTabMeta =
    workspaceTabs.find((t) => t.id === selectedCategory) || workspaceTabs[0];

  const renderActiveToolComponent = () => {
    switch (activeSubTool) {
      // ── GENERAL TEXT UTILITIES (TOP) ──
      case "text-studio":
        return <TextWorkspace defaultMode="count" />;
      case "word-counter":
        return <TextWorkspace defaultMode="count" />;
      case "case-converter":
        return <TextWorkspace defaultMode="case" />;
      case "clean-lines":
      case "remove-duplicate-lines":
        return <TextWorkspace defaultMode="clean" />;
      case "text-sorter":
        return <TextWorkspace defaultMode="sort" />;
      case "text-diff-checker":
        return <TextWorkspace defaultMode="diff" />;
      case "find-replace":
      case "find-and-replace":
        return <TextWorkspace defaultMode="replace" />;
      case "slug-generator":
        return <TextWorkspace defaultMode="slug" />;

      // ── DEVELOPER UTILITIES (BELOW) ──
      case "json-formatter":
        return <JSONFormatter />;
      case "json-validator":
        return <JSONValidator />;
      case "json-minifier":
        return <JSONMinifier />;
      case "base64-encoder":
        return <Base64Encoder />;
      case "base64-decoder":
        return <Base64Decoder />;
      case "jwt-decoder":
        return <JWTDecoder />;
      case "uuid-generator":
        return <UUIDGenerator />;
      case "password-generator":
        return <PasswordGenerator />;
      case "regex-tester":
        return <RegexTester />;
      case "sql-formatter":
        return <SQLFormatterTool />;
      case "cron-expression-generator":
        return <CronGenerator />;

      // ── PDF TOOLS ──
      case "pdf-workspace":
      case "pdf-suite":
        return (
          <PDFWorkspace
            processButtonLabel="Export PDF Studio"
            toolSlug="pdf-suite"
          />
        );
      case "merge-pdf":
      case "merge":
        return <MergePDF />;
      case "split-pdf":
      case "split":
        return <SplitPDF />;
      case "compress-pdf":
      case "compress":
        return <CompressPDF />;
      case "jpg-to-pdf":
        return <JPGToPDF />;
      case "pdf-to-text":
        return <PDFToText />;
      case "pdf-rotator":
      case "rotate":
        return <PDFRotator />;

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

      case "pricing-calculator":
        return <PricingCalculator platforms={[]} />;
      case "stack-optimizer":
        return <StackOptimizer />;
      case "churn-forecaster":
        return <ChurnForecaster />;
      case "ad-profit":
      case "ad-profit-predictor":
        return <AdProfitPredictor />;
      case "platform-finder":
        return <PlatformFinder />;

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
      case "image-studio":
        return <ImageWorkspace defaultMode="compress" />;

      default:
        if (selectedCategory === "image")
          return <ImageWorkspace defaultMode="compress" />;
        if (selectedCategory === "pdf")
          return (
            <PDFWorkspace
              processButtonLabel="Export PDF Studio"
              toolSlug="pdf-suite"
            />
          );
        if (selectedCategory === "calculators")
          return <CalculatorWorkspace activeToolId={activeSubTool} />;
        if (selectedCategory === "web")
          return <WebDiagnosticsWorkspace activeToolId={activeSubTool} />;
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
      {/* Interactive Client Sidebar */}
      <ToolSidebarInteractive
        workspaceTabs={workspaceTabs}
        subToolOptions={subToolOptions}
        selectedCategory={selectedCategory}
        activeSubTool={activeSubTool}
        activeCategoryLabel={activeTabMeta.label}
        activeCategoryIconName={activeTabMeta.iconName}
      />

      {/* Server Rendered Main Content Canvas Panel */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <header className="bg-card/40 border-b border-border/20 px-5 py-3.5 flex items-center justify-between gap-3 shrink-0 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <IconComp className="h-4 w-4 text-primary shrink-0" />
            <h2 className="text-xs font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{activeTabMeta.label}</span>
              <span className="text-muted-foreground font-normal">•</span>
              <span className="text-primary font-mono">
                {subToolOptions.find(
                  (o) => o.id === activeSubTool || o.slug === activeSubTool,
                )?.label || activeSubTool}
              </span>
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth p-2 sm:p-4 h-full scrollbar-thin scrollbar-thumb-border">
          <div className="bg-card/30 rounded-xl border border-border/30 p-3 sm:p-5 shadow-sm backdrop-blur-xl min-h-full flex flex-col justify-start">
            {renderActiveToolComponent()}
          </div>
        </div>
      </main>
    </div>
  );
}
