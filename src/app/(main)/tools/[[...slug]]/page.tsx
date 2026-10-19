import { Metadata } from "next";
import { Suspense } from "react";
import { generateSeoMetadata } from "@/lib/seo";
import { ToolHubSearch } from "@/components/tools/ToolHubSearch";
import { TOOLS, CATEGORIES, getToolBySlug } from "@/data/tools/registry";
import prisma from "@/lib/prisma";

// ── ISR: build once at build time, reject unknown paths ──
export const revalidate = false;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

// ── METADATA GENERATOR ───────────────────────────────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return generateSeoMetadata({
      title: "All Creator & Developer Tools | Comparlify",
      description:
        "Access our high-fidelity suite of developer utilities, PDF tools, profit calculators, and growth engines.",
      path: "/tools",
    });
  }

  const [first, second] = slug;

  if (slug.length === 1 && CATEGORIES[first as keyof typeof CATEGORIES]) {
    const cat = CATEGORIES[first as keyof typeof CATEGORIES];
    return generateSeoMetadata({
      title: `${cat.name} | Comparlify`,
      description: cat.description,
      path: `/tools/${first}`,
    });
  }

  if (slug.length === 2 && CATEGORIES[first as keyof typeof CATEGORIES]) {
    const cat = CATEGORIES[first as keyof typeof CATEGORIES];
    const subcatName =
      cat.subcategories?.[second as keyof typeof cat.subcategories];
    if (subcatName) {
      return generateSeoMetadata({
        title: `${subcatName} - ${cat.name} | Comparlify`,
        description: `Explore high-performance ${subcatName} inside our professional developer utility suite.`,
        path: `/tools/${first}/${second}`,
      });
    }
  }

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

// ── STATIC PARAMS GENERATOR ──────────────────────────────
export async function generateStaticParams() {
  const params: { slug?: string[] }[] = [];

  // Root /tools
  params.push({ slug: [] });

  // Categories & Subcategories
  for (const cat of Object.keys(CATEGORIES)) {
    params.push({ slug: [cat] });
    const subcats = Object.keys(
      CATEGORIES[cat as keyof typeof CATEGORIES].subcategories || {},
    );
    for (const sub of subcats) {
      params.push({ slug: [cat, sub] });
    }
  }

  // Tools — register ALL forms the router supports (including 1-segment alias)
  for (const tool of TOOLS) {
    // /tools/roi-calculator, /tools/ad-profit-predictor, etc.
    params.push({ slug: [tool.slug] });

    if (tool.subcategory) {
      params.push({ slug: [tool.category, tool.subcategory, tool.slug] });
      params.push({ slug: [tool.category, tool.slug] });
    } else {
      params.push({ slug: [tool.category, tool.slug] });
    }
  }

  // Register AI tool paths from Prisma (DB-backed, not in TOOLS registry)
  try {
    const aiTools = await prisma.tool.findMany({
      where: { enabled: true },
      select: { slug: true },
    });
    for (const t of aiTools) {
      params.push({ slug: ["ai", t.slug] });
    }
  } catch (err) {
    console.warn("[generateStaticParams] tools DB unreachable:", err);
  }

  // Deduplicate
  const seen = new Set<string>();
  return params.filter((p) => {
    const key = (p.slug ?? []).join("/");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── FALLBACK SKELETON ────────────────────────────────────
function ToolHubSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="h-12 w-64 rounded-2xl bg-card/40 animate-pulse" />
      <div className="h-14 w-full max-w-2xl rounded-2xl bg-card/40 animate-pulse" />
    </div>
  );
}

// ── MAIN ROUTING CONTROLLER ─────────────────────────────
export default async function ToolsControllerPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ToolHubSkeleton />}>
      <ToolHubSearch tools={TOOLS} categories={CATEGORIES} initialSlug={slug} />
    </Suspense>
  );
}
