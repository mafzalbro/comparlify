
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import type { Post, Comparison, Platform, Bookmark } from '@prisma/client';
import { ArrowRight, BookText, GitCompareArrows } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagedImage } from "@/components/managed-image";
import type { SearchParams } from "@/types/next";

type PopulatedPostBookmark = Bookmark & { post: Post };
type PopulatedComparisonBookmark = Bookmark & { comparison: Comparison & { platformA: Platform, platformB: Platform } };

async function getBookmarks(userId: string) {
    const postBookmarks = await prisma.bookmark.findMany({
        where: { userId, postId: { not: null } },
        orderBy: { createdAt: 'desc' },
        include: { post: true },
        take: 20,
    });

    const comparisonBookmarks = await prisma.bookmark.findMany({
        where: { userId, comparisonId: { not: null } },
        orderBy: { createdAt: 'desc' },
        include: { comparison: { include: { platformA: true, platformB: true } } },
        take: 20,
    });

    return {
        posts: postBookmarks as PopulatedPostBookmark[],
        comparisons: comparisonBookmarks as PopulatedComparisonBookmark[],
    }
}

function PostBookmarkCard({ post }: { post: Post }) {
    const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
    return (
        <Card className="flex flex-col group bg-card/60 backdrop-blur-lg border-border/20 shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="relative overflow-hidden aspect-[16/10]">
                <Link href={`/blog/${post.slug}`} className="block">
                    <ManagedImage
                        src={post.image}
                        alt={post.title}
                        data-ai-hint={post.dataAiHint ?? ''}
                        fill
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-lg line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors stretched-link">
                        {post.title}
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-muted-foreground text-sm line-clamp-2">{post.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-secondary/20 py-3 px-6">
                <div className="text-sm text-muted-foreground">
                    <span>{readTime} min read</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="group-hover:text-primary -mr-3">
                    <Link href={`/blog/${post.slug}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function ComparisonBookmarkCard({ comparison }: { comparison: Comparison & { platformA: Platform, platformB: Platform } }) {
    return (
        <Card className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl h-full">
            <CardHeader className="p-4">
                <div className="relative h-16">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                        <ManagedImage src={comparison.platformA.logoUrl} alt={`${comparison.platformA.name} logo`} width={120} height={35} className="object-contain" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                        <ManagedImage src={comparison.platformB.logoUrl} alt={`${comparison.platformB.name} logo`} width={120} height={35} className="object-contain" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-background text-muted-foreground rounded-full p-1.5 border shadow-inner">
                            <span className="font-mono text-xs">VS</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 px-4 pb-4 space-y-2">
                <h3 className="font-headline text-lg text-center text-foreground h-12 line-clamp-2">
                    <Link href={`/compare/${comparison.slug}`} className="hover:text-primary transition-colors stretched-link">{comparison.title}</Link>
                </h3>
            </CardContent>
            <CardFooter className="p-2 bg-secondary/30">
                <Button asChild className="w-full" variant="ghost">
                    <Link href={`/compare/${comparison.slug}`}>View Comparison <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default async function UserPanelDashboard({ searchParams }: { searchParams: SearchParams }) {
    const session = await auth();
    if (!session?.user) return null;

    const { posts, comparisons } = await getBookmarks(session?.user?.id || "");
    const hasBookmarks = posts.length > 0 || comparisons.length > 0;
    
    const activeTab = searchParams.view || 'posts';

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome, {session.user.name}!</h1>
                <p className="text-muted-foreground">This is your personal dashboard. Here you can find your saved items.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Bookmarks</CardTitle>
                    <CardDescription>All your saved posts and comparisons in one place.</CardDescription>
                </CardHeader>
                <CardContent>
                    {hasBookmarks ? (
                        <Tabs defaultValue={activeTab}>
                            <TabsList>
                                <TabsTrigger value="posts" disabled={posts.length === 0} asChild>
                                    <Link href="?view=posts" scroll={false}><BookText className="mr-2 h-4 w-4" /> Posts ({posts.length})</Link>
                                </TabsTrigger>
                                <TabsTrigger value="comparisons" disabled={comparisons.length === 0} asChild>
                                    <Link href="?view=comparisons" scroll={false}><GitCompareArrows className="mr-2 h-4 w-4" /> Comparisons ({comparisons.length})</Link>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="posts">
                                {posts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                        {posts.map(bookmark => (
                                            <PostBookmarkCard key={bookmark.id} post={bookmark.post} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>You haven't bookmarked any posts yet.</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="comparisons">
                                {comparisons.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                                        {comparisons.map(bookmark => (
                                            <ComparisonBookmarkCard key={bookmark.id} comparison={bookmark.comparison} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>You haven't bookmarked any comparisons yet.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-headline mb-2">No Bookmarks Yet</h3>
                            <p className="mb-4">Start exploring and bookmark content you find useful!</p>
                            <div className="flex justify-center gap-4">
                                <Button asChild variant="secondary">
                                    <Link href="/blog">Explore Blog</Link>
                                </Button>
                                <Button asChild variant="secondary">
                                    <Link href="/compare">Explore Comparisons</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
