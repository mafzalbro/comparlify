
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon } from 'lucide-react';
import { allTools, categories, type ToolCategory } from '../tools';
import { TitleGeneratorForm } from '@/components/title-generator-form';
import { CourseOutlinerForm } from '@/components/course-outliner-form';
import { VideoScripterForm } from '@/components/video-scripter-form';
import { LessonSummarizerForm } from '@/components/lesson-summarizer-form';
import { QuizGeneratorForm } from '@/components/quiz-generator-form';
import { AudiencePersonaGeneratorForm } from '@/components/audience-persona-generator-form';
import { CourseDescriptionWriterForm } from '@/components/course-description-writer-form';
import { LearningObjectivesGeneratorForm } from '@/components/learning-objectives-generator-form';
import { EmailSubjectLineGeneratorForm } from '@/components/email-subject-line-generator-form';
import { SocialMediaPostGeneratorForm } from '@/components/social-media-post-generator-form';
import { FaqGeneratorForm } from '@/components/faq-generator-form';
import { AnalogyGeneratorForm } from '@/components/analogy-generator-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const toolComponents: Record<string, React.ComponentType> = {
    'title-generator': TitleGeneratorForm,
    'course-outliner': CourseOutlinerForm,
    'video-scripter': VideoScripterForm,
    'lesson-summarizer': LessonSummarizerForm,
    'quiz-generator': QuizGeneratorForm,
    'audience-persona-generator': AudiencePersonaGeneratorForm,
    'course-description-writer': CourseDescriptionWriterForm,
    'learning-objectives-generator': LearningObjectivesGeneratorForm,
    'email-subject-line-generator': EmailSubjectLineGeneratorForm,
    'social-media-post-generator': SocialMediaPostGeneratorForm,
    'faq-generator': FaqGeneratorForm,
    'analogy-generator': AnalogyGeneratorForm,
};

const ComingSoonTool = () => (
    <Card>
        <CardHeader>
            <CardTitle>Coming Soon!</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This tool is currently under development. Check back soon!</p>
        </CardContent>
    </Card>
);

export function ToolsClientPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTool, setActiveTool] = useState(allTools[0]);

    const ToolComponent = toolComponents[activeTool.slug] || ComingSoonTool;

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

            <Tabs defaultValue="Content Creation" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-auto">
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                </TabsList>

                {categories.map(category => {
                    const filteredTools = allTools.filter(tool =>
                        tool.category === category &&
                        tool.title.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    return (
                        <TabsContent key={category} value={category}>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                                <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
                                    <div className="relative mb-4">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search tools..."
                                            className="pl-10 h-11"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        {filteredTools.length > 0 ? filteredTools.map(tool => (
                                            <button
                                                key={tool.slug}
                                                onClick={() => setActiveTool(tool)}
                                                className={`w-full text-left p-3 rounded-md transition-colors ${activeTool.slug === tool.slug ? 'bg-primary/20 text-primary-foreground' : 'hover:bg-muted'}`}
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
                                    <div className="flex items-start gap-4 mb-8">
                                        <div className="p-3 bg-primary/20 rounded-lg">
                                            <activeTool.Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">{activeTool.title}</h2>
                                            <p className="mt-1 text-lg text-muted-foreground">{activeTool.description}</p>
                                        </div>
                                    </div>
                                    <ToolComponent />
                                </div>
                            </div>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
