import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { ToolHubSearch } from "@/components/tools/ToolHubSearch";
import { TOOLS, CATEGORIES, getToolBySlug } from "@/data/tools/registry";

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
  const [first, second] = slug;
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

// ── MAIN ROUTING CONTROLLER ──────────────────────────────────────────────────
export default async function ToolsControllerPage({ params }: PageProps) {
  const { slug } = await params;

  // Single unified interactive workspace page for all /tools links & reloads
  return <ToolHubSearch tools={TOOLS} categories={CATEGORIES} initialSlug={slug} />;

}

