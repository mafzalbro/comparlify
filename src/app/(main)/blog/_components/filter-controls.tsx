"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ListFilter, User as UserIcon, X } from "lucide-react";
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

  const handleAuthorChange = (value: string) => {
    handleFilterChange({ author: value, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    handleFilterChange({ category: value, page: 1 });
  };

  const hasActiveFilters =
    !!searchParams.search ||
    searchParams.sort !== "newest" ||
    (searchParams.author && searchParams.author !== "all") ||
    (searchParams.category && searchParams.category !== "all");

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* --- Capsule Search --- */}
      <div className="relative flex-1 min-w-[280px] group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity" />
        <Input
          id="search"
          name="search"
          placeholder="Search editorial archive..."
          className="pl-11 h-11 bg-accent-surface! dark:bg-white/5 border-accent-border! rounded-full focus:ring-accent-surface! transition-all font-medium text-xs placeholder:text-muted-foreground/40"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary/10 transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* --- Unified Filter Button --- */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6 rounded-full border-accent-border! bg-accent-surface! dark:bg-white/5 backdrop-blur-2xl! hover:bg-accent-surface/80! dark:hover:bg-white/8! transition-all relative font-black uppercase tracking-widest text-[9px]"
            disabled={isPending}
          >
            <ListFilter className="mr-2 h-3.5 w-3.5 text-primary" />
            Filters
            {(!!searchParams.sort ||
              !!searchParams.author ||
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
            {/* Sort */}
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                Sort By
              </Label>
              <Select
                value={sortValue}
                onValueChange={handleSortChange}
                disabled={isPending}
              >
                <SelectTrigger className="h-10 bg-secondary/30 border-border/40 rounded-xl focus:ring-0">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/10 bg-background/95 backdrop-blur-xl">
                  <SelectItem value="newest" className="text-[10px] font-bold uppercase tracking-widest">Newest First</SelectItem>
                  <SelectItem value="oldest" className="text-[10px] font-bold uppercase tracking-widest">Oldest First</SelectItem>
                  <SelectItem value="alpha" className="text-[10px] font-bold uppercase tracking-widest">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="opacity-40" />

            {/* Category */}
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                Topic Category
              </Label>
              <Select
                value={categoryValue}
                onValueChange={handleCategoryChange}
                disabled={isPending}
              >
                <SelectTrigger className="h-10 bg-secondary/30 border-border/40 rounded-xl focus:ring-0">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/10 bg-background/95 backdrop-blur-xl max-h-[300px]">
                  <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Topics</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-[10px] font-bold uppercase tracking-widest">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {authors && authors.length > 0 && (
              <>
                <Separator className="opacity-40" />
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                    Editor / Author
                  </Label>
                  <Select
                    value={authorValue}
                    onValueChange={handleAuthorChange}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-10 bg-secondary/30 border-border/40 rounded-xl focus:ring-0">
                      <SelectValue placeholder="All Authors" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/10 bg-background/95 backdrop-blur-xl">
                      <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Authors</SelectItem>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id} className="text-[10px] font-bold uppercase tracking-widest">
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

      {hasActiveFilters && (
        <Button
          asChild
          variant="ghost"
          className="h-11 px-4 rounded-full text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-500 hover:bg-red-500/5 transition-all ml-auto"
        >
          <Link href="/blog" scroll={false}>
            <X className="mr-2 h-3.5 w-3.5" />
            Reset
          </Link>
        </Button>
      )}
    </div>
  );
}
