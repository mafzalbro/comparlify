"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ToolDefinition, getToolBySlug } from "@/data/tools/registry";
import { ToolSidebarInteractive } from "./ToolSidebarInteractive";
import {
  Terminal,
  FileText,
  Image as ImageIcon,
  Calculator as CalcIcon,
  Globe,
} from "lucide-react";

// ── DYNAMIC IMPORTS (code-split so each tool loads on demand) ──
const WorkspaceSkeleton = () => (
  <div className="w-full h-full flex flex-col space-y-4 animate-pulse p-4">
    <div className="h-10 w-1/3 bg-muted/40 rounded-xl" />
    <div className="h-[400px] w-full bg-muted/20 rounded-2xl border border-border/10" />
    <div className="grid grid-cols-3 gap-4">
      <div className="h-24 bg-muted/20 rounded-xl" />
      <div className="h-24 bg-muted/20 rounded-xl" />
      <div className="h-24 bg-muted/20 rounded-xl" />
    </div>
  </div>
);

const TextWorkspace = dynamic(
  () => import("./implementations/TextWorkspace").then((m) => m.TextWorkspace),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const ImageWorkspace = dynamic(
  () =>
    import("./implementations/ImageWorkspace").then((m) => m.ImageWorkspace),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const PDFWorkspace = dynamic(
  () => import("./implementations/PDFWorkspace").then((m) => m.PDFWorkspace),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const CalculatorWorkspace = dynamic(
  () =>
    import("./implementations/CalculatorWorkspace").then(
      (m) => m.CalculatorWorkspace,
    ),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const WebDiagnosticsWorkspace = dynamic(
  () =>
    import("./implementations/WebDiagnosticsWorkspace").then(
      (m) => m.WebDiagnosticsWorkspace,
    ),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);

const JSONFormatter = dynamic(
  () => import("./implementations/JSONFormatter").then((m) => m.JSONFormatter),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const JSONValidator = dynamic(
  () => import("./implementations/JSONValidator").then((m) => m.JSONValidator),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const JSONMinifier = dynamic(
  () => import("./implementations/JSONMinifier").then((m) => m.JSONMinifier),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const JSONViewer = dynamic(
  () => import("./implementations/JSONViewer").then((m) => m.JSONViewer),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const Base64Encoder = dynamic(
  () => import("./implementations/Base64Encoder").then((m) => m.Base64Encoder),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const Base64Decoder = dynamic(
  () => import("./implementations/Base64Decoder").then((m) => m.Base64Decoder),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const JWTDecoder = dynamic(
  () => import("./implementations/JWTDecoder").then((m) => m.JWTDecoder),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const UUIDGenerator = dynamic(
  () => import("./implementations/UUIDGenerator").then((m) => m.UUIDGenerator),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const PasswordGenerator = dynamic(
  () =>
    import("./implementations/PasswordGenerator").then(
      (m) => m.PasswordGenerator,
    ),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const RegexTester = dynamic(
  () => import("./implementations/RegexTester").then((m) => m.RegexTester),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const SQLFormatterTool = dynamic(
  () =>
    import("./implementations/SQLFormatter").then((m) => m.SQLFormatterTool),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const CronGenerator = dynamic(
  () => import("./implementations/CronGenerator").then((m) => m.CronGenerator),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const HTMLFormatter = dynamic(
  () => import("./implementations/HTMLFormatter").then((m) => m.HTMLFormatter),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const CSSFormatter = dynamic(
  () => import("./implementations/CSSFormatter").then((m) => m.CSSFormatter),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const JSFormatter = dynamic(
  () => import("./implementations/JSFormatter").then((m) => m.JSFormatter),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const XMLFormatter = dynamic(
  () => import("./implementations/XMLFormatter").then((m) => m.XMLFormatter),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const YAMLFormatter = dynamic(
  () => import("./implementations/YAMLFormatter").then((m) => m.YAMLFormatter),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const URLEncoder = dynamic(
  () => import("./implementations/URLEncoder").then((m) => m.URLEncoder),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const URLDecoder = dynamic(
  () => import("./implementations/URLDecoder").then((m) => m.URLDecoder),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const UnixTimestampConverter = dynamic(
  () =>
    import("./implementations/UnixTimestampConverter").then(
      (m) => m.UnixTimestampConverter,
    ),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);

const MergePDF = dynamic(
  () => import("./implementations/MergePDF").then((m) => m.MergePDF),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const SplitPDF = dynamic(
  () => import("./implementations/SplitPDF").then((m) => m.SplitPDF),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const JPGToPDF = dynamic(
  () => import("./implementations/JPGToPDF").then((m) => m.JPGToPDF),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const PDFToText = dynamic(
  () => import("./implementations/PDFToText").then((m) => m.PDFToText),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const PDFRotator = dynamic(
  () => import("./implementations/PDFRotator").then((m) => m.PDFRotator),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const PDFPageExtractor = dynamic(
  () =>
    import("./implementations/PDFPageExtractor").then(
      (m) => m.PDFPageExtractor,
    ),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const PDFPageDeleter = dynamic(
  () =>
    import("./implementations/PDFPageDeleter").then((m) => m.PDFPageDeleter),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);

const PricingCalculator = dynamic(
  () => import("./pricing-calculator").then((m) => m.PricingCalculator),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const StackOptimizer = dynamic(
  () => import("./stack-optimizer").then((m) => m.StackOptimizer),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const ChurnForecaster = dynamic(
  () => import("./churn-forecaster").then((m) => m.ChurnForecaster),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const AdProfitPredictor = dynamic(
  () => import("./ad-profit-predictor").then((m) => m.AdProfitPredictor),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const PlatformFinder = dynamic(
  () =>
    import("./implementations/PlatformFinder").then((m) => m.PlatformFinder),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);

// ── TYPES ──
type WorkspaceCategory =
  "text" | "developer" | "pdf" | "image" | "calculators" | "web";

interface SubTool {
  id: string;
  label: string;
  slug: string;
  path: string;
}

interface RenderContext {
  platforms: any[];
}

type Renderer = (ctx: RenderContext) => React.ReactNode;

interface ToolHubSearchProps {
  tools: ToolDefinition[];
  categories: Record<string, any>;
  initialSlug?: string[];
  /** Data for the Pricing Calculator. Pass real platforms from the server. */
  platforms?: any[];
}

const CATEGORY_ORDER: WorkspaceCategory[] = [
  "text",
  "developer",
  "pdf",
  "image",
  "calculators",
  "web",
];

const CATEGORY_META: Record<
  WorkspaceCategory,
  {
    label: string;
    iconName: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  text: { label: "Text Tools", iconName: "Terminal", Icon: Terminal },
  // Reuses the Terminal icon so the sidebar's icon map doesn't need changes.
  developer: { label: "Developer Tools", iconName: "Terminal", Icon: Terminal },
  pdf: { label: "PDF Suite", iconName: "FileText", Icon: FileText },
  image: { label: "Image Tools", iconName: "ImageIcon", Icon: ImageIcon },
  calculators: {
    label: "Calculators & ROI",
    iconName: "CalcIcon",
    Icon: CalcIcon,
  },
  web: { label: "Web Diagnostics", iconName: "Globe", Icon: Globe },
};

// ── EVERY TOOL THE HUB KNOWS ABOUT ──
const ALL_SUB_TOOLS: Record<WorkspaceCategory, SubTool[]> = {
  text: [
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
  ],
  developer: [
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
  ],
  pdf: [
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
  ],
  image: [
    // Own path (not the compressor's) so each page highlights correctly.
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
  ],
  calculators: [
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
  ],
  web: [
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
  ],
};

// ── ID → COMPONENT ──
// Only tools that appear here are shown in the sidebar, counted in tabs and
// routable. A tool with no real component is hidden instead of showing a dead page.
const COMPONENT_MAP: Record<string, Renderer> = {
  // Text
  "text-studio": () => <TextWorkspace defaultMode="count" />,
  "word-counter": () => <TextWorkspace defaultMode="count" />,
  "character-counter": () => <TextWorkspace defaultMode="count" />,
  "case-converter": () => <TextWorkspace defaultMode="case" />,
  "remove-duplicate-lines": () => <TextWorkspace defaultMode="clean" />,
  "remove-empty-lines": () => <TextWorkspace defaultMode="clean" />,
  "text-sorter": () => <TextWorkspace defaultMode="sort" />,
  // TODO: TextWorkspace needs a real "reverse" mode. Until then this opens the sorter.
  "text-reverser": () => <TextWorkspace defaultMode="sort" />,
  "text-diff-checker": () => <TextWorkspace defaultMode="diff" />,
  "find-and-replace": () => <TextWorkspace defaultMode="replace" />,
  "slug-generator": () => <TextWorkspace defaultMode="slug" />,

  // Developer
  "json-formatter": () => <JSONFormatter />,
  "json-validator": () => <JSONValidator />,
  "json-minifier": () => <JSONMinifier />,
  "json-viewer": () => <JSONViewer />,
  "base64-encoder": () => <Base64Encoder />,
  "base64-decoder": () => <Base64Decoder />,
  "url-encoder": () => <URLEncoder />,
  "url-decoder": () => <URLDecoder />,
  "jwt-decoder": () => <JWTDecoder />,
  "uuid-generator": () => <UUIDGenerator />,
  "password-generator": () => <PasswordGenerator />,
  "regex-tester": () => <RegexTester />,
  "sql-formatter": () => <SQLFormatterTool />,
  "cron-expression-generator": () => <CronGenerator />,
  "html-formatter": () => <HTMLFormatter />,
  "css-formatter": () => <CSSFormatter />,
  "javascript-formatter": () => <JSFormatter />,
  "xml-formatter": () => <XMLFormatter />,
  "yaml-formatter": () => <YAMLFormatter />,
  "unix-timestamp-converter": () => <UnixTimestampConverter />,

  // PDF (pdf-to-jpg / pdf-to-png have no implementation yet, so they're not listed)
  "pdf-suite": () => (
    <PDFWorkspace processButtonLabel="Export PDF Studio" toolSlug="pdf-suite" />
  ),
  "merge-pdf": () => <MergePDF />,
  "split-pdf": () => <SplitPDF />,
  "compress-pdf": () => (
    <PDFWorkspace
      mode="compress"
      processButtonLabel="Compress PDF"
      toolSlug="compress"
    />
  ),
  "jpg-to-pdf": () => <JPGToPDF />,
  "pdf-to-text": () => <PDFToText />,
  "pdf-rotator": () => <PDFRotator />,
  "extract-pages-pdf": () => <PDFPageExtractor />,
  "delete-pages-pdf": () => <PDFPageDeleter />,

  // Image: one workspace, the mode decides which tool it behaves as
  "image-studio": () => <ImageWorkspace defaultMode="compress" />,
  "image-compressor": () => <ImageWorkspace defaultMode="compress" />,
  "image-resizer": () => <ImageWorkspace defaultMode="resize" />,
  "image-cropper": () => <ImageWorkspace defaultMode="crop" />,
  "image-rotator": () => <ImageWorkspace defaultMode="rotate" />,
  "jpg-to-png": () => <ImageWorkspace defaultMode="jpg-to-png" />,
  "png-to-jpg": () => <ImageWorkspace defaultMode="png-to-jpg" />,
  "jpg-to-webp": () => <ImageWorkspace defaultMode="jpg-to-webp" />,
  "png-to-webp": () => <ImageWorkspace defaultMode="png-to-webp" />,
  "webp-to-jpg": () => <ImageWorkspace defaultMode="webp-to-jpg" />,
  "image-to-base64": () => <ImageWorkspace defaultMode="image-to-base64" />,

  // Calculators
  "pricing-calculator": ({ platforms }) => (
    <PricingCalculator platforms={platforms} />
  ),
  "stack-optimizer": () => <StackOptimizer />,
  "churn-forecaster": () => <ChurnForecaster />,
  "ad-profit-predictor": () => <AdProfitPredictor />,
  "creator-match": () => <PlatformFinder />,
  // roi-calculator, course-revenue-calculator and stack-architect used to render
  // PlatformFinder (the wrong tool). They're hidden until real components exist.
};

[
  "percentage-calculator",
  "age-calculator",
  "date-difference-calculator",
  "time-zone-converter",
  "unit-converter",
  "discount-calculator",
  "gst-tax-calculator",
  "emi-loan-calculator",
  "salary-calculator",
  "compound-interest-calculator",
].forEach((id) => {
  COMPONENT_MAP[id] = () => <CalculatorWorkspace activeToolId={id} />;
});

[
  "url-analyzer",
  "http-status-checker",
  "dns-lookup",
  "ip-lookup",
  "user-agent-parser",
  "meta-tag-analyzer",
  "robots-txt-generator",
  "sitemap-generator",
  "open-graph-preview",
  "schema-markup-generator",
].forEach((id) => {
  COMPONENT_MAP[id] = () => <WebDiagnosticsWorkspace activeToolId={id} />;
});

// Tools that are really available
const SUB_TOOLS = CATEGORY_ORDER.reduce(
  (acc, cat) => {
    acc[cat] = ALL_SUB_TOOLS[cat].filter((t) => t.id in COMPONENT_MAP);
    return acc;
  },
  {} as Record<WorkspaceCategory, SubTool[]>,
);

const isCategory = (s: string): s is WorkspaceCategory =>
  (CATEGORY_ORDER as string[]).includes(s);

// ── URL → { category, tool } ──
function resolveSelection(initialSlug?: string[]): {
  category: WorkspaceCategory;
  toolId: string | null;
  missing: boolean;
} {
  const fallback = {
    category: "text" as WorkspaceCategory,
    toolId: SUB_TOOLS.text[0]?.id ?? null,
    missing: false,
  };
  if (!initialSlug || initialSlug.length === 0) return fallback;

  // 1. Exact path match, e.g. /tools/developer/json/formatter
  const path = "/tools/" + initialSlug.join("/");
  for (const cat of CATEGORY_ORDER) {
    const hit = SUB_TOOLS[cat].find((t) => t.path === path);
    if (hit) return { category: cat, toolId: hit.id, missing: false };
  }

  // 2. Registry lookup by slug
  const matched = getToolBySlug(initialSlug);
  if (matched) {
    for (const cat of CATEGORY_ORDER) {
      const hit = SUB_TOOLS[cat].find((t) => t.id === matched.id);
      if (hit) return { category: cat, toolId: hit.id, missing: false };
    }
  }

  // 3. Category root (/tools/pdf) or a slug inside a category
  const [first] = initialSlug;
  if (isCategory(first)) {
    if (initialSlug.length === 1)
      return {
        category: first,
        toolId: SUB_TOOLS[first][0]?.id ?? null,
        missing: false,
      };
    const last = initialSlug[initialSlug.length - 1];
    const hit = SUB_TOOLS[first].find((t) => t.slug === last || t.id === last);
    if (hit) return { category: first, toolId: hit.id, missing: false };
    return { category: first, toolId: null, missing: true };
  }

  return { ...fallback, missing: true };
}

export function ToolHubSearch({
  tools,
  categories,
  initialSlug,
  platforms = [],
}: ToolHubSearchProps) {
  const {
    category: selectedCategory,
    toolId,
    missing,
  } = resolveSelection(initialSlug);
  const activeSubTool = toolId ?? "";

  const workspaceTabs = CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_META[id].label,
    iconName: CATEGORY_META[id].iconName,
    count: SUB_TOOLS[id].length,
  }));

  const subToolOptions = SUB_TOOLS[selectedCategory];
  const activeTabMeta = workspaceTabs.find((t) => t.id === selectedCategory)!;
  const IconComp = CATEGORY_META[selectedCategory].Icon;
  const activeOption = subToolOptions.find((o) => o.id === activeSubTool);
  const render = toolId ? COMPONENT_MAP[toolId] : undefined;

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground h-screen w-screen flex flex-col md:flex-row overflow-hidden font-sans">
      <ToolSidebarInteractive
        workspaceTabs={workspaceTabs}
        subToolOptions={subToolOptions}
        allTools={tools}
        selectedCategory={selectedCategory}
        activeSubTool={activeSubTool}
        activeCategoryLabel={activeTabMeta.label}
        activeCategoryIconName={activeTabMeta.iconName}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <header className="bg-card/40 border-b border-border/20 px-5 py-3.5 flex items-center justify-between gap-3 shrink-0 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <IconComp className="h-4 w-4 text-primary shrink-0" />
            <h1 className="text-xs font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{activeTabMeta.label}</span>
              {activeOption && (
                <>
                  <span className="text-muted-foreground font-normal">•</span>
                  <span className="text-primary font-mono">
                    {activeOption.label}
                  </span>
                </>
              )}
            </h1>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto scroll-smooth p-2 sm:p-4 h-full scrollbar-thin scrollbar-thumb-border">
          <div className="p-3 sm:p-5 backdrop-blur-xl min-h-full flex flex-col justify-start">
            {render && !missing ? (
              // key forces a clean remount when switching tools
              <div key={activeSubTool} className="contents">
                {render({ platforms })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
                  <Terminal className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-bold">This tool isn't available</h2>
                <p className="text-sm text-muted-foreground">
                  Pick another tool from the list on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
