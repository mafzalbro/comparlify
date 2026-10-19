"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { AdPlacementSlot } from "./ad-placement";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdRendererProps {
  id: string;
  type: "SCRIPT" | "IMAGE";
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  placement: AdPlacementSlot;
  className?: string;
}

const MIN_HEIGHT: Record<AdPlacementSlot, number> = {
  HEADER: 90,
  SIDEBAR: 250,
  POST_TOP: 250,
  POST_BOTTOM: 250,
  COMPARISON_BETWEEN: 250,
  MOBILE_FIXED_BOTTOM: 50,
};

// Strip ALL <script> tags. They are NEVER executed by React, and re-running
// them causes the exact "already have ads" error you're seeing.
function stripScripts(html: string): string {
  return html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
}

export function AdRenderer({
  id,
  type,
  content,
  imageUrl,
  linkUrl,
  placement,
  className = "",
}: AdRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const minHeight = MIN_HEIGHT[placement];
  // Deterministic on server AND client → no hydration mismatch
  const safeHtml = type === "SCRIPT" ? stripScripts(content) : "";

  useEffect(() => {
    if (type !== "SCRIPT") return;
    const container = containerRef.current;
    if (!container) return;

    // Defer past hydration so React has fully committed the tree
    const timer = setTimeout(() => {
      const ins = container.querySelector<HTMLElement>("ins.adsbygoogle");
      if (!ins) return;

      // AdSense marks filled/unfilled slots; both mean "don't push again"
      const status = ins.getAttribute("data-adsbygoogle-status");
      if (status === "done" || status === "unfilled") return;

      // Guard against React StrictMode double-invoke / rapid remounts
      if (ins.getAttribute("data-adsbygoogle-pushed") === "1") return;
      ins.setAttribute("data-adsbygoogle-pushed", "1");

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.debug(
            "[AdRenderer] AdSense already filled (harmless):",
            (err as Error).message,
          );
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [type, safeHtml, id, placement]);

  if (type === "IMAGE") {
    if (!imageUrl) return null;

    const img = (
      <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
        <Image
          src={imageUrl}
          alt="Advertisement"
          width={728}
          height={90}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-1 right-2 text-[10px] font-medium text-white bg-black/40 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
          AD
        </div>
      </div>
    );

    return (
      <div
        className={`ad-placement ad-${placement.toLowerCase()} flex justify-center py-4 ${className}`}
      >
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="block"
          >
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ad-placement ad-${placement.toLowerCase()} flex justify-center py-4 w-full ${className}`}
      style={{ minHeight }}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
