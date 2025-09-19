
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
import { CoursePrerequisitesForm } from '@/components/course-prerequisites-form';
import { ContentRepurposerForm } from '@/components/content-repurposer-form';
import { IceBreakerForm } from '@/components/ice-breaker-form';
import { PromoVideoIdeasForm } from '@/components/promo-video-ideas-form';
import { AIGenericForm } from '@/components/ai-generic-form';

const toolComponents: Record<string, React.ComponentType<any>> = {
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
    'course-prerequisites-generator': CoursePrerequisitesForm,
    'content-repurposer': ContentRepurposerForm,
    'ice-breaker-generator': IceBreakerForm,
    'promotional-video-ideas-generator': PromoVideoIdeasForm,
    // New tools using the generic form
    'seo-keyword-generator': AIGenericForm,
    'blog-post-idea-generator': AIGenericForm,
    'course-elevator-pitch-generator': AIGenericForm,
    'course-landing-page-copywriter': AIGenericForm,
    'lesson-hook-generator': AIGenericForm,
    'interactive-scenario-generator': AIGenericForm,
    'explainer-video-script-generator': AIGenericForm,
    'gamification-idea-generator': AIGenericForm,
    'student-feedback-analyzer': AIGenericForm,
    'course-naming-brainstormer': AIGenericForm,
};

export function ToolsClientPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTool, setActiveTool] = useState(allTools[0]);

    const ToolComponent = toolComponents[activeTool.slug] || (() => <div>Tool not found</div>);

    const allCategories: ToolCategory[] = ["All", ...categories];

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
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
                    {allCategories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
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
                                    <ToolComponent tool={activeTool} />
                                </div>
                            </div>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
