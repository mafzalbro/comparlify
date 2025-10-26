
import Link from 'next/link';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { ManagedImage } from '@/components/managed-image';
import { BookText, GitCompareArrows } from 'lucide-react';
import type { Post, Comparison, Platform } from '@prisma/client';

type PopulatedComparison = Comparison & { platformA: Platform, platformB: Platform };

export function PostResultCard({ post }: { post: any }) {
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

export function ComparisonResultCard({ comparison }: { comparison: PopulatedComparison }) {
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

export function NoResultsForTab({ type }: { type: 'posts' | 'comparisons'}) {
    return (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No {type} found for this search.</p>
        </div>
    )
}
