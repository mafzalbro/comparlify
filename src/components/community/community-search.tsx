
"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

export function CommunitySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const handleSearch = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`/community?${params.toString()}`);
    });
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mt-12">
      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
        <Search className={`h-5 w-5 ${isPending ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
      </div>
      <Input
        type="search"
        placeholder="Search discussions, strategies, and intelligence..."
        className="h-16 pl-14 pr-6 rounded-full bg-card/50 backdrop-blur-xl border-border/10 focus:ring-primary/20 focus:border-primary/50 text-base font-medium italic shadow-2xl transition-all"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
