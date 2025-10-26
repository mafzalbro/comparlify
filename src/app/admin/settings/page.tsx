
'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { revalidateCacheAction } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { Code, Database, Search, Palette, Building } from 'lucide-react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ContentForm } from '../content/_components/content-form';
import { AdminSettings, getSettingsContent } from '@/app/actions/content';
import { Skeleton } from '@/components/ui/skeleton';
import { DataManagement } from './_components/data-management';
import { ThemeEditor } from './_components/theme-editor';
import { CacheManagement } from './_components/cache-management';


export default function AdminSettingsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [settingsContent, setSettingsContent] = useState<AdminSettings>()
    const { toast } = useToast();
    
    useEffect(() => {
        getSettingsContent().then(content => {
            setSettingsContent(content);
        })
    }, []);

    const groups = settingsContent ? Object.keys(settingsContent).sort() : [];
    const activeTab = searchParams.get('group') || 'general';

    const handleTabChange = (value: string) => {
        router.push(`${pathname}?group=${value}`, { scroll: false });
    };

    const handleFormSuccess = () => {
        // Just refresh the server components. The form will get the new data.
        router.refresh(); 
    }
    
    const renderFormOrSkeleton = (groupName: string) => {
        if (!settingsContent) {
            return <Skeleton className="h-48 w-full" />;
        }
        return <ContentForm items={settingsContent?.[groupName] || []} onFormSuccess={handleFormSuccess} />;
    }

    const renderThemeFormOrSkeleton = () => {
        if (!settingsContent) {
            return <Skeleton className="h-48 w-full" />;
        }
        return <ThemeEditor themeContent={settingsContent?.['Theme'] || []} onFormSuccess={handleFormSuccess} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="mb-6 h-auto flex-wrap justify-start">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="theme">Theme</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="codeInjection">Code Injection</TabsTrigger>
                    <TabsTrigger value="cache">Cache</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
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
                <TabsContent value="theme">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Palette /> Theme Customizer</CardTitle>
                            <CardDescription>
                                Change the color scheme of your site. HSL (Hue, Saturation, Lightness) values are used.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {renderThemeFormOrSkeleton()}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="seo" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Search /> Default Metadata</CardTitle>
                            <CardDescription>
                                Configure default metadata for search engine optimization. These can be overridden on individual pages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {renderFormOrSkeleton('SEO Settings')}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building /> Organization Schema</CardTitle>
                            <CardDescription>
                                Configure structured data for your organization to improve how search engines understand your brand.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {renderFormOrSkeleton('Organization Settings')}
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
                                Add custom code snippets. Use this for analytics, tracking pixels, or other third-party scripts. Use with caution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderFormOrSkeleton('Code Injection')}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="cache">
                    <CacheManagement />
                </TabsContent>
                 <TabsContent value="data">
                    <DataManagement />
                 </TabsContent>
            </Tabs>
        </div>
    )
}
