"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ToolDefinition, getToolBySlug } from "@/data/tools/registry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Terminal,
  FileText,
  Image as ImageIcon,
  Calculator as CalcIcon,
  Globe,
  Workflow,
  MoreVertical,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

// ── DYNAMIC IMPORTS ──
const WorkspaceSkeleton = () => (
  <div className="w-full h-full flex flex-col space-y-4 animate-pulse p-4 sm:p-6">
    <div className="h-10 w-1/3 bg-muted/40 rounded-xl" />
    <div className="h-[400px] w-full bg-muted/20 rounded-2xl border border-border/10" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
const WorkflowWorkspace = dynamic(
  () =>
    import("./implementations/WorkflowWorkspace").then(
      (m) => m.WorkflowWorkspace,
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
const JPGToPDF = dynamic(
  () => import("./implementations/JPGToPDF").then((m) => m.JPGToPDF),
  { loading: () => <WorkspaceSkeleton />, ssr: false },
);
const PDFToText = dynamic(
  () => import("./implementations/PDFToText").then((m) => m.PDFToText),
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
  "text" | "pdf" | "image" | "calculators" | "web" | "workflows";

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
  platforms?: any[];
}

const CATEGORY_ORDER: WorkspaceCategory[] = [
  "text",
  "pdf",
  "image",
  "calculators",
  "web",
  "workflows",
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
    description:
      "Word counter, case converter, diff checker, sorter & text editors",
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
  workflows: {
    label: "Workflows & Suite",
    description:
      "Website audits, link crawlers, CSV data cleaner, API tester & regex studio",
    iconName: "Workflow",
    Icon: Workflow,
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
    {
      id: "organize-pdf",
      label: "Organize Pages",
      slug: "organize",
      path: "/tools/pdf/organize",
    },
    {
      id: "watermark-pdf",
      label: "Watermark",
      slug: "watermark",
      path: "/tools/pdf/watermark",
    },
    {
      id: "page-numbers-pdf",
      label: "Page Numbers",
      slug: "page-numbers",
      path: "/tools/pdf/page-numbers",
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
      id: "percentage-calculator",
      label: "Percentage",
      slug: "percentage",
      path: "/tools/calculators/percentage",
    },
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
  workflows: [
    {
      id: "universal-website-audit",
      label: "Universal Audit",
      slug: "universal-audit",
      path: "/tools/workflows/audits/universal-audit",
    },
    {
      id: "website-link-crawler",
      label: "Link Crawler",
      slug: "link-crawler",
      path: "/tools/workflows/audits/link-crawler",
    },
    {
      id: "website-performance-analyzer",
      label: "Speed Audit",
      slug: "performance-analyzer",
      path: "/tools/workflows/audits/performance-analyzer",
    },
    {
      id: "website-asset-analyzer",
      label: "Asset Inspector",
      slug: "asset-analyzer",
      path: "/tools/workflows/audits/asset-analyzer",
    },
    {
      id: "api-request-builder",
      label: "API Tester",
      slug: "api-tester",
      path: "/tools/workflows/data/api-tester",
    },
    {
      id: "csv-data-cleaner",
      label: "CSV Data Cleaner",
      slug: "csv-cleaner",
      path: "/tools/workflows/data/csv-cleaner",
    },
    {
      id: "json-csv-xml-converter",
      label: "Data Converter",
      slug: "data-converter",
      path: "/tools/workflows/data/data-converter",
    },
    {
      id: "regex-extraction-workspace",
      label: "Regex Extractor",
      slug: "regex-extractor",
      path: "/tools/workflows/data/regex-extractor",
    },
    {
      id: "markdown-html-workspace",
      label: "Markdown Workspace",
      slug: "markdown-html",
      path: "/tools/workflows/data/markdown-html",
    },
    {
      id: "file-converter-workspace",
      label: "File Batch Converter",
      slug: "file-converter",
      path: "/tools/workflows/data/file-converter",
    },
  ],
};

// ── ID → COMPONENT ──
const COMPONENT_MAP: Record<string, Renderer> = {
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

  "pdf-suite": () => (
    <PDFWorkspace processButtonLabel="Export PDF Studio" toolSlug="pdf-suite" />
  ),
  "merge-pdf": () => (
    <PDFWorkspace processButtonLabel="Merge PDFs" toolSlug="merge" />
  ),
  "split-pdf": () => (
    <PDFWorkspace processButtonLabel="Split & Extract Pages" toolSlug="split" />
  ),
  "compress-pdf": () => (
    <PDFWorkspace
      mode="compress"
      processButtonLabel="Compress PDF"
      toolSlug="compress"
    />
  ),
  "jpg-to-pdf": () => (
    <PDFWorkspace processButtonLabel="Convert to PDF" toolSlug="jpg-to-pdf" />
  ),
  "pdf-to-jpg": () => (
    <PDFWorkspace processButtonLabel="Convert to JPG" toolSlug="pdf-to-jpg" />
  ),
  "pdf-to-png": () => (
    <PDFWorkspace processButtonLabel="Convert to PNG" toolSlug="pdf-to-png" />
  ),
  "pdf-to-text": () => (
    <PDFWorkspace processButtonLabel="Extract Text" toolSlug="pdf-to-text" />
  ),
  "pdf-rotator": () => (
    <PDFWorkspace processButtonLabel="Rotate & Export" toolSlug="rotate" />
  ),
  "extract-pages-pdf": () => (
    <PDFWorkspace processButtonLabel="Extract Pages" toolSlug="extract-pages" />
  ),
  "delete-pages-pdf": () => (
    <PDFWorkspace
      processButtonLabel="Delete Pages & Export"
      toolSlug="delete-pages"
    />
  ),
  "organize-pdf": () => (
    <PDFWorkspace processButtonLabel="Save Reordered PDF" toolSlug="organize" />
  ),
  "watermark-pdf": () => (
    <PDFWorkspace processButtonLabel="Apply Watermark" toolSlug="watermark" />
  ),
  "page-numbers-pdf": () => (
    <PDFWorkspace
      processButtonLabel="Add Page Numbers"
      toolSlug="page-numbers"
    />
  ),

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

[
  "universal-website-audit",
  "website-link-crawler",
  "website-performance-analyzer",
  "website-asset-analyzer",
  "api-request-builder",
  "csv-data-cleaner",
  "json-csv-xml-converter",
  "regex-extraction-workspace",
  "markdown-html-workspace",
  "file-converter-workspace",
].forEach((id) => {
  COMPONENT_MAP[id] = () => <WorkflowWorkspace activeToolId={id} />;
});

const SUB_TOOLS = CATEGORY_ORDER.reduce(
  (acc, cat) => {
    acc[cat] = ALL_SUB_TOOLS[cat].filter((t) => t.id in COMPONENT_MAP);
    return acc;
  },
  {} as Record<WorkspaceCategory, SubTool[]>,
);

const isCategory = (s: string): s is WorkspaceCategory =>
  (CATEGORY_ORDER as string[]).includes(s);

function resolveSelection(initialSlug?: string[]): {
  category: WorkspaceCategory | null;
  toolId: string | null;
  missing: boolean;
} {
  if (!initialSlug || initialSlug.length === 0) {
    return { category: null, toolId: null, missing: false };
  }

  const path = "/tools/" + initialSlug.join("/");
  for (const cat of CATEGORY_ORDER) {
    const hit = SUB_TOOLS[cat].find((t) => t.path === path);
    if (hit) return { category: cat, toolId: hit.id, missing: false };
  }

  const matched = getToolBySlug(initialSlug);
  if (matched) {
    for (const cat of CATEGORY_ORDER) {
      const hit = SUB_TOOLS[cat].find((t) => t.id === matched.id);
      if (hit) return { category: cat, toolId: hit.id, missing: false };
    }
  }

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

  return { category: null, toolId: null, missing: true };
}

function WorkspaceCardMenu({
  category,
  tools,
  onSelectTool,
}: {
  category: WorkspaceCategory;
  tools: SubTool[];
  onSelectTool: (path: string) => void;
}) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="p-2 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer border border-transparent hover:border-border/40 focus:outline-none"
            aria-label="Workspace tools"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          className="z-[99999] w-64 bg-card border border-border/80 rounded-2xl shadow-2xl p-1.5 ring-1 ring-black/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 flex items-center justify-between border-b border-border/40 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Tools in this workspace
            </span>
            <span className="text-[10px] font-mono text-primary font-bold px-1.5 py-0.5 rounded-full bg-primary/10">
              {tools.length}
            </span>
          </div>
          <div className="py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
            {tools.map((tool) => (
              <DropdownMenuItem
                key={tool.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTool(tool.path);
                }}
                className="flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors group focus:bg-primary/10 focus:text-primary"
              >
                <span className="font-medium text-foreground/90 group-hover:text-primary truncate">
                  {tool.label}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator className="my-1 border-border/40" />
          <DropdownMenuItem
            asChild
            className="px-3 py-2 text-[11px] font-bold text-primary hover:bg-primary/10 cursor-pointer rounded-xl flex items-center gap-1.5 focus:bg-primary/10 focus:text-primary"
          >
            <Link
              href={`/tools/${category}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              Open entire workspace
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function WorkspaceCard({
  category,
  onOpen,
  onSelectTool,
}: {
  category: WorkspaceCategory;
  onOpen: (cat: WorkspaceCategory) => void;
  onSelectTool: (path: string) => void;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  const tools = SUB_TOOLS[category];
  const count = tools.length;

  return (
    <motion.div
      layoutId={`workspace-panel-${category}`}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => onOpen(category)}
      className="group relative bg-card/75 bg-[url('/logo.png')] bg-center bg-no-repeat bg-contain backdrop-blur-md rounded-4xl p-4 sm:p-5 cursor-pointer hover:border-primary/50 hover:shadow-xl hover:bg-card/90 transition-all select-none flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <WorkspaceCardMenu
            category={category}
            tools={tools}
            onSelectTool={onSelectTool}
          />
        </div>

        <h3 className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
          {meta.label}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
          {meta.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-muted-foreground/70">
          {count} tools
        </span>
        <span className="text-[11px] font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          Open <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </motion.div>
  );
}

function WorkspaceShell({
  category,
  toolId,
  platforms,
  onBack,
}: {
  category: WorkspaceCategory;
  toolId: string;
  platforms: any[];
  onBack: () => void;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  const activeTool = SUB_TOOLS[category].find((t) => t.id === toolId);
  const render = COMPONENT_MAP[toolId];

  return (
    <motion.div
      layoutId={`workspace-panel-${category}`}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-9999 bg-background text-foreground flex flex-col overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[url('/logo.png')] bg-center bg-no-repeat bg-contain opacity-[0.02] dark:opacity-[0.03]"
      />
      <header className="shrink-0 h-10 flex items-center gap-3 px-3.5 border-b border-border/30 bg-card/80 backdrop-blur-xl z-20 relative">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer px-2 py-1 rounded-lg hover:bg-secondary/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Workspaces</span>
        </button>

        <span className="text-border/60 select-none">/</span>

        <div className="flex items-center gap-1.5 shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">
            {meta.label}
          </span>
        </div>

        {activeTool && (
          <>
            <span className="text-border/60 select-none">·</span>
            <span className="text-xs font-mono text-primary truncate max-w-[220px]">
              {activeTool.label}
            </span>
          </>
        )}
      </header>
      <div className="relative z-10 flex-1 min-h-0 w-full h-full overflow-hidden">
        {render ? (
          <div
            key={toolId}
            className="absolute inset-0 flex flex-col overflow-hidden"
          >
            {render({ platforms })}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
              <Terminal className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold mb-1">Tool not available yet</h2>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Dashboard({
  onOpen,
  onSelectTool,
}: {
  onOpen: (cat: WorkspaceCategory) => void;
  onSelectTool: (path: string) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/logo.png')] bg-center bg-no-repeat bg-contain opacity-[0.03] dark:opacity-[0.05]"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 text-left">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              aria-label="Back to home"
              className="group p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent hover:border-border/40 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Workspaces
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            Click any workspace to open full-screen. Use the three dots (⋯) to
            jump straight to a tool.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {CATEGORY_ORDER.map((cat) => (
            <WorkspaceCard
              key={cat}
              category={cat}
              onOpen={onOpen}
              onSelectTool={onSelectTool}
            />
          ))}
        </div>

        <div className="mt-12 pt-4 border-t border-border/20 text-center text-[11px] text-muted-foreground/50">
          Zero-server architecture. All operations process 100% locally in your
          browser.
        </div>
      </div>
    </div>
  );
}

export function ToolHubSearch({
  tools,
  categories,
  initialSlug,
  platforms = [],
}: ToolHubSearchProps) {
  const router = useRouter();

  const { category: resolvedCategory, toolId: resolvedToolId } =
    resolveSelection(initialSlug);

  const isSlugActive = resolvedCategory !== null;

  const [activeCategory, setActiveCategory] =
    useState<WorkspaceCategory | null>(resolvedCategory);
  const [activeToolId, setActiveToolId] = useState<string>(
    resolvedToolId ??
      (resolvedCategory ? (SUB_TOOLS[resolvedCategory][0]?.id ?? "") : ""),
  );

  useEffect(() => {
    let targetToolId = resolvedToolId;
    if (typeof window !== "undefined" && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const hashTool = params.get("tool");
      if (
        hashTool &&
        resolvedCategory &&
        SUB_TOOLS[resolvedCategory]?.some((t) => t.id === hashTool)
      ) {
        targetToolId = hashTool;
      }
    }

    setActiveCategory(resolvedCategory);
    if (targetToolId) {
      setActiveToolId(targetToolId);
    } else if (resolvedCategory) {
      setActiveToolId(SUB_TOOLS[resolvedCategory][0]?.id ?? "");
    }
  }, [resolvedCategory, resolvedToolId]);

  const handleOpenWorkspace = (cat: WorkspaceCategory) => {
    const firstTool = SUB_TOOLS[cat][0];
    setActiveCategory(cat);
    setActiveToolId(firstTool?.id ?? "");
    router.push(`/tools/${cat}`);
  };

  const handleSelectTool = (path: string) => {
    router.push(path);
  };

  const handleBack = () => {
    setActiveCategory(null);
    router.push("/tools");
  };

  return (
    <LayoutGroup id="tools-workspaces-hub">
      <div className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col overflow-hidden w-screen h-screen">
        <Dashboard
          onOpen={handleOpenWorkspace}
          onSelectTool={handleSelectTool}
        />

        <AnimatePresence initial={false}>
          {isSlugActive && activeCategory && (
            <WorkspaceShell
              key={`workspace-shell-${activeCategory}`}
              category={activeCategory}
              toolId={activeToolId}
              platforms={platforms}
              onBack={handleBack}
            />
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
