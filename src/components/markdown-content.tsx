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
    <div className={cn("prose dark:prose-invert max-w-none underline-offset-4", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
});
