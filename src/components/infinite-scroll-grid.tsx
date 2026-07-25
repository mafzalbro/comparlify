"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface InfiniteScrollGridProps {
  children: React.ReactNode[];
  batchSize?: number;
  emptyState?: React.ReactNode;
  gridClassName?: string;
}

export function InfiniteScrollGrid({
  children,
  batchSize = 9,
  emptyState,
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12",
}: InfiniteScrollGridProps) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset visibleCount whenever children length or elements change significantly (e.g. on filtering)
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [children.length, batchSize]);

  const hasMore = visibleCount < children.length;
  const visibleChildren = children.slice(0, visibleCount);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          // Standard timeout for a highly professional feel without disruptive layout shifts
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + batchSize, children.length));
            setLoading(false);
          }, 350);
        }
      },
      { threshold: 0.1, rootMargin: "250px" } // trigger earlier (250px below viewport) to ensure smooth, seamless infinite scrolling
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, children.length, batchSize]);

  if (children.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-12">
      <div className={gridClassName}>
        {visibleChildren}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="flex items-center gap-2.5 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-full text-primary font-semibold text-xs animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading more...</span>
          </div>
        </div>
      )}

      {!hasMore && children.length > batchSize && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 bg-secondary border border-border/40 px-5 py-2.5 rounded-full text-muted-foreground font-semibold text-xs">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>End of the feed</span>
          </div>
        </div>
      )}
    </div>
  );
}
