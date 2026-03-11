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
    <div className="flex flex-col lg:flex-row items-center gap-5 w-full">
      {/* --- IMMERSIVE SEARCH --- */}
      <div className="relative w-full lg:flex-1 group">
        <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center bg-background/50 backdrop-blur-md rounded-2xl border border-border/10 shadow-inner group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all duration-300">
          <Search className="ml-5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="search"
            name="search"
            placeholder="Search our editorial archive..."
            className="h-12 px-4 bg-transparent border-none text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="mr-4 p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* --- SELECT CONTROLS --- */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-3">
          <Select
            value={categoryValue}
            onValueChange={handleCategoryChange}
            disabled={isPending}
          >
            <SelectTrigger className="h-12 px-5 rounded-xl bg-secondary/30 border-none shadow-sm hover:bg-secondary/50 transition-all font-black uppercase tracking-widest text-[10px] min-w-[160px] focus:ring-0">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/10 bg-background/80 backdrop-blur-xl">
              <SelectItem value="all" className="font-bold">
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="font-medium text-[10px] font-black uppercase tracking-widest"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortValue}
            onValueChange={handleSortChange}
            disabled={isPending}
          >
            <SelectTrigger className="h-12 px-5 rounded-xl bg-secondary/30 border-none shadow-sm hover:bg-secondary/50 transition-all font-black uppercase tracking-widest text-[10px] min-w-[130px] focus:ring-0">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/10 bg-background/80 backdrop-blur-xl">
              <SelectItem
                value="newest"
                className="font-bold text-[10px] font-black uppercase tracking-widest"
              >
                Newest First
              </SelectItem>
              <SelectItem
                value="oldest"
                className="font-medium text-[10px] font-black uppercase tracking-widest"
              >
                Oldest First
              </SelectItem>
              <SelectItem
                value="alpha"
                className="font-medium text-[10px] font-black uppercase tracking-widest"
              >
                A-Z
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {authors && authors.length > 0 && (
          <Select
            value={authorValue}
            onValueChange={handleAuthorChange}
            disabled={isPending}
          >
            <SelectTrigger className="h-12 px-5 rounded-xl bg-secondary/30 border-none shadow-sm hover:bg-secondary/50 transition-all font-black uppercase tracking-widest text-[10px] min-w-[130px] focus:ring-0">
              <SelectValue placeholder="All Authors" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/10 bg-background/80 backdrop-blur-xl">
              <SelectItem
                value="all"
                className="font-bold text-[10px] font-black uppercase tracking-widest"
              >
                All Authors
              </SelectItem>
              {authors.map((author) => (
                <SelectItem
                  key={author.id}
                  value={author.id}
                  className="font-medium text-[10px] font-black uppercase tracking-widest"
                >
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button
            asChild
            variant="ghost"
            className="h-12 px-5 rounded-xl hover:bg-red-500/10 hover:text-red-500 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <Link href="/blog" scroll={false}>
              <X className="mr-2 h-3.5 w-3.5" /> Reset
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
