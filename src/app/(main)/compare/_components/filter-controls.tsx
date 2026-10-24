"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ListFilter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Platform } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MotionDiv, AnimatePresence } from "@/components/motion-wrapper";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface FilterControlsProps {
  allPlatforms: Platform[];
  categories: { id: string; name: string; slug: string }[];
}

export function FilterControls({
  allPlatforms,
  categories,
}: FilterControlsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Stable refs so handleFilterChange never changes identity
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    routerRef.current = router;
    pathnameRef.current = pathname;
  });

  const searchParamValue = searchParams.get("search") ?? "";
  const sortValue = searchParams.get("sort") ?? "newest";
  const categoryValue = searchParams.get("category") ?? "all";

  // ✅ FIX: read EVERY platforms value, not just the first
  const selectedPlatforms = searchParams
    .getAll("platforms")
    .flatMap((v) => v.split(",").filter(Boolean));

  const [searchValue, setSearchValue] = useState(searchParamValue);
  const debouncedSearch = useDebounce(searchValue, 500);

  // ✅ FIX: inline URL building, no startTransition, no createQueryString dep
  const handleFilterChange = useCallback((updates: Record<string, any>) => {
    const merged = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === "") {
        merged.delete(key);
      } else if (Array.isArray(value)) {
        merged.delete(key);
        value.forEach((v) => merged.append(key, String(v)));
      } else {
        merged.set(key, String(value));
      }
    }
    const qs = merged.toString();
    const url = qs ? `${pathnameRef.current}?${qs}` : pathnameRef.current;
    console.log("[FilterControls] push:", url);
    routerRef.current.push(url, { scroll: false });
  }, []);

  // ✅ FIX: skip the first fire — no more ?page=1 on mount
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    handleFilterChange({ search: debouncedSearch || null });
  }, [debouncedSearch, handleFilterChange]);

  useEffect(() => {
    setSearchValue(searchParamValue);
  }, [searchParamValue]);

  const handleSortChange = (v: string) => handleFilterChange({ sort: v });
  const handleCategoryChange = (v: string) =>
    handleFilterChange({ category: v === "all" ? null : v });
  const handlePlatformChange = (platformId: string, checked: boolean) => {
    const next = checked
      ? [...selectedPlatforms, platformId]
      : selectedPlatforms.filter((id) => id !== platformId);
    handleFilterChange({ platforms: next.length ? next : null });
  };

  const hasActiveFilters =
    !!searchParamValue ||
    (sortValue && sortValue !== "newest") ||
    selectedPlatforms.length > 0 ||
    (categoryValue && categoryValue !== "all");

  return (
    <MotionDiv
      layout
      className="flex flex-wrap items-center justify-center gap-3 w-full"
    >
      <MotionDiv layout className="relative flex-1 min-w-60">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-60 flex items-center justify-center z-10 pointer-events-none">
          <Search className="h-4 w-4" />
        </div>
        <Input
          id="search"
          name="search"
          placeholder="Search comparison reports..."
          className="pr-11 h-10 bg-accent-surface dark:bg-white/5 border-border/40 rounded-full focus:ring-accent-surface transition-all font-medium text-xs placeholder:text-muted-foreground/50 mt-0"
          style={{ paddingLeft: "2.75rem" }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary/10 transition-colors z-10"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </MotionDiv>

      <MotionDiv layout>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5 rounded-full border-border/40 bg-accent-surface dark:bg-white/5 hover:bg-accent-surface/80 dark:hover:bg-white/5 transition-all relative font-semibold text-xs text-foreground/90 flex items-center"
            >
              <ListFilter className="mr-2 h-4 w-4 text-primary" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 bg-background/95 backdrop-blur-md border border-border/30 shadow-xl rounded-2xl p-5"
            align="end"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground/80 px-1">
                  Sort By
                </Label>
                <Select value={sortValue} onValueChange={handleSortChange}>
                  <SelectTrigger className="h-10 bg-secondary/20 border-border/40 rounded-xl focus:ring-0 text-xs">
                    <SelectValue placeholder="Sort By..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-background">
                    <SelectItem value="newest" className="text-xs">
                      Newest First
                    </SelectItem>
                    <SelectItem value="oldest" className="text-xs">
                      Oldest First
                    </SelectItem>
                    <SelectItem value="rating" className="text-xs">
                      Top Rated
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="opacity-45" />

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground/80 px-1">
                  Category
                </Label>
                <Select
                  value={categoryValue}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="h-10 bg-secondary/20 border-border/40 rounded-xl focus:ring-0 text-xs">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-background max-h-62.5">
                    <SelectItem value="all" className="text-xs">
                      All Industries
                    </SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="opacity-45" />

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground/80 px-1">
                  Platform Segment
                </Label>
                <ScrollArea className="h-40 rounded-xl bg-secondary/20 border border-border/40 p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {allPlatforms.map((platform) => (
                      <div
                        key={platform.id}
                        className="flex items-center gap-2.5 p-1.5 hover:bg-muted/40 rounded-md transition-colors cursor-pointer group"
                      >
                        <Checkbox
                          id={`platform-${platform.id}`}
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={(checked) =>
                            handlePlatformChange(platform.id, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`platform-${platform.id}`}
                          className="text-xs font-medium cursor-pointer group-hover:text-primary transition-colors"
                        >
                          {platform.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </MotionDiv>

      <AnimatePresence>
        {hasActiveFilters && (
          <MotionDiv
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <Button
              asChild
              variant="ghost"
              className="h-10 px-4 rounded-full text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/5 transition-all"
            >
              <Link href="/compare" scroll={false}>
                <X className="mr-1.5 h-4 w-4" />
                Reset
              </Link>
            </Button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}
