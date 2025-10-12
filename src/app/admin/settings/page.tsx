
"use client"

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { revalidateCacheAction } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Globe, BookOpen, GitCompareArrows, Code } from 'lucide-react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ContentForm } from '../content/_components/content-form';
import { AdminSettings, getSettingsContent } from '@/app/actions/content';
import { Skeleton } from '@/components/ui/skeleton';


export default function AdminSettingsPage() {
    const [settingsContent, setSettingsContent] = useState<AdminSettings>()
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        getSettingsContent().then(content => {
            setSettingsContent(content);
        })
    }, []);

    const handleRevalidation = (path: 'all' | 'blog' | 'compare') => {
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
    
    const renderFormOrSkeleton = (groupName: string) => {
        if (!settingsContent) {
            return <Skeleton className="h-48 w-full" />;
        }
        return <ContentForm items={settingsContent?.[groupName] || []} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-6 h-auto flex-wrap justify-start">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="codeInjection">Code Injection</TabsTrigger>
                    <TabsTrigger value="cache">Cache</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Site Settings</CardTitle>
                            <CardDescription>
                                These settings apply across the entire website.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {renderFormOrSkeleton('Globals')}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="email">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Settings</CardTitle>
                            <CardDescription>
                                Configure the sender information for outgoing emails. These are used when sending newsletters.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {renderFormOrSkeleton('Email Settings')}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="codeInjection">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Code /> Code Injection</CardTitle>
                            <CardDescription>
                                Add custom code snippets to the &lt;head&gt; section of your site. Use this for analytics, tracking pixels, or other third-party scripts. Use with caution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderFormOrSkeleton('Code Injection')}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="cache">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cache Management</CardTitle>
                            <CardDescription>
                                If you make changes to content and don't see them reflected on the live site, you can manually clear the cache here. This will force the server to fetch the latest content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" /> Blog Cache</h3>
                                    <p className="text-sm text-muted-foreground">Revalidate all blog posts and the main blog page.</p>
                                </div>
                                <Button variant="secondary" onClick={() => handleRevalidation('blog')} disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Revalidate Blog
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2"><GitCompareArrows className="h-4 w-4 text-muted-foreground" /> Comparisons Cache</h3>
                                    <p className="text-sm text-muted-foreground">Revalidate all comparison pages.</p>
                                </div>
                                <Button variant="secondary" onClick={() => handleRevalidation('compare')} disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Revalidate Comparisons
                                </Button>
                            </div>
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
                </TabsContent>
            </Tabs>
        </div>
    )
}
