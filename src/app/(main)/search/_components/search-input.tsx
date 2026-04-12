"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";

export function SearchInput({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500 opacity-0 group-focus-within:opacity-100"></div>
      <div className="relative flex items-center bg-accent-surface! dark:bg-white/5 border-accent-border! rounded-full p-2 pr-2 shadow-2xl group-hover:border-primary/20 group-focus-within:border-primary/30 transition-all duration-500">
        <div className="pl-6 pr-4">
          <SearchIcon className="h-5 w-5 text-primary opacity-60 group-focus-within:opacity-100 transition-all" />
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for articles, comparisons, and more..."
          className="h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm font-medium placeholder:text-muted-foreground/40 px-0"
        />
        <Button
          type="submit"
          className="h-12 px-10 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all ml-4"
          disabled={isPending || !query.trim()}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Search</span>
          )}
        </Button>
      </div>
    </form>
  );
}
