import type { LucideIcon } from 'lucide-react';
import {
  Lightbulb,
  FileText,
  Video,
  BookOpen,
  HelpCircle,
  Users,
  MessageSquareQuote,
  GraduationCap,
  Sparkles,
  Mail,
  Share2,
  ListChecks,
  ClipboardList,
  Recycle,
  MessageSquarePlus,
  Clapperboard
} from 'lucide-react';

export type ToolCategory = 'Content Creation' | 'Marketing' | 'Curriculum Design' | 'Productivity' | 'Engagement & Interaction';

export type Tool = {
  slug: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  category: ToolCategory;
  href: string;
};

export const allTools: Tool[] = [
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
    slug: 'course-prerequisites-generator',
    title: 'AI Prerequisite Generator',
    description: 'Outline the required skills and tools students need before starting your course.',
    Icon: ClipboardList,
    category: 'Curriculum Design',
    href: '/tools/course-prerequisites-generator',
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
   {
    slug: 'content-repurposer',
    title: 'AI Content Repurposer',
    description: 'Get ideas for turning your existing content (like a blog post) into multiple new formats.',
    Icon: Recycle,
    category: 'Productivity',
    href: '/tools/content-repurposer',
  },
  {
    slug: 'ice-breaker-generator',
    title: 'AI Ice Breaker Generator',
    description: 'Create engaging ice breaker questions for your community forum or live sessions.',
    Icon: MessageSquarePlus,
    category: 'Engagement & Interaction',
    href: '/tools/ice-breaker-generator',
  },
  {
    slug: 'promotional-video-ideas-generator',
    title: 'AI Promo Video Ideas Generator',
    description: 'Brainstorm creative concepts for short promotional videos (Reels, Shorts, etc.).',
    Icon: Clapperboard,
    category: 'Marketing',
    href: '/tools/promotional-video-ideas-generator',
  },
];

export const categories: ToolCategory[] = [
  'Content Creation',
  'Marketing',
  'Curriculum Design',
  'Productivity',
  'Engagement & Interaction',
];
