
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
                <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
                <TabsTrigger value="comparisons">Comparisons ({comparisons.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-8 space-y-6">
                {posts.map(post => <PostResultCard key={`post-${post.id}`} post={post} />)}
                {comparisons.map(comp => <ComparisonResultCard key={`comp-${comp.id}`} comparison={comp} />)}
              </TabsContent>
              <TabsContent value="posts" className="mt-8 space-y-6">
                 {posts.length > 0 ? posts.map(post => <PostResultCard key={`post-${post.id}`} post={post} />) : <NoResultsForTab type="posts" />}
              </TabsContent>
              <TabsContent value="comparisons" className="mt-8 space-y-6">
                {comparisons.length > 0 ? comparisons.map(comp => <ComparisonResultCard key={`comp-${comp.id}`} comparison={comp} />) : <NoResultsForTab type="comparisons" />}
              </TabsContent>
            </Tabs>
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

function PostResultCard({ post }: { post: any }) {
    return (
        <Card className="hover:bg-accent/50 transition-colors">
            <Link href={`/blog/${post.slug}`} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
                <div className="relative aspect-video md:aspect-square rounded-md overflow-hidden">
                    <ManagedImage src={post.image} alt={post.title} data-ai-hint={post.dataAiHint ?? ''} fill className="object-cover" />
                </div>
                <div className="md:col-span-3">
                    <div className="flex items-center gap-2 mb-2">
                        <BookText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Blog Post</span>
                        {post.category && <span className="text-sm text-muted-foreground">&bull; {post.category.name}</span>}
                    </div>
                    <h3 className="text-xl font-bold font-headline mb-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.description}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(post.createdAt), 'MMMM d, yyyy')}</p>
                </div>
            </Link>
        </Card>
    )
}

function ComparisonResultCard({ comparison }: { comparison: any }) {
     return (
        <Card className="hover:bg-accent/50 transition-colors">
            <Link href={`/compare/${comparison.slug}`} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
                <div className="flex items-center justify-center bg-muted rounded-md p-4">
                     <div className="flex justify-around items-center h-10 w-full">
                      <div className="w-2/5 flex justify-center">
                        <ManagedImage
                          src={comparison.platformA.logoUrl}
                          alt={`${comparison.platformA.name} logo`}
                          width={100}
                          height={30}
                          className="object-contain h-8 w-auto"
                        />
                      </div>
                      <div className="w-1/5 flex justify-center">
                        <span className="font-mono text-sm text-muted-foreground">VS</span>
                      </div>
                      <div className="w-2/5 flex justify-center">
                        <ManagedImage
                          src={comparison.platformB.logoUrl}
                          alt={`${comparison.platformB.name} logo`}
                          width={100}
                          height={30}
                          className="object-contain h-8 w-auto"
                        />
                      </div>
                    </div>
                </div>
                <div className="md:col-span-3">
                     <div className="flex items-center gap-2 mb-2">
                        <GitCompareArrows className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Comparison</span>
                    </div>
                    <h3 className="text-xl font-bold font-headline mb-2">{comparison.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{comparison.summary}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(comparison.createdAt), 'MMMM d, yyyy')}</p>
                </div>
            </Link>
        </Card>
    )
}

function NoResultsForTab({ type }: { type: 'posts' | 'comparisons'}) {
    return (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No {type} found for this search.</p>
        </div>
    )
}
