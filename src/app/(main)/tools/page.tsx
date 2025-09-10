
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Lightbulb,
  FileText,
  Video,
  BookOpen,
  type LucideIcon,
  HelpCircle,
  Users,
  MessageSquareQuote,
  GraduationCap,
  Sparkles,
  Mail,
  Share2,
  ListChecks,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumb';

export const metadata: Metadata = generateSeoMetadata({
  title: 'AI Creator Tools',
  description: 'A suite of intelligent tools designed to streamline your course creation workflow, from outlining content to marketing.',
  path: '/tools'
});

type ToolCategory = 'Content Creation' | 'Marketing' | 'Productivity' | 'Engagement' | 'Curriculum Design';

type Tool = {
  slug: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  category: ToolCategory;
  href: string;
};

const allTools: Tool[] = [
  {
    slug: 'title-generator',
    title: 'AI Title Generator',
    description: 'Craft catchy, SEO-friendly titles for your course to attract more students.',
    Icon: Lightbulb,
    category: 'Marketing',
    href: '/tools/title-generator',
  },
  {
    slug: 'course-outliner',
    title: 'AI Course Outliner',
    description: 'Generate a comprehensive, structured outline for your course in minutes.',
    Icon: FileText,
    category: 'Curriculum Design',
    href: '/tools/course-outliner',
  },
  {
    slug: 'video-scripter',
    title: 'AI Video Script Assistant',
    description: 'Create engaging scripts for your video lessons that keep students hooked.',
    Icon: Video,
    category: 'Content Creation',
    href: '/tools/video-scripter',
  },
  {
    slug: 'lesson-summarizer',
    title: 'AI Lesson Summarizer',
    description: 'Automatically generate key takeaways and summaries for each of your lessons.',
    Icon: BookOpen,
    category: 'Productivity',
    href: '/tools/lesson-summarizer',
  },
  {
    slug: 'quiz-generator',
    title: 'AI Quiz Generator',
    description: 'Create multiple-choice quizzes from your course content to test student knowledge.',
    Icon: HelpCircle,
    category: 'Content Creation',
    href: '/tools/quiz-generator',
  },
  {
    slug: 'audience-persona-generator',
    title: 'AI Audience Persona Generator',
    description: 'Develop detailed personas of your target audience to tailor your content.',
    Icon: Users,
    category: 'Marketing',
    href: '/tools/audience-persona-generator',
  },
  {
    slug: 'course-description-writer',
    title: 'AI Course Description Writer',
    description: 'Write compelling, persuasive descriptions for your course sales page.',
    Icon: MessageSquareQuote,
    category: 'Marketing',
    href: '/tools/course-description-writer',
  },
  {
    slug: 'learning-objectives-generator',
    title: 'AI Learning Objectives Generator',
    description: 'Clearly define what students will be able to do after completing your course.',
    Icon: GraduationCap,
    category: 'Curriculum Design',
    href: '/tools/learning-objectives-generator',
  },
  {
    slug: 'email-subject-line-generator',
    title: 'AI Email Subject Line Generator',
    description: 'Craft attention-grabbing email subject lines for your marketing campaigns.',
    Icon: Mail,
    category: 'Marketing',
    href: '/tools/email-subject-line-generator',
  },
  {
    slug: 'social-media-post-generator',
    title: 'AI Social Media Post Generator',
    description: 'Quickly generate posts for platforms like Twitter, LinkedIn, and Facebook to promote your course.',
    Icon: Share2,
    category: 'Marketing',
    href: '/tools/social-media-post-generator',
  },
  {
    slug: 'faq-generator',
    title: 'AI FAQ Generator',
    description: 'Generate a list of frequently asked questions and answers from your course content.',
    Icon: ListChecks,
    category: 'Productivity',
    href: '/tools/faq-generator',
  },
  {
    slug: 'analogy-generator',
    title: 'AI Analogy Generator',
    description: 'Explain complex topics with simple, easy-to-understand analogies.',
    Icon: Sparkles,
    category: 'Content Creation',
    href: '/tools/analogy-generator',
  },
];

const categories: ToolCategory[] = [
  'Content Creation',
  'Marketing',
  'Curriculum Design',
  'Productivity',
  'Engagement',
];

function CategoryButton({ category, selectedCategory }: { category: ToolCategory | 'All', selectedCategory: string }) {
  const isSelected = category.toLowerCase() === selectedCategory.toLowerCase();
  return (
    <Button asChild variant={isSelected ? 'default' : 'ghost'} className="rounded-md">
      <Link href={category === 'All' ? '/tools' : `/tools?category=${category}`} scroll={false}>{category}</Link>
    </Button>
  )
}

export default async function ToolsPage(props: { searchParams?: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const selectedCategory = searchParams?.category || 'All';

  const filteredTools =
    selectedCategory === 'All'
      ? allTools
      : allTools.filter((tool) => tool.category === selectedCategory);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AI Creator Tools',
    description: 'A suite of intelligent tools designed to streamline your course creation workflow, from outlining content to marketing.',
    itemListElement: allTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: tool.title,
        description: tool.description,
        url: `https://www.comparlify.com${tool.href}`, // Replace with actual domain
        provider: {
          '@type': 'Organization',
          name: 'Comparlify',
        },
      },
    })),
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-10 md:py-24 px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            AI-Powered Creator Tools
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            A suite of intelligent tools designed to streamline your workflow and amplify your success.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 bg-muted p-2 rounded-lg">
            <CategoryButton category="All" selectedCategory={selectedCategory} />
            {categories.map((category) => (
              <CategoryButton key={category} category={category} selectedCategory={selectedCategory} />
            ))}
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredTools.map((tool, index) => (
            <div key={tool.slug} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
              <Card className="flex flex-col h-full group overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 shadow-md hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <tool.Icon className="h-8 w-8 text-primary" />
                    </div>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                  <CardTitle className="font-headline text-2xl pt-4">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">{tool.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full group-hover:bg-primary/90 transition-colors" disabled={tool.href === '#'}>
                    <Link href={tool.href}>
                      {tool.href === '#' ? 'Coming Soon' : 'Launch Tool'}
                      {tool.href !== '#' && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
