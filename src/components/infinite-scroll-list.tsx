"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";

interface InfiniteScrollListProps<T> {
  items: T[];
  batchSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  gridClassName?: string;
}

export function InfiniteScrollList<T>({
  items,
  batchSize = 9,
  renderItem,
  emptyState,
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12",
}: InfiniteScrollListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const hasMore = visibleCount < items.length;
  const visibleItems = items.slice(0, visibleCount);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          // Cute delayed loading for high-fidelity feel
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
            setLoading(false);
          }, 800);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, items.length, batchSize]);

  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-16">
      <div className={gridClassName}>
        {visibleItems.map((item, index) => renderItem(item, index))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-6 py-3 rounded-full text-primary font-black uppercase tracking-[0.3em] text-[10px] shadow-sm animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Analyzing more dispatches...</span>
          </div>

          {/* Cute Loading Skeletons */}
          <div className={gridClassName + " w-full opacity-40 pointer-events-none mt-8"}>
            {Array.from({ length: Math.min(batchSize, items.length - visibleCount) }).map((_, i) => (
              <div
                key={i}
                className="h-80 w-full rounded-[2.5rem] border border-border/10 bg-card/10 animate-pulse relative overflow-hidden"
              >
                <div className="h-40 bg-linear-to-r from-muted to-card opacity-20"></div>
                <div className="p-8 space-y-4">
                  <div className="h-6 w-3/4 bg-muted rounded-full"></div>
                  <div className="h-4 w-5/6 bg-muted rounded-full"></div>
                  <div className="h-10 w-1/2 bg-muted rounded-full pt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasMore && items.length > batchSize && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 bg-secondary/10 border border-border/10 px-6 py-3 rounded-full text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>You have reached the end of the archive</span>
          </div>
        </div>
      )}
    </div>
  );
}
