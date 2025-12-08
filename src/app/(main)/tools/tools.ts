import type { LucideIcon } from "lucide-react";
import type { ToolCategory } from "@prisma/client";
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
  Clapperboard,
  Key,
  FilePenLine,
  Presentation,
  Rocket,
  MessageCircleQuestion,
  LightbulbIcon,
  VideoIcon,
  Puzzle,
  ThumbsUp,
  BrainCog,
} from "lucide-react";

export { type Tool, type ToolCategory } from "@prisma/client";

export const iconMap: Record<string, LucideIcon> = {
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
  Clapperboard,
  Key,
  FilePenLine,
  Presentation,
  Rocket,
  MessageCircleQuestion,
  LightbulbIcon,
  VideoIcon,
  Puzzle,
  ThumbsUp,
  BrainCog,
};

export const availableIcons = Object.keys(iconMap);

export const categories: ToolCategory[] = [
  "ContentCreation",
  "Marketing",
  "CurriculumDesign",
  "SEO",
  "Productivity",
  "EngagementInteraction",
];

export const allTools: { href: string }[] = [
  {
    href: "/tools",
  },
];
