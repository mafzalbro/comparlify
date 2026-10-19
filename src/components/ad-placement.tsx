import { cache } from "react";
import prisma from "@/lib/prisma";
import { AdRenderer } from "./ad-renderer";

export type AdPlacementSlot =
  | "HEADER"
  | "SIDEBAR"
  | "POST_TOP"
  | "POST_BOTTOM"
  | "COMPARISON_BETWEEN"
  | "MOBILE_FIXED_BOTTOM";

interface AdPlacementProps {
  placement: AdPlacementSlot;
  className?: string;
  /**
   * Optional. When omitted, no page-level filtering is applied
   * (equivalent to allowedPages="*"). Pass the concrete pathname
   * from the page so filtering happens server-side.
   */
  pathname?: string;
}

const getAd = cache(async (placement: AdPlacementSlot) => {
  try {
    return await prisma.advertisement.findFirst({
      where: { placement, active: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("[AdPlacement] DB error:", err);
    return null;
  }
});

function matchesPage(allowedPages: string | null, pathname: string): boolean {
  if (!allowedPages) return true;
  const path = pathname.replace(/\/+$/, "") || "/";
  return allowedPages
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .some((p) => {
      if (!p) return false;
      if (p === "*") return true;
      if (p.endsWith("*")) {
        const prefix = p.slice(0, -1);
        return path === prefix.replace(/\/+$/, "") || path.startsWith(prefix);
      }
      return path === p.replace(/\/+$/, "");
    });
}

export async function AdPlacement({
  placement,
  className = "",
  pathname,
}: AdPlacementProps) {
  const ad = await getAd(placement);
  if (!ad) return null;

  // Server-side filtering when pathname is provided.
  // When omitted, behave as "all pages" — still renders, still static.
  if (pathname && !matchesPage(ad.allowedPages, pathname)) return null;

  return (
    <AdRenderer
      id={ad.id}
      type={ad.type}
      content={ad.content}
      imageUrl={ad.imageUrl}
      linkUrl={ad.linkUrl}
      placement={placement}
      className={className}
    />
  );
}
