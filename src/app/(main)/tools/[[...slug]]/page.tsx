import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import prisma from "@/lib/prisma";
import { getUserProjects } from "@/app/actions/projects";
import { MotionDiv } from "@/components/motion-wrapper";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowRight,
  HelpCircle,
  Settings,
  Wand2,
  Calculator,
  FileText,
  Search,
  Code,
  ShieldCheck,
  ChevronRight,
  Database
} from "lucide-react";
import { TOOLS, CATEGORIES, getToolBySlug, ToolDefinition } from "@/data/tools/registry";

// ── LEGACY TOOL COMPONENT IMPORTS ─────────────────────────────────────────────
import { PricingCalculator } from "@/components/tools/pricing-calculator";
import { ROICalculator } from "../roi-calculator/_components/roi-calculator";
import { CourseRevenueCalculator } from "../course-revenue-calculator/_components/course-revenue-calculator";
import { StackOptimizer } from "@/components/tools/stack-optimizer";
import { ChurnForecaster } from "@/components/tools/churn-forecaster";
import { AdProfitPredictor } from "@/components/tools/ad-profit-predictor";
import { PlatformFinder } from "@/components/tools/implementations/PlatformFinder";
import { StackArchitect } from "../stack-architect/_components/stack-architect";

// ── NEW DEVELOPER & PDF TOOL IMPORTS ──────────────────────────────────────────
import { JSONFormatter } from "@/components/tools/implementations/JSONFormatter";
import { JSONValidator } from "@/components/tools/implementations/JSONValidator";
import { JSONMinifier } from "@/components/tools/implementations/JSONMinifier";
import { JSONViewer } from "@/components/tools/implementations/JSONViewer";
import { Base64Encoder } from "@/components/tools/implementations/Base64Encoder";
import { Base64Decoder } from "@/components/tools/implementations/Base64Decoder";
import { URLEncoder } from "@/components/tools/implementations/URLEncoder";
import { URLDecoder } from "@/components/tools/implementations/URLDecoder";
import { JWTDecoder } from "@/components/tools/implementations/JWTDecoder";
import { UUIDGenerator } from "@/components/tools/implementations/UUIDGenerator";
import { PasswordGenerator } from "@/components/tools/implementations/PasswordGenerator";
import { RegexTester } from "@/components/tools/implementations/RegexTester";
import { HTMLFormatter } from "@/components/tools/implementations/HTMLFormatter";
import { CSSFormatter } from "@/components/tools/implementations/CSSFormatter";
import { JSFormatter } from "@/components/tools/implementations/JSFormatter";
import { SQLFormatterTool } from "@/components/tools/implementations/SQLFormatter";
import { XMLFormatter } from "@/components/tools/implementations/XMLFormatter";
import { YAMLFormatter } from "@/components/tools/implementations/YAMLFormatter";
import { UnixTimestampConverter } from "@/components/tools/implementations/UnixTimestampConverter";
import { CronGenerator } from "@/components/tools/implementations/CronGenerator";
import { MergePDF } from "@/components/tools/implementations/MergePDF";
import { SplitPDF } from "@/components/tools/implementations/SplitPDF";
import { CompressPDF } from "@/components/tools/implementations/CompressPDF";
import { JPGToPDF } from "@/components/tools/implementations/JPGToPDF";
import { PDFToJPG } from "@/components/tools/implementations/PDFToJPG";
import { PDFToPNG } from "@/components/tools/implementations/PDFToPNG";
import { PDFToText } from "@/components/tools/implementations/PDFToText";
import { PDFRotator } from "@/components/tools/implementations/PDFRotator";
import { PDFPageExtractor } from "@/components/tools/implementations/PDFPageExtractor";
import { PDFPageDeleter } from "@/components/tools/implementations/PDFPageDeleter";
import { ImageWorkspace } from "@/components/tools/implementations/ImageWorkspace";
import { TextWorkspace } from "@/components/tools/implementations/TextWorkspace";
import { CalculatorWorkspace } from "@/components/tools/implementations/CalculatorWorkspace";
import { WebDiagnosticsWorkspace } from "@/components/tools/implementations/WebDiagnosticsWorkspace";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

// ── METADATA GENERATOR ────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return generateSeoMetadata({
      title: "All Creator & Developer Tools | Comparlify",
      description: "Access our high-fidelity suite of developer utilities, PDF tools, profit calculators, and growth engines.",
      path: "/tools",
    });
  }

  // Check if matches category
  const [first, second, third] = slug;
  if (slug.length === 1 && CATEGORIES[first as keyof typeof CATEGORIES]) {
    const cat = CATEGORIES[first as keyof typeof CATEGORIES];
    return generateSeoMetadata({
      title: `${cat.name} | Comparlify`,
      description: cat.description,
      path: `/tools/${first}`,
    });
  }

  // Check if matches subcategory
  if (slug.length === 2 && CATEGORIES[first as keyof typeof CATEGORIES]) {
    const cat = CATEGORIES[first as keyof typeof CATEGORIES];
    const subcatName = cat.subcategories?.[second as keyof typeof cat.subcategories];
    if (subcatName) {
      return generateSeoMetadata({
        title: `${subcatName} - ${cat.name} | Comparlify`,
        description: `Explore high-performance ${subcatName} inside our professional developer utility suite.`,
        path: `/tools/${first}/${second}`,
      });
    }
  }

  // Resolve Tool Definition
  const tool = getToolBySlug(slug);
  if (tool) {
    return generateSeoMetadata({
      title: tool.metaTitle,
      description: tool.metaDescription,
      path: `/tools/${slug.join("/")}`,
    });
  }

  return generateSeoMetadata({
    title: "Tool Directory",
    path: "/tools",
  });
}

// ── STATIC PARAMS GENERATOR ───────────────────────────────────────────────────
export async function generateStaticParams() {
  const params: { slug?: string[] }[] = [];

  // Root /tools
  params.push({ slug: [] });

  // Categories & Subcategories
  for (const cat of Object.keys(CATEGORIES)) {
    params.push({ slug: [cat] });
    const subcats = Object.keys(CATEGORIES[cat as keyof typeof CATEGORIES].subcategories || {});
    for (const sub of subcats) {
      params.push({ slug: [cat, sub] });
    }
  }

  // Tools
  for (const tool of TOOLS) {
    if (tool.subcategory) {
      params.push({ slug: [tool.category, tool.subcategory, tool.slug] });
    } else {
      params.push({ slug: [tool.category, tool.slug] });
    }
  }

  return params;
}

// ── DATABASE FETCHERS FOR LEGACY COMPONENTS ──────────────────────────────────
async function getPlatforms() {
  try {
    return await prisma.platform.findMany({
      include: {
        tiers: { orderBy: { monthlyPrice: "asc" } },
        features: { include: { feature: true } }
      },
      orderBy: { name: "asc" },
    });
  } catch (e) {
    return [];
  }
}

// ── COMPONENT MAPPER ─────────────────────────────────────────────────────────
function renderToolComponent(tool: ToolDefinition, data: { platforms: any; projects: any }) {
  switch (tool.id) {
    // ── Legacy/Existing Tools ──
    case "pricing-calculator":
      return <PricingCalculator platforms={data.platforms} />;
    case "roi-calculator":
      return <ROICalculator platforms={data.platforms} projects={data.projects} />;
    case "course-revenue-calculator":
      return <CourseRevenueCalculator platforms={data.platforms} />;
    case "stack-optimizer":
      return <StackOptimizer />;
    case "churn-forecaster":
      return <ChurnForecaster />;
    case "ad-profit-predictor":
      return <AdProfitPredictor />;
    case "creator-match":
      return <PlatformFinder />;
    case "stack-architect":
      return <StackArchitect platforms={data.platforms} projects={data.projects} />;

    // ── New Batch 1 (Developer Tools) ──
    case "json-formatter":
      return <JSONFormatter />;
    case "json-validator":
      return <JSONValidator />;
    case "json-minifier":
      return <JSONMinifier />;
    case "json-viewer":
      return <JSONViewer />;
    case "base64-encoder":
      return <Base64Encoder />;
    case "base64-decoder":
      return <Base64Decoder />;
    case "url-encoder":
      return <URLEncoder />;
    case "url-decoder":
      return <URLDecoder />;
    case "jwt-decoder":
      return <JWTDecoder />;
    case "uuid-generator":
      return <UUIDGenerator />;
    case "password-generator":
      return <PasswordGenerator />;
    case "regex-tester":
      return <RegexTester />;
    case "html-formatter":
      return <HTMLFormatter />;
    case "css-formatter":
      return <CSSFormatter />;
    case "javascript-formatter":
      return <JSFormatter />;
    case "sql-formatter":
      return <SQLFormatterTool />;
    case "xml-formatter":
      return <XMLFormatter />;
    case "yaml-formatter":
      return <YAMLFormatter />;
    case "unix-timestamp-converter":
      return <UnixTimestampConverter />;
    case "cron-expression-generator":
      return <CronGenerator />;

    // ── New Batch 2 (PDF Tools) ──
    case "merge-pdf":
      return <MergePDF />;
    case "split-pdf":
      return <SplitPDF />;
    case "compress-pdf":
      return <CompressPDF />;
    case "jpg-to-pdf":
      return <JPGToPDF />;
    case "pdf-to-jpg":
      return <PDFToJPG />;
    case "pdf-to-png":
      return <PDFToPNG />;
    case "pdf-to-text":
      return <PDFToText />;
    case "pdf-rotator":
      return <PDFRotator />;
    case "extract-pages-pdf":
      return <PDFPageExtractor />;
    case "delete-pages-pdf":
      return <PDFPageDeleter />;

    // ── New Batch 3 (Image Tools) ──
    case "image-compressor":
      return <ImageWorkspace defaultMode="compress" />;
    case "image-resizer":
      return <ImageWorkspace defaultMode="resize" />;
    case "image-cropper":
      return <ImageWorkspace defaultMode="crop" />;
    case "image-rotator":
      return <ImageWorkspace defaultMode="rotate" />;
    case "jpg-to-png":
      return <ImageWorkspace defaultMode="jpg-to-png" />;
    case "png-to-jpg":
      return <ImageWorkspace defaultMode="png-to-jpg" />;
    case "jpg-to-webp":
      return <ImageWorkspace defaultMode="jpg-to-webp" />;
    case "png-to-webp":
      return <ImageWorkspace defaultMode="png-to-webp" />;
    case "webp-to-jpg":
      return <ImageWorkspace defaultMode="webp-to-jpg" />;
    case "image-to-base64":
      return <ImageWorkspace defaultMode="base64" />;

    // ── New Batch 4 (Text Tools) ──
    case "word-counter":
      return <TextWorkspace defaultMode="word-counter" />;
    case "character-counter":
      return <TextWorkspace defaultMode="character-counter" />;
    case "case-converter":
      return <TextWorkspace defaultMode="case-converter" />;
    case "remove-duplicate-lines":
      return <TextWorkspace defaultMode="remove-duplicate-lines" />;
    case "remove-empty-lines":
      return <TextWorkspace defaultMode="remove-empty-lines" />;
    case "text-sorter":
      return <TextWorkspace defaultMode="text-sorter" />;
    case "text-reverser":
      return <TextWorkspace defaultMode="text-reverser" />;
    case "text-diff-checker":
      return <TextWorkspace defaultMode="text-diff-checker" />;
    case "find-and-replace":
      return <TextWorkspace defaultMode="find-and-replace" />;
    case "slug-generator":
      return <TextWorkspace defaultMode="slug-generator" />;

    // ── New Batch 5 (Calculators & Converters) ──
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
      return <CalculatorWorkspace activeToolId={tool.id} />;

    // ── New Batch 6 (Web & SEO Tools) ──
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
      return <WebDiagnosticsWorkspace activeToolId={tool.id} />;

    default:
      return <div className="text-center p-8 text-muted-foreground">Component coming soon!</div>;
  }
}

// ── MAIN ROUTING CONTROLLER ──────────────────────────────────────────────────
export default async function ToolsControllerPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Root /tools (Tools Directory Dashboard)
  if (!slug || slug.length === 0) {
    return <ToolsDashboardView />;
  }

  const [first, second, third] = slug;

  // Validate Category
  const isCategory = CATEGORIES[first as keyof typeof CATEGORIES];
  if (!isCategory) {
    notFound();
  }

  // 2. Category Landing Page (e.g. /tools/developer)
  if (slug.length === 1) {
    return <CategoryView categoryId={first} />;
  }

  // Check if matches subcategory or tool
  const cat = CATEGORIES[first as keyof typeof CATEGORIES];
  const isSubcategory = cat.subcategories?.[second as keyof typeof cat.subcategories];

  // 3. Subcategory Page (e.g. /tools/developer/json)
  if (slug.length === 2 && isSubcategory) {
    return <SubcategoryView categoryId={first} subcategoryId={second} />;
  }

  // 4. Individual Tool View (either /tools/pdf/merge or /tools/developer/json/formatter)
  const tool = getToolBySlug(slug);
  if (!tool) {
    notFound();
  }

  // Fetch db dependencies for legacy tools if needed
  let platforms: any[] = [];
  let projects: any[] = [];
  if (tool.legacyComponent) {
    platforms = await getPlatforms();
    try {
      projects = await getUserProjects();
    } catch (_) {}
  }

  return (
    <ToolLayout tool={tool}>
      {renderToolComponent(tool, { platforms, projects })}
    </ToolLayout>
  );
}

// ── SUB-COMPONENTS FOR RENDERING VIEWS ────────────────────────────────────────

// A. Master Tools Dashboard (/tools)
function ToolsDashboardView() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary mb-4 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Centralized Utility Ecosystem</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Comparlify <span className="text-primary italic font-semibold">Tool</span> Hub
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Surgical-grade code formatters, interactive in-browser PDF utilities, and strategic planning calculators.
        </p>
      </div>

      <div className="space-y-16">
        {Object.entries(CATEGORIES).map(([catId, cat]) => {
          const catTools = TOOLS.filter(t => t.category === catId);
          return (
            <div key={catId} className="space-y-6">
              <div className="border-b border-border/10 pb-4">
                <Link href={`/tools/${catId}`} className="group inline-flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h2>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  {cat.description}
                </p>
              </div>

              {/* Subcategories (if any) or Grid of tools directly */}
              {Object.keys(cat.subcategories || {}).length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(cat.subcategories).map(([subId, subName]) => {
                    const subTools = catTools.filter(t => t.subcategory === subId);
                    if (subTools.length === 0) return null;
                    return (
                      <div key={subId} className="space-y-4">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-primary/75">
                          {subName}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {subTools.map(tool => (
                            <ToolCard key={tool.id} tool={tool} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// B. Category View (/tools/[category])
function CategoryView({ categoryId }: { categoryId: string }) {
  const cat = CATEGORIES[categoryId as keyof typeof CATEGORIES];
  const catTools = TOOLS.filter(t => t.category === categoryId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <Link href="/tools" className="text-xs text-primary font-bold uppercase tracking-wider hover:underline flex items-center gap-1.5 mb-3">
          ← Back to Tool Hub
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {cat.name}
        </h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-2xl">
          {cat.description}
        </p>
      </div>

      {Object.keys(cat.subcategories || {}).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(cat.subcategories).map(([subId, subName]) => {
            const subTools = catTools.filter(t => t.subcategory === subId);
            if (subTools.length === 0) return null;
            return (
              <div key={subId} className="space-y-4">
                <Link href={`/tools/${categoryId}/${subId}`} className="group inline-flex items-center gap-1.5">
                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {subName}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {catTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}

// C. Subcategory View (/tools/[category]/[subcategory])
function SubcategoryView({ categoryId, subcategoryId }: { categoryId: string, subcategoryId: string }) {
  const cat = CATEGORIES[categoryId as keyof typeof CATEGORIES];
  const subName = cat.subcategories?.[subcategoryId as keyof typeof cat.subcategories];
  const subTools = TOOLS.filter(t => t.category === categoryId && t.subcategory === subcategoryId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <Link href={`/tools/${categoryId}`} className="text-xs text-primary font-bold uppercase tracking-wider hover:underline flex items-center gap-1.5 mb-3">
          ← Back to {cat.name}
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {subName}
        </h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
          High-performance in-browser utility modules for {subName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}

// D. Tool Card Component
function ToolCard({ tool }: { tool: ToolDefinition }) {
  const href = tool.subcategory
    ? `/tools/${tool.category}/${tool.subcategory}/${tool.slug}`
    : `/tools/${tool.category}/${tool.slug}`;

  return (
    <Link href={href} className="group block h-full">
      <Card className="p-5 h-full bg-card/20 hover:bg-card/40 border border-border/40 hover:border-primary/30 transition-all duration-300 rounded-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              {tool.title}
              {tool.tag === "🔥" && (
                <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
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
        <div className="mt-5 pt-3.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-primary uppercase tracking-wider">
          <span>Initialize Tool</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
