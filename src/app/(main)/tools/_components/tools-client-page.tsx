
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, Wand2 } from 'lucide-react';
import { type Tool, categories, type ToolCategory } from '../tools';
import { AIGenericForm } from '@/components/ai-generic-form';
import { Card } from '@/components/ui/card';
import { iconMap } from '../tools';

export function ToolsClientPage({ allTools }: { allTools: Tool[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    const allCategories: (ToolCategory | 'All')[] = ["All", ...categories];

    // Get active category from URL or default to 'All'
    const activeCategory = searchParams.get('category') || 'All';

    // Find the first tool in the filtered list or the first tool overall
    const getInitialTool = (category: ToolCategory | 'All') => {
        const filtered = allTools.filter(tool =>
            (category === "All" || tool.category === category) &&
            tool.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered.length > 0 ? filtered[0] : null;
    }
    
    const [activeTool, setActiveTool] = useState<Tool | null>(getInitialTool(activeCategory as ToolCategory | 'All'));

    const handleTabChange = (category: string) => {
        const firstToolInNewCategory = getInitialTool(category as ToolCategory | 'All');
        setActiveTool(firstToolInNewCategory);
        router.push(`/tools?category=${category}`, { scroll: false });
    };

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
                    AI-Powered Creator Tools
                </h1>
                <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                    A suite of intelligent tools designed to streamline your workflow and amplify your success.
                </p>
            </div>

            <Tabs value={activeCategory} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto">
                    {allCategories.map(category => (
                        <TabsTrigger key={category} value={category}>{category.replace(/([A-Z])/g, ' $1').trim()}</TabsTrigger>
                    ))}
                </TabsList>

                {allCategories.map(category => {
                    const filteredTools = allTools.filter(tool =>
                        (category === "All" || tool.category === category) &&
                        tool.title.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    return (
                        <TabsContent key={category} value={category}>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                                <div className="lg:col-span-1 lg:sticky lg:h-[80vh] lg:overflow-y-auto lg:top-24 self-start">
                                    <div className="relative mb-4">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search tools..."
                                            className="pl-10 h-11"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                // If current active tool is filtered out, reset to first in list
                                                const currentIsVisible = filteredTools.some(t => t.id === activeTool?.id);
                                                if (!currentIsVisible && filteredTools.length > 0) {
                                                    setActiveTool(filteredTools[0]);
                                                } else if (filteredTools.length === 0) {
                                                    setActiveTool(null);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        {filteredTools.length > 0 ? filteredTools.map(tool => (
                                            <button
                                                key={tool.slug}
                                                onClick={() => setActiveTool(tool)}
                                                className={`w-full text-left p-3 rounded-md transition-colors ${activeTool?.slug === tool.slug ? 'bg-primary/20' : 'hover:bg-muted'}`}
                                            >
                                                <div className="font-semibold">{tool.title}</div>
                                                <div className="text-xs text-muted-foreground">{tool.description}</div>
                                            </button>
                                        )) : (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                No tools found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    {activeTool ? (
                                        <>
                                            <div className="flex items-start gap-4 mb-8">
                                                <div className="p-3 bg-primary/20 rounded-lg">
                                                    {React.createElement(iconMap[activeTool.Icon] || Wand2, { className: "h-8 w-8 text-primary" })}
                                                </div>
                                                <div>
                                                    <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">{activeTool.title}</h2>
                                                    <p className="mt-1 text-lg text-muted-foreground">{activeTool.description}</p>
                                                </div>
                                            </div>
                                            <AIGenericForm key={activeTool.id} tool={activeTool} />
                                        </>
                                    ) : (
                                        <Card className="flex items-center justify-center h-full min-h-[300px] border-dashed">
                                            <div className="text-center text-muted-foreground">
                                                <Wand2 className="mx-auto h-12 w-12" />
                                                <h3 className="mt-4 text-lg font-semibold">Select a tool to get started</h3>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
