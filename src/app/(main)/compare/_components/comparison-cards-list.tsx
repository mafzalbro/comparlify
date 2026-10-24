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

    const selectedPlatforms = params
      .getAll("platforms")
      .flatMap((v) => v.split(",").filter(Boolean))
      .map((p) => p.toLowerCase()); // Normalize to lowercase

    let result = [...allComparisons];

    // ── SEARCH ─────────
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

    // ── PLATFORMS (SMART FALLBACK) ──────────────────────────────
    if (selectedPlatforms.length > 0) {
      result = result.filter((c) => {
        const pAId = (c.platformAId || "").toLowerCase();
        const pBId = (c.platformBId || "").toLowerCase();
        const nameA = (c.platformA?.name || "")
          .toLowerCase()
          .replace(/\s+/g, "-");
        const nameB = (c.platformB?.name || "")
          .toLowerCase()
          .replace(/\s+/g, "-");

        return selectedPlatforms.some((selected) => {
          // Remove "plat_" prefix if it exists to match raw names
          const cleanSelected = selected.replace("plat_", "");

          return (
            selected === pAId ||
            selected === pBId ||
            selected === nameA ||
            selected === nameB ||
            cleanSelected === pAId ||
            cleanSelected === pBId ||
            cleanSelected === nameA ||
            cleanSelected === nameB
          );
        });
      });
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
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [allComparisons, searchParamsString]);

  // ✅ Force InfiniteScrollGrid to reset when filters change
  return (
    <ComparisonList
      key={filtered.map((c) => c.id).join("-")}
      comparisons={filtered}
      emptyTitle={content["compare.empty.title"]}
      emptySubtitle={content["compare.empty.subtitle"]}
    />
  );
}
