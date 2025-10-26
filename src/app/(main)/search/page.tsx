
import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import type { SearchParams } from '@/types/next';
import { Breadcrumbs } from '@/components/breadcrumb';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ManagedImage } from '@/components/managed-image';
import { SearchInput } from './_components/search-input';
import { BookText, GitCompareArrows, Search as SearchIcon } from 'lucide-react';
import { format } from 'date-fns';
import { SearchResultsTabs } from './_components/search-results-tabs';

async function performSearch(query: string) {
  if (!query) {
    return { posts: [], comparisons: [] };
  }

  const [posts, comparisons] = await prisma.$transaction([
    prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { content: { contains: query } },
        ],
      },
      include: {
        category: true,
      },
      take: 20,
    }),
    prisma.comparison.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { summary: { contains: query } },
          { platformA: { name: { contains: query } } },
          { platformB: { name: { contains: query } } },
        ],
      },
      include: {
        platformA: true,
        platformB: true,
      },
      take: 20,
    }),
  ]);

  return { posts, comparisons };
}

export default async function SearchPage(
  props: {
    searchParams: Promise<SearchParams>;
  }
) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const { posts, comparisons } = await performSearch(query);

  const totalResults = posts.length + comparisons.length;

  return (
    <div className="container py-12">
      <Breadcrumbs
        items={[{ name: 'Home', href: '/' }, { name: 'Search' }]}
        className="mb-8"
      />

      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold font-headline text-center mb-4">
          Search Results
        </h1>
        <Suspense>
            <SearchInput initialQuery={query} />
        </Suspense>
      </div>

      {query ? (
        totalResults > 0 ? (
          <div>
             <p className="text-center text-muted-foreground mb-8">Found {totalResults} result{totalResults !== 1 && 's'} for &quot;{query}&quot;</p>
            <Suspense>
                <SearchResultsTabs posts={posts} comparisons={comparisons} />
            </Suspense>
          </div>
        ) : (
          <Card className="text-center p-12 border-dashed">
            <h3 className="text-xl font-semibold">No results found for &quot;{query}&quot;</h3>
            <p className="text-muted-foreground mt-2">Try a different search term.</p>
          </Card>
        )
      ) : (
        <Card className="text-center p-12 border-dashed">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4"/>
            <h3 className="text-xl font-semibold">Search Our Site</h3>
            <p className="text-muted-foreground mt-2">Enter a query above to search for blog posts and comparisons.</p>
        </Card>
      )}
    </div>
  );
}
