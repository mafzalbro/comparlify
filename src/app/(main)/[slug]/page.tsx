import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Check if the slug contains "-vs-" (e.g., "kajabi-vs-skool")
  if (slug.includes("-vs-")) {
    // 1. First, check if it exists in our curated comparisons
    const comparison = await prisma.comparison.findUnique({
      where: { slug }
    });

    if (comparison) {
      // Redirect to the structured comparison detail page
      redirect(`/compare/${slug}`);
    } else {
      // 2. Fallback to the live comparison engine
      redirect(`/compare/vs/${slug}`);
    }
  }

  // If it's not a comparison slug, return 404
  notFound();
}
