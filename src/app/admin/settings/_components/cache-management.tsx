"use client";

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
                    title: 'Sync Successful',
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
        { path: 'blog' as const, title: 'Editorial Archive', description: 'Revalidate all blog posts and insights.', Icon: BookOpen },
        { path: 'compare' as const, title: 'Comparison Data', description: 'Revalidate all platform showdowns.', Icon: GitCompareArrows },
        { path: 'news' as const, title: 'News Signals', description: 'Revalidate the live update feed.', Icon: Newspaper },
        { path: 'community' as const, title: 'Collective Network', description: 'Revalidate the forum topics.', Icon: MessageSquare },
        { path: 'tools' as const, title: 'AI Infrastructure', description: 'Revalidate the creator toolkit.', Icon: Wand2 },
    ];

    return (
        <Card className="rounded-[2.5rem] border-border/10 bg-card/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-border/5">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Signal <span className="text-primary italic">Revalidation</span></CardTitle>
                <CardDescription className="text-base font-medium">
                    Manually purge cached content to force a fresh data sync across the network.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
                {revalidationItems.map(item => (
                    <div key={item.path} className="flex items-center justify-between p-6 bg-background/40 border border-border/10 rounded-3xl hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <item.Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest">{item.title}</h3>
                                <p className="text-xs text-muted-foreground font-medium">{item.description}</p>
                            </div>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleRevalidation(item.path)} 
                          disabled={isPending}
                          className="rounded-xl px-6 h-10 font-black uppercase tracking-widest text-[9px]"
                        >
                            {isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                            Purge Cache
                        </Button>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="p-8 bg-primary/5 border-t border-border/5">
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-lg uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
                          <Globe className="h-5 w-5 text-primary" /> Full Global Flush
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium italic">Complete site-wide cache invalidation. Use for structural changes.</p>
                    </div>
                    <Button 
                        variant="destructive" 
                        onClick={() => handleRevalidation('all')} 
                        disabled={isPending}
                        className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-destructive/20"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Flush Entire Network
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
