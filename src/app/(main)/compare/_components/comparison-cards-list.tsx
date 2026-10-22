"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Comparison, Platform } from "@prisma/client";
import { ComparisonList } from "@/components/compare/comparison-list";

type ComparisonWithPlatforms = Comparison & {
  platformA: Platform;
  platformB: Platform;
};

interface ComparisonCardsListProps {
  allComparisons: ComparisonWithPlatforms[];
  content: Record<string, string>;
}

export function ComparisonCardsList({
  allComparisons,
  content,
}: ComparisonCardsListProps) {
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const filtered = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const search = (params.get("search") ?? "").toLowerCase();
    const sort = params.get("sort") ?? "newest";
    const category = params.get("category") ?? "all";
    const platformsParam = params.get("platforms") ?? "";
    const selectedPlatforms = platformsParam.split(",").filter(Boolean);

    let result = [...allComparisons];

    // ── SEARCH (mirrors original server-side behaviour) ─────────
    if (search) {
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          (c.summary ?? "").toLowerCase().includes(search) ||
          c.platformA.name.toLowerCase().includes(search) ||
          c.platformB.name.toLowerCase().includes(search),
      );
    }

    // ── CATEGORY ────────────────────────────────────────────────
    if (category && category !== "all") {
      result = result.filter((c) => c.categoryId === category);
    }

    // ── PLATFORMS ───────────────────────────────────────────────
    if (selectedPlatforms.length > 0) {
      result = result.filter(
        (c) =>
          selectedPlatforms.includes(c.platformAId) ||
          selectedPlatforms.includes(c.platformBId),
      );
    }

    // ── SORT ────────────────────────────────────────────────────
    if (sort === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sort === "rating") {
      result.sort(
        (a, b) => (b.platformA.rating ?? 0) - (a.platformA.rating ?? 0),
      );
    } else {
      // "newest" default
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [allComparisons, searchParamsString]);

  return (
    <ComparisonList
      comparisons={filtered}
      emptyTitle={content["compare.empty.title"]}
      emptySubtitle={content["compare.empty.subtitle"]}
    />
  );
}
