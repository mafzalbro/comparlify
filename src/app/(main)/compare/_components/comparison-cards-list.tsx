import prisma from "@/lib/prisma";
import type { Comparison, Platform } from "@prisma/client";
import { ComparisonList } from "@/components/compare/comparison-list";
import type { SearchParams } from "@/types/next";

type ComparisonWithPlatforms = Comparison & {
  platformA: Platform;
  platformB: Platform;
};

interface ComparisonCardsListProps {
  searchParams: SearchParams;
  content: Record<string, string>;
}

async function getComparisons({
  search,
  sort,
  platforms,
  category,
}: {
  search?: string;
  sort?: string;
  platforms?: string[];
  category?: string;
}) {
  let where: any = { published: true };
  let orderBy: any = { createdAt: "desc" };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
      { platformA: { name: { contains: search } } },
      { platformB: { name: { contains: search } } },
    ];
  }

  if (category && category !== "all") {
    where.categoryId = category;
  }

  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "rating") {
    orderBy = { platformA: { rating: "desc" } };
  }

  if (platforms && platforms.length > 0) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { platformAId: { in: platforms } },
          { platformBId: { in: platforms } },
        ],
      },
    ];
  }

  return prisma.comparison.findMany({
    where,
    include: {
      platformA: true,
      platformB: true,
    },
    orderBy,
  });
}

export async function ComparisonCardsList({ searchParams, content }: ComparisonCardsListProps) {
  const { search, sort, category } = searchParams;
  const platformsParam = searchParams.platforms;
  const selectedPlatforms = Array.isArray(platformsParam)
    ? platformsParam
    : platformsParam
      ? [platformsParam]
      : [];

  const comparisons = await getComparisons({
    search: String(search ?? ""),
    sort: String(sort ?? "newest"),
    platforms: selectedPlatforms,
    category: String(category ?? "all"),
  });

  return (
    <ComparisonList
      comparisons={comparisons}
      emptyTitle={content["compare.empty.title"]}
      emptySubtitle={content["compare.empty.subtitle"]}
    />
  );
}
