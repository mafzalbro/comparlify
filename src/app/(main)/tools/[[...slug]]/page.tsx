import { Metadata } from "next";
import { Suspense } from "react";
import { redirect, permanentRedirect } from "next/navigation";
import { generateSeoMetadata } from "@/lib/seo";
import { ToolHubSearch } from "@/components/tools/ToolHubSearch";
import { TOOLS, CATEGORIES, getToolBySlug } from "@/data/tools/registry";
import prisma from "@/lib/prisma";

export const revalidate = false;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

/** Resolve the SINGLE canonical path for any tool slug. */
function canonicalToolPath(slug: string[]): string | null {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  return tool.subcategory
    ? `/tools/${tool.category}/${tool.subcategory}/${tool.slug}`
    : `/tools/${tool.category}/${tool.slug}`;
}

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
    // Canonical ALWAYS points to the fully-qualified path
    const canonicalPath = tool.subcategory
      ? `/tools/${tool.category}/${tool.subcategory}/${tool.slug}`
      : `/tools/${tool.category}/${tool.slug}`;
    return generateSeoMetadata({
      title: tool.metaTitle,
      description: tool.metaDescription,
      path: canonicalPath,
    });
  }

  return generateSeoMetadata({ title: "Tool Directory", path: "/tools" });
}

export async function generateStaticParams() {
  const params: { slug?: string[] }[] = [];

  params.push({ slug: [] });

  for (const cat of Object.keys(CATEGORIES)) {
    params.push({ slug: [cat] });
    const subcats = Object.keys(
      CATEGORIES[cat as keyof typeof CATEGORIES].subcategories || {},
    );
    for (const sub of subcats) {
      params.push({ slug: [cat, sub] });
    }
  }

  // Only register the FULL canonical path for each tool
  for (const tool of TOOLS) {
    if (tool.subcategory) {
      params.push({ slug: [tool.category, tool.subcategory, tool.slug] });
    } else {
      params.push({ slug: [tool.category, tool.slug] });
    }
  }

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

  const seen = new Set<string>();
  return params.filter((p) => {
    const key = (p.slug ?? []).join("/");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ToolHubSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="h-12 w-64 rounded-2xl bg-card/40 animate-pulse" />
      <div className="h-14 w-full max-w-2xl rounded-2xl bg-card/40 animate-pulse" />
    </div>
  );
}

export default async function ToolsControllerPage({ params }: PageProps) {
  const { slug } = await params;

  // If this is a tool URL, ensure it's the canonical path. If not, 308-redirect.
  if (slug && slug.length > 0) {
    const tool = getToolBySlug(slug);
    if (tool) {
      const canonical = canonicalToolPath(slug);
      if (canonical && canonical !== `/tools/${slug.join("/")}`) {
        permanentRedirect(canonical); // 308 — preserves link equity
      }
    }
  }

  return (
    <Suspense fallback={<ToolHubSkeleton />}>
      <ToolHubSearch tools={TOOLS} categories={CATEGORIES} initialSlug={slug} />
    </Suspense>
  );
}
