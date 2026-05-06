"use client";

import { MarkdownContent } from "@/components/markdown-content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MotionDiv } from "@/components/motion-wrapper";

interface Section {
  title: string;
  content: string;
}

interface BlogIntelligentLayoutProps {
  content: string;
}

export function BlogIntelligentLayout({ content }: BlogIntelligentLayoutProps) {
  // Simple heuristic: Split by H2 headers if content is very long
  const sections: Section[] = [];
  const parts = content.split(/^##\s+/m);

  const intro = parts[0];

  for (let i = 1; i < parts.length; i++) {
    const lines = parts[i].split("\n");
    const title = lines[0].trim();
    const sectionContent = lines.slice(1).join("\n").trim();
    sections.push({ title, content: sectionContent });
  }

  // If content is short or doesn't have H2s, just render normally
  if (content.length < 5000 || sections.length < 3) {
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <MarkdownContent content={content} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <MarkdownContent content={intro} />
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {sections.map((section, index) => (
          <AccordionItem
            key={index}
            value={`section-${index}`}
            className="border border-border/40 rounded-3xl px-6 bg-card/30 backdrop-blur-sm overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-6">
              <span className="text-xl md:text-2xl font-black text-foreground text-left leading-tight uppercase tracking-tight">
                {section.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-8 prose prose-lg dark:prose-invert max-w-none">
              <MarkdownContent content={section.content} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
