"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToolDefinition, getToolBySlug } from "@/data/tools/registry";
import {
  Terminal,
  FileText,
  Image as ImageIcon,
  Calculator as CalcIcon,
  Globe,
  MoreVertical,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
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
    description: string;
    iconName: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  text: {
    label: "Text Tools",
    description: "Word counter, case converter, diff checker, sorter & more",
    iconName: "Terminal",
    Icon: Terminal,
  },
  developer: {
    label: "Developer Tools",
    description: "JSON, Base64, JWT, UUID, regex, formatters & converters",
    iconName: "Terminal",
    Icon: Terminal,
  },
  pdf: {
    label: "PDF Suite",
    description: "Merge, split, compress, rotate, extract & convert PDFs",
    iconName: "FileText",
    Icon: FileText,
  },
  image: {
    label: "Image Tools",
    description: "Compress, resize, crop, rotate & convert images",
    iconName: "ImageIcon",
    Icon: ImageIcon,
  },
  calculators: {
    label: "Calculators & ROI",
    description: "Financial, date, unit, tax, loan & strategic calculators",
    iconName: "CalcIcon",
    Icon: CalcIcon,
  },
  web: {
    label: "Web Diagnostics",
    description: "HTTP, DNS, IP, SEO meta, robots, sitemap & schema tools",
    iconName: "Globe",
    Icon: Globe,
  },
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
const COMPONENT_MAP: Record<string, Renderer> = {
  // Text
  "text-studio": () => <TextWorkspace defaultMode="count" />,
  "word-counter": () => <TextWorkspace defaultMode="count" />,
  "character-counter": () => <TextWorkspace defaultMode="count" />,
  "case-converter": () => <TextWorkspace defaultMode="case" />,
  "remove-duplicate-lines": () => <TextWorkspace defaultMode="clean" />,
  "remove-empty-lines": () => <TextWorkspace defaultMode="clean" />,
  "text-sorter": () => <TextWorkspace defaultMode="sort" />,
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

  // PDF
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

  // Image
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

  // 1. Exact path match
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

  // 3. Category root or slug inside category
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

// ── THREE-DOT DROPDOWN ──
function WorkspaceCardMenu({
  category,
  tools,
  onSelectTool,
}: {
  category: WorkspaceCategory;
  tools: SubTool[];
  onSelectTool: (cat: WorkspaceCategory, toolId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-border/40 transition-colors"
        aria-label="More tools"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Tools in this workspace
            </p>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(category, tool.id);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left hover:bg-secondary/60 transition-colors group"
              >
                <span className="font-medium text-foreground/80 group-hover:text-foreground truncate">
                  {tool.label}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              </button>
            ))}
          </div>
          <div className="border-t border-border/30 px-3 py-2">
            <Link
              href={`/tools/${category}`}
              className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="h-3 w-3" />
              Open full page
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD CARD ──
function WorkspaceCard({
  category,
  onOpen,
  onSelectTool,
}: {
  category: WorkspaceCategory;
  onOpen: (cat: WorkspaceCategory) => void;
  onSelectTool: (cat: WorkspaceCategory, toolId: string) => void;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  const tools = SUB_TOOLS[category];
  const count = tools.length;

  return (
    <div
      className="group relative bg-card border border-border/40 rounded-2xl p-5 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200 select-none"
      onClick={() => onOpen(category)}
    >
      {/* Top row: icon + 3-dot */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-primary/8 rounded-xl text-primary group-hover:bg-primary/14 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <WorkspaceCardMenu
          category={category}
          tools={tools}
          onSelectTool={onSelectTool}
        />
      </div>

      {/* Title + description */}
      <h3 className="text-sm font-bold text-foreground mb-1 tracking-tight">
        {meta.label}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {meta.description}
      </p>

      {/* Footer: tool count */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {count} tools
        </span>
        <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          Open <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

// ── FULL-SCREEN WORKSPACE SHELL ──
function WorkspaceShell({
  category,
  toolId,
  platforms,
}: {
  category: WorkspaceCategory;
  toolId: string;
  platforms: any[];
}) {
  const router = useRouter();
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  const activeTool = SUB_TOOLS[category].find((t) => t.id === toolId);
  const render = COMPONENT_MAP[toolId];

  return (
    <div className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col overflow-hidden">
      {/* ── Slim top bar ── */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border/20 bg-card/50 backdrop-blur-xl">
        {/* Back */}
        <button
          onClick={() => router.push("/tools")}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">All Workspaces</span>
        </button>

        {/* Divider */}
        <span className="text-border/60 select-none hidden sm:inline">/</span>

        {/* Workspace label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">{meta.label}</span>
        </div>

        {/* Active tool pill */}
        {activeTool && (
          <>
            <span className="text-border/60 select-none">·</span>
            <span className="text-xs font-mono text-primary truncate max-w-[180px]">
              {activeTool.label}
            </span>
          </>
        )}
      </header>

      {/* ── Tool content — fills remaining height ── */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
        {render ? (
          <div key={toolId} className="h-full flex flex-col">
            {render({ platforms })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
              <Terminal className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold mb-1">Tool not available yet</h2>
            <p className="text-sm text-muted-foreground">
              Pick another tool from the bar above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD ──
function Dashboard({
  onOpen,
  onSelectTool,
}: {
  onOpen: (cat: WorkspaceCategory) => void;
  onSelectTool: (cat: WorkspaceCategory, toolId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
            Tool Hub
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
            Workspaces
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Pick a workspace to open it full-screen. Use the ⋯ menu on any card
            to jump straight to a specific tool.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_ORDER.map((cat) => (
            <WorkspaceCard
              key={cat}
              category={cat}
              onOpen={onOpen}
              onSelectTool={onSelectTool}
            />
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-center text-[11px] text-muted-foreground/50">
          All tools run entirely in your browser — nothing leaves your device.
        </p>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ──
export function ToolHubSearch({
  tools,
  categories,
  initialSlug,
  platforms = [],
}: ToolHubSearchProps) {
  const {
    category: resolvedCategory,
    toolId: resolvedToolId,
    missing,
  } = resolveSelection(initialSlug);

  // If a URL slug was provided → go straight into the workspace
  const hasInitialTool = !!(initialSlug && initialSlug.length > 0 && resolvedToolId && !missing);

  const [openCategory, setOpenCategory] = useState<WorkspaceCategory | null>(
    hasInitialTool ? resolvedCategory : null,
  );
  const [activeToolId, setActiveToolId] = useState<string>(
    resolvedToolId ?? SUB_TOOLS.text[0]?.id ?? "",
  );

  const handleOpenWorkspace = (cat: WorkspaceCategory) => {
    const firstTool = SUB_TOOLS[cat][0];
    setActiveToolId(firstTool?.id ?? "");
    setOpenCategory(cat);
  };

  const handleSelectTool = (cat: WorkspaceCategory, toolId: string) => {
    setActiveToolId(toolId);
    setOpenCategory(cat);
  };

  if (openCategory) {
    return (
      <WorkspaceShell
        category={openCategory}
        toolId={activeToolId}
        platforms={platforms}
      />
    );
  }

  return (
    <Dashboard onOpen={handleOpenWorkspace} onSelectTool={handleSelectTool} />
  );
}
