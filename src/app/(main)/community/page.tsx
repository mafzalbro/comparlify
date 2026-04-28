import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateSeoMetadata } from "@/lib/seo";
import { getContent } from "@/lib/content";
import { getCommunityStats, ensureDefaultCategories } from "@/lib/community";

// Atomic Components
import { CommunityHero } from "@/components/community/community-hero";
import { CommunityStatsBar } from "@/components/community/community-stats-bar";
import { CategoryGrid } from "@/components/community/category-grid";
import { StatusProgramCTA } from "@/components/community/status-program-cta";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Community Forums | Connect with Creators",
    description:
      "Join the conversation! Ask questions, share your knowledge, and connect with thousands of course creators in our active community.",
    path: "/community",
  });
}

async function getForumCategories(search?: string) {
  return prisma.forumCategory.findMany({
    include: {
      topics: {
        where: {
          status: "APPROVED",
          ...(search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } }
            ]
          } : {})
        },
        select: {
          id: true,
          _count: { select: { posts: { where: { status: "APPROVED" } } } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  // Ensure we have real categories
  await ensureDefaultCategories();

  const { q: search } = await searchParams;

  const [categories, stats, content] = await Promise.all([
    getForumCategories(search),
    getCommunityStats(),
    getContent(),
  ]);

  if (content["module.community.enabled"] === "false") {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      {/* ── HERO ─────────────────────────── */}
      <CommunityHero />

      <div id="categories" className="container mx-auto py-24 px-4 md:px-6">
        {/* ── STATS BAR ───────────────────── */}
        <CommunityStatsBar stats={stats} />

        {/* ── CATEGORY GRID ────────────────── */}
        <CategoryGrid categories={categories} />
      </div>

      {/* ── STATUS PROGRAM CTA ────────────── */}
      <StatusProgramCTA />
    </div>
  );
}
