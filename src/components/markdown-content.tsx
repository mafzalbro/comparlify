'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BlogPreviewCard } from './blog-preview-card';
import Link from 'next/link';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn('prose dark:prose-invert max-w-none', className)}
      components={{
        h2: ({ node, ...props }) => <h2 className="font-headline text-3xl font-bold mt-12 mb-4 border-b pb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="font-headline text-2xl font-bold mt-8 mb-4" {...props} />,
        p: ({ node, ...props }) => <p className="leading-7 my-4" {...props} />,
        a: ({ node, href, ...props }) => {
          if (href && href.startsWith('/blog/')) {
            const slug = href.split('/blog/')[1];
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <Link href={href} className="text-primary hover:underline font-medium" {...props} />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <BlogPreviewCard slug={slug} />
                </PopoverContent>
              </Popover>
            );
          }
          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" {...props} />;
        },
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/20 pl-4 italic my-6 text-muted-foreground" {...props} />,
        code: ({ node, inlist, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inlist ? (
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
              <code className={cn('text-sm', className)} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)} {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
