// src/components/ad-placement.tsx
import { cache } from "react";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
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
}

// Dedupe DB hits per-request (4 AdPlacements on one page = 1 query per slot)
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
}: AdPlacementProps) {
  const [headersList, ad] = await Promise.all([headers(), getAd(placement)]);
  if (!ad) return null;

  const pathname = headersList.get("x-pathname") || "/";
  if (!matchesPage(ad.allowedPages, pathname)) return null;

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
