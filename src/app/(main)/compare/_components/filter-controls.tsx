"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterControlsProps {
  allPlatforms: { id: string; name: string }[];
  categories: { id: string; name: string; slug: string }[];
}

export function FilterControls({
  allPlatforms,
  categories,
}: FilterControlsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";
  const platformsParam = searchParams.get("platforms") ?? "";

  const selectedPlatforms = useMemo(
    () => platformsParam.split(",").filter(Boolean),
    [platformsParam],
  );

  // Local state for the search box, debounced to the URL
  const [localSearch, setLocalSearch] = useState(search);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) params.delete(key);
      else params.set(key, value);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Debounce search → URL (keeps navigation from firing on every keystroke)
  useEffect(() => {
    if (localSearch === search) return;
    const t = setTimeout(() => {
      updateParam("search", localSearch || null);
    }, 300);
    return () => clearTimeout(t);
  }, [localSearch, search, updateParam]);

  const togglePlatform = (id: string) => {
    const next = selectedPlatforms.includes(id)
      ? selectedPlatforms.filter((p) => p !== id)
      : [...selectedPlatforms, id];
    updateParam("platforms", next.length ? next.join(",") : null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search comparisons..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-11 pl-11 pr-10 rounded-full bg-background/50 border-border/40"
          />
          {localSearch && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setLocalSearch("");
                updateParam("search", null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category */}
        <Select
          value={category}
          onValueChange={(v) => updateParam("category", v === "all" ? null : v)}
        >
          <SelectTrigger className="h-11 w-full sm:w-48 rounded-full bg-background/50 border-border/40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sort}
          onValueChange={(v) => updateParam("sort", v === "newest" ? null : v)}
        >
          <SelectTrigger className="h-11 w-full sm:w-40 rounded-full bg-background/50 border-border/40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform toggle chips */}
      {allPlatforms.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {allPlatforms.map((p) => {
            const active = selectedPlatforms.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/50 text-muted-foreground border-border/40 hover:border-primary/40 hover:text-foreground",
                )}
              >
                {p.name}
              </button>
            );
          })}
          {selectedPlatforms.length > 0 && (
            <button
              type="button"
              onClick={() => updateParam("platforms", null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
