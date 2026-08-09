import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Check if the slug contains "-vs-" (e.g., "kajabi-vs-skool")
  if (slug.includes("-vs-")) {
    // First, check if it exists in our curated comparisons
    const comparison = await prisma.comparison.findUnique({
      where: { slug }
    });

    if (comparison) {
      redirect(`/compare/${slug}`);
    } else {
      // Fallback to the live comparison engine
      redirect(`/compare/vs/${slug}`);
    }
  }

  // 2. Check if the slug matches a single platform (e.g., "kajabi")
  // We match by name converted to slug format
  const platforms = await prisma.platform.findMany({
    select: { id: true, name: true }
  });

  const matchedPlatform = platforms.find(
    (p: { id: string; name: string }) => p.name.toLowerCase().replace(/\s+/g, "-") === slug
  );

  if (matchedPlatform) {
    redirect(`/platform/${slug}`);
  }

  // 3. If it's not a comparison or a platform, return 404
  // (Blog posts, news, etc. are handled by their own routes like /blog/[slug])
  notFound();
}
