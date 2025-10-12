
'use client';

import { useState, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export function SearchInput({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery || '');
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
    <form onSubmit={handleSubmit} className="relative">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for articles, comparisons, and more..."
        className="h-12 pl-12 pr-28 rounded-full shadow-sm text-base"
      />
      <Button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 rounded-full px-6"
        disabled={isPending || !query.trim()}
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
      </Button>
    </form>
  );
}
