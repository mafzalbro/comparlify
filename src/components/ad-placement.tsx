"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface Ad {
  id: string;
  type: "SCRIPT" | "IMAGE";
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  allowedPages?: string; // Comma-separated list
}

interface AdPlacementProps {
  placement:
    | "HEADER"
    | "SIDEBAR"
    | "POST_TOP"
    | "POST_BOTTOM"
    | "COMPARISON_BETWEEN"
    | "MOBILE_FIXED_BOTTOM";
  className?: string;
}

export function AdPlacement({ placement, className = "" }: AdPlacementProps) {
  const pathname = usePathname();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAd() {
      try {
        // Fetch one active ad for this specific placement
        const res = await fetch(
          `/api/rest/advertisement?placement=${placement}&active=true&limit=1`,
        );
        if (!res.ok) throw new Error("Failed to fetch ad");

        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setAd(json.data[0]);
        }
      } catch (error) {
        console.error("Ad error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAd();
  }, [placement]);

  if (loading || !ad) return null;

  // Page level filtering
  if (ad.allowedPages) {
    const pages = ad.allowedPages.split(",").map((p) => p.trim());
    const isAllowed = pages.some((p) => {
      if (p === "*") return true;
      if (p.endsWith("*")) {
        return pathname.startsWith(p.slice(0, -1));
      }
      return p === pathname;
    });

    if (!isAllowed) return null;
  }

  if (ad.type === "IMAGE" && ad.imageUrl) {
    const content = (
      <div
        className={`ad-placement ad-${placement.toLowerCase()} flex justify-center py-4 ${className}`}
      >
        <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
          <Image
            src={ad.imageUrl}
            alt="Advertisement"
            width={728}
            height={90}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-1 right-2 text-[10px] font-medium text-white bg-black/40 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
            AD
          </div>
        </div>
      </div>
    );
    return ad.linkUrl ? (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    ) : (
      content
    );
  }

  return (
    <div
      className={`ad-placement ad-${placement.toLowerCase()} flex justify-center py-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: ad.content }}
    />
  );
}
