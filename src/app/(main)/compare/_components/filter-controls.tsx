"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Columns, ListFilter, X } from "lucide-react";
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
import type { Platform, ComparisonCategory } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SearchParams } from "@/types/next";
import { createQueryString } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MotionDiv, AnimatePresence } from "@/components/motion-wrapper";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface FilterControlsProps {
  allPlatforms: Platform[];
  categories: ComparisonCategory[];
  searchParams: SearchParams;
}

export function FilterControls({
  allPlatforms,
  categories,
  searchParams,
}: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(
    String(searchParams.search || ""),
  );
  const debouncedSearch = useDebounce(searchValue, 300);

  const handleFilterChange = useCallback(
    (params: Record<string, any>) => {
      startTransition(() => {
        const currentSearchParams = new URLSearchParams(window.location.search);
        const newQueryString = createQueryString(params, currentSearchParams);
        router.push(`${pathname}?${newQueryString}`, { scroll: false });
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    handleFilterChange({
      search: debouncedSearch || null,
      page: 1,
    });
  }, [debouncedSearch, handleFilterChange]);

  useEffect(() => {
    setSearchValue(String(searchParams.search || ""));
  }, [searchParams.search]);

  const sortValue = String(searchParams.sort || "newest");
  const categoryValue = String(searchParams.category || "all");
  const platformsParam = searchParams.platforms;
  const selectedPlatforms = Array.isArray(platformsParam)
    ? platformsParam
    : platformsParam
      ? [platformsParam]
      : [];

  const handleSortChange = (value: string) => {
    handleFilterChange({ sort: value, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    handleFilterChange({ category: value, page: 1 });
  };

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    const newSelectedPlatforms = checked
      ? [...selectedPlatforms, platformId]
      : selectedPlatforms.filter((id) => id !== platformId);

    handleFilterChange({
      platforms: newSelectedPlatforms.length > 0 ? newSelectedPlatforms : null,
      page: 1,
    });
  };

  const hasActiveFilters =
    !!searchParams.search ||
    (searchParams.sort && searchParams.sort !== "newest") ||
    (searchParams.platforms && selectedPlatforms.length > 0) ||
    (searchParams.category && searchParams.category !== "all");

  return (
    <MotionDiv layout className="flex flex-wrap items-center justify-center gap-3 w-full">
      <MotionDiv layout className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-60" />
        <Input
          id="search"
          name="search"
          placeholder="Search comparisons..."
          className="pl-10! h-10 bg-accent-surface! dark:bg-white/5 border-accent-border! rounded-full focus:ring-accent-surface! transition-all font-medium text-xs placeholder:opacity-50 mt-0!"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </MotionDiv>

      <MotionDiv layout>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
            variant="outline"
            className="h-10 px-6 rounded-full border-accent-border! bg-accent-surface! dark:bg-white/5 backdrop-blur-2xl! hover:bg-accent-surface/80! dark:hover:bg-white/5! transition-all relative font-black uppercase tracking-widest text-[9px]"
            disabled={isPending}
          >
            <ListFilter className="mr-2 h-3.5 w-3.5 text-primary" />
            Filters
            {(!!searchParams.sort ||
              !!searchParams.platforms ||
              !!searchParams.category) && (
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 bg-background/95 backdrop-blur-3xl border-border/10 shadow-2xl rounded-3xl p-6"
          align="end"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="sort"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1"
              >
                Sort By
              </Label>
              <Select
                value={sortValue}
                onValueChange={handleSortChange}
                disabled={isPending}
              >
                <SelectTrigger
                  id="sort"
                  className="h-10 bg-secondary/30 border-border/40 rounded-xl focus:ring-0"
                >
                  <SelectValue placeholder="Sort By..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/10 bg-background/95 backdrop-blur-xl">
                  <SelectItem
                    value="newest"
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    Newest First
                  </SelectItem>
                  <SelectItem
                    value="oldest"
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    Oldest First
                  </SelectItem>
                  <SelectItem
                    value="rating"
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    Top Rated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator className="opacity-40" />
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1"
              >
                Category
              </Label>
              <Select
                value={categoryValue}
                onValueChange={handleCategoryChange}
                disabled={isPending}
              >
                <SelectTrigger
                  id="category"
                  className="h-10 bg-secondary/30 border-border/40 rounded-xl focus:ring-0"
                >
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/10 bg-background/95 backdrop-blur-xl max-h-[300px]">
                  <SelectItem
                    value="all"
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    All Industries
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="text-[10px] font-bold uppercase tracking-widest"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator className="opacity-40" />
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                Platform Segment
              </Label>
              <ScrollArea className="h-40 rounded-xl bg-secondary/30 border border-border/40 p-2">
                <div className="grid grid-cols-1 gap-1">
                  {allPlatforms.map((platform) => (
                    <div
                      key={platform.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer group"
                    >
                      <Checkbox
                        id={`platform-${platform.id}`}
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={(checked) =>
                          handlePlatformChange(platform.id, !!checked)
                        }
                        disabled={isPending}
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
            initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <Button
              asChild
              variant="ghost"
              className="h-10 px-4 rounded-full text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-500/5 transition-all"
            >
              <Link href="/compare" scroll={false}>
                <X className="mr-2 h-3.5 w-3.5" />
                Reset
              </Link>
            </Button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}
