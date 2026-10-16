import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import ComparisonDetailPage, {
  generateMetadata as generateComparisonMetadata,
} from "@/app/(main)/compare/[slug]/page";
import ComparisonVsPage, {
  generateMetadata as generateVsMetadata,
} from "@/app/(main)/compare/vs/[slug]/page";
import PlatformDetailPage, {
  generateMetadata as generatePlatformMetadata,
} from "@/app/(main)/platform/[slug]/page";

export const revalidate = 3600;

const getComparison = cache(async (slug: string) => {
  try {
    return await prisma.comparison.findFirst({
      where: { slug, published: true },
      select: { id: true, slug: true },
    });
  } catch (err) {
    console.error("[getComparison] Prisma error:", err);
    return null;
  }
});

const getPlatform = cache(async (slug: string) => {
  if (!slug) return null;

  const cleanName = slug.replace(/-/g, " ");

  try {
    const directMatch = await prisma.platform.findFirst({
      where: {
        OR: [
          { id: slug },
          { name: { equals: cleanName, mode: "insensitive" } },
          { name: { equals: slug, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true },
    });

    if (directMatch) return directMatch;

    const platforms = await prisma.platform.findMany({
      select: { id: true, name: true },
    });

    return (
      platforms.find(
        (p: { id: string; name: string }) =>
          p.name.toLowerCase().replace(/\s+/g, "-") === slug,
      ) ?? null
    );
  } catch (err) {
    console.error("[getPlatform] Prisma error:", err);
    return null;
  }
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  if (!slug) return {};

  try {
    // 1. Is it a curated comparison?
    const comparison = await getComparison(slug);
    if (comparison) {
      return generateComparisonMetadata(props);
    }

    // 2. Is it a dynamic vs comparison?
    if (slug.includes("-vs-")) {
      return generateVsMetadata(props);
    }

    // 3. Is it a platform review?
    const platform = await getPlatform(slug);
    if (platform) {
      return generatePlatformMetadata(props);
    }

    return {};
  } catch (err) {
    console.error("[generateMetadata] Failed:", err);
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const [comparisons, platforms] = await Promise.all([
      prisma.comparison.findMany({
        where: { published: true },
        select: { slug: true },
      }),
      prisma.platform.findMany({
        select: { name: true },
      }),
    ]);

    const compSlugs = comparisons.map((c: { slug: string }) => ({
      slug: c.slug,
    }));
    const platSlugs = platforms.map((p: { name: string }) => ({
      slug: p.name.toLowerCase().replace(/\s+/g, "-"),
    }));

    return [...compSlugs, ...platSlugs];
  } catch (err) {
    console.error("[generateStaticParams] [slug] error:", err);
    return [];
  }
}

export default async function DynamicSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  if (!slug) {
    notFound();
  }

  // 1. Curated Comparison
  try {
    const comparison = await getComparison(slug);
    if (comparison) {
      return <ComparisonDetailPage {...props} />;
    }
  } catch (err) {
    console.error("[DynamicSlugPage] Comparison fetch failed:", err);
  }

  // 2. Dynamic Live Battle / Comparison fallback
  if (slug.includes("-vs-")) {
    return <ComparisonVsPage {...props} />;
  }

  // 3. Platform Review
  try {
    const platform = await getPlatform(slug);
    if (platform) {
      return <PlatformDetailPage {...props} />;
    }
  } catch (err) {
    console.error("[DynamicSlugPage] Platform fetch failed:", err);
  }

  // If none matched and no static sibling exists, return 404
  notFound();
}
