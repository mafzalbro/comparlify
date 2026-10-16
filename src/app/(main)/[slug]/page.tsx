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
  return prisma.comparison.findFirst({
    where: { slug, published: true },
    select: { id: true, slug: true },
  });
});

const getPlatform = cache(async (slug: string) => {
  const platforms = await prisma.platform.findMany({
    select: { id: true, name: true },
  });
  return platforms.find(
    (p: { id: string; name: string }) =>
      p.name.toLowerCase().replace(/\s+/g, "-") === slug
  );
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

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
}

export default async function DynamicSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  // 1. Curated Comparison
  const comparison = await getComparison(slug);
  if (comparison) {
    return <ComparisonDetailPage {...props} />;
  }

  // 2. Dynamic Live Battle / Comparison fallback
  if (slug.includes("-vs-")) {
    return <ComparisonVsPage {...props} />;
  }

  // 3. Platform Review
  const platform = await getPlatform(slug);
  if (platform) {
    return <PlatformDetailPage {...props} />;
  }

  // If none matched and no static sibling exists, return 404
  notFound();
}
