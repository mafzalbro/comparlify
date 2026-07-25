"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ListFilter, X, Loader2 } from "lucide-react";
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
import type { User, PostCategory } from "@prisma/client";
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
  authors?: User[];
  categories: PostCategory[];
  searchParams: SearchParams;
}

export function FilterControls({
  authors,
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
  const authorValue = String(searchParams.author || "all");
  const categoryValue = String(searchParams.category || "all");

  const handleSortChange = (value: string) => {
    handleFilterChange({ sort: value, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    handleFilterChange({ category: value, page: 1 });
  };

  const handleAuthorChange = (value: string) => {
    handleFilterChange({ author: value, page: 1 });
  };

  const hasActiveFilters =
    !!searchParams.search ||
    (!!searchParams.sort && searchParams.sort !== "newest") ||
    (!!searchParams.author && searchParams.author !== "all") ||
    (!!searchParams.category && searchParams.category !== "all");

  return (
    <MotionDiv layout className="flex flex-wrap items-center gap-3 w-full">
      {/* --- Capsule Search --- */}
      <MotionDiv layout className="relative flex-1 min-w-[260px] group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
          <Search className="h-4 w-4" />
        </div>
        <Input
          id="search"
          name="search"
          placeholder="Search articles and insights..."
          className="pl-11 pr-11 h-11 bg-accent-surface dark:bg-white/5 border-border/40 rounded-full focus:ring-accent-surface transition-all font-medium text-xs placeholder:text-muted-foreground/50"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={isPending}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary/10 transition-colors z-10"
            disabled={isPending}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </MotionDiv>

      {/* --- Unified Filter Button --- */}
      <MotionDiv layout>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5 rounded-full border-border/40 bg-accent-surface dark:bg-white/5 hover:bg-accent-surface/80 dark:hover:bg-white/8 transition-all relative font-semibold text-xs text-foreground/90 flex items-center"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              ) : (
                <ListFilter className="mr-2 h-4 w-4 text-primary" />
              )}
              Filters
              {(!!searchParams.sort ||
                !!searchParams.author ||
                !!searchParams.category) && (
                <span className="ml-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 bg-background/95 backdrop-blur-md border border-border/30 shadow-xl rounded-2xl p-5"
            align="end"
          >
            <div className="space-y-5">
              {/* Sort */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground/80 px-1">
                  Sort By
                </Label>
                <Select
                  value={sortValue}
                  onValueChange={handleSortChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-10 bg-secondary/20 border-border/40 rounded-xl focus:ring-0 text-xs">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-background">
                    <SelectItem value="newest" className="text-xs">
                      Newest First
                    </SelectItem>
                    <SelectItem value="oldest" className="text-xs">
                      Oldest First
                    </SelectItem>
                    <SelectItem value="alpha" className="text-xs">
                      A-Z
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="opacity-45" />

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground/80 px-1">
                  Topic Category
                </Label>
                <Select
                  value={categoryValue}
                  onValueChange={handleCategoryChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-10 bg-secondary/20 border-border/40 rounded-xl focus:ring-0 text-xs">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-background max-h-[250px]">
                    <SelectItem value="all" className="text-xs">
                      All Topics
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="text-xs"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {authors && authors.length > 0 && (
                <>
                  <Separator className="opacity-45" />
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground/80 px-1">
                      Editor / Author
                    </Label>
                    <Select
                      value={authorValue}
                      onValueChange={handleAuthorChange}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-10 bg-secondary/20 border-border/40 rounded-xl focus:ring-0 text-xs">
                        <SelectValue placeholder="All Authors" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/40 bg-background">
                        <SelectItem value="all" className="text-xs">
                          All Authors
                        </SelectItem>
                        {authors.map((author) => (
                          <SelectItem
                            key={author.id}
                            value={author.id}
                            className="text-xs"
                          >
                            {author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
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
              className="h-11 px-4 rounded-full text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/5 transition-all"
              disabled={isPending}
            >
              <Link href="/blog" scroll={false}>
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
