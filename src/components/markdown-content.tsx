"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import rehypeRaw from "rehype-raw";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent = React.memo(function MarkdownContent({
  content,
  className,
}: MarkdownContentProps) {
  const displayContent = useMemo(() => {
    if (!content) return "";

    if (content.trim().startsWith("{") && content.trim().endsWith("}")) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.generatedContent) return String(parsed.generatedContent);
        if (parsed.content) return String(parsed.content);
        if (parsed.text) return String(parsed.text);
      } catch (e) {
        // Fallback to raw string if parsing fails
      }
    }
    return content;
  }, [content]);

  return (
    <div
      className={cn(
        "premium-prose text-foreground/90 underline-offset-4 max-w-full overflow-hidden",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // --- HORIZONTAL RULE FIX ---
          hr: ({ node, ...props }) => (
            <hr className="my-10 border-t border-border/40 w-full" {...props} />
          ),

          // --- HEADINGS ---
          h1: ({ node, ...props }) => (
            <h1
              className="text-3xl font-extrabold text-foreground mt-8 mb-4 tracking-tight"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-2xl font-bold text-foreground mt-8 mb-4 tracking-tight"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xl font-bold text-foreground mt-6 mb-3"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-lg font-bold text-foreground mt-4 mb-2"
              {...props}
            />
          ),

          // --- TEXT ---
          p: ({ node, ...props }) => (
            <p className="leading-relaxed text-foreground/90 mb-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-foreground/90 mb-1" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary font-semibold hover:underline"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary/50 pl-4 italic text-foreground/80 my-4"
              {...props}
            />
          ),

          // --- TABLES ---
          table: ({ node, ...props }) => (
            <div className="w-full my-6 overflow-x-auto rounded-2xl border border-border/40 bg-card/40 shadow-xs overscroll-contain">
              <table
                className="w-full text-left text-xs sm:text-sm border-collapse min-w-125"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="bg-secondary/40 px-3.5 py-3 font-extrabold text-foreground border-b border-border/40 whitespace-nowrap text-xs uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-3.5 py-3 border-b border-border/20 text-foreground/80 font-medium whitespace-nowrap"
              {...props}
            />
          ),
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
});
