
'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { revalidateCacheAction } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Globe, BookOpen, GitCompareArrows, Newspaper, MessageSquare, Wand2 } from 'lucide-react';

type RevalidationPath = 'all' | 'blog' | 'compare' | 'news' | 'community' | 'tools';

export function CacheManagement() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleRevalidation = (path: RevalidationPath) => {
        startTransition(async () => {
            const result = await revalidateCacheAction(path);
            if (result.success) {
                toast({
                    title: 'Success!',
                    description: result.success,
                });
            } else if (result.error) {
                toast({
                    title: 'Error',
                    description: result.error,
                    variant: 'destructive',
                });
            }
        });
    };

    const revalidationItems = [
        { path: 'blog' as const, title: 'Blog Cache', description: 'Revalidate all blog posts and the main blog page.', Icon: BookOpen },
        { path: 'compare' as const, title: 'Comparisons Cache', description: 'Revalidate all comparison pages.', Icon: GitCompareArrows },
        { path: 'news' as const, title: 'News Cache', description: 'Revalidate all news articles and the main news page.', Icon: Newspaper },
        { path: 'community' as const, title: 'Community Cache', description: 'Revalidate all community pages and topics.', Icon: MessageSquare },
        { path: 'tools' as const, title: 'Tools Cache', description: 'Revalidate the AI tools page.', Icon: Wand2 },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cache Management</CardTitle>
                <CardDescription>
                    If you make changes to content and don't see them reflected on the live site, you can manually clear the cache here. This will force the server to fetch the latest content.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {revalidationItems.map(item => (
                    <div key={item.path} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2"><item.Icon className="h-4 w-4 text-muted-foreground" /> {item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Button variant="secondary" onClick={() => handleRevalidation(item.path)} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Revalidate
                        </Button>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between w-full">
                <div>
                        <h3 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /> Full Site Cache</h3>
                        <p className="text-sm text-muted-foreground">This is a heavy operation. Only use if needed.</p>
                    </div>
                    <Button variant="destructive" onClick={() => handleRevalidation('all')} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Revalidate Everything
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
