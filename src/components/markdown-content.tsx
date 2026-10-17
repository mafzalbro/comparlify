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
    
    // Safety: If AI leaked JSON-wrapped content, try to extract it
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
    <div className={cn("premium-prose underline-offset-4 max-w-full overflow-hidden", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          table: ({ node, ...props }) => (
            <div className="w-full my-6 overflow-x-auto rounded-2xl border border-border/40 bg-card/40 shadow-xs overscroll-contain">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-secondary/40 px-3.5 py-3 font-extrabold text-foreground border-b border-border/40 whitespace-nowrap text-xs uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-3 border-b border-border/20 text-muted-foreground font-medium whitespace-nowrap" {...props} />
          ),
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
});
