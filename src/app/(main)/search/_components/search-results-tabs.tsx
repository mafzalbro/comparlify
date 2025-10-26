
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostResultCard, ComparisonResultCard, NoResultsForTab } from './search-result-cards';
import type { Post, Comparison, Platform } from '@prisma/client';

type PopulatedComparison = Comparison & { platformA: Platform, platformB: Platform };

interface SearchResultsTabsProps {
    posts: Post[];
    comparisons: PopulatedComparison[];
}

export function SearchResultsTabs({ posts, comparisons }: SearchResultsTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('type') || 'all';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('type');
        } else {
            params.set('type', value);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({posts.length + comparisons.length})</TabsTrigger>
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
    );
}
