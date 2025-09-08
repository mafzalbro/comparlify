
'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { BlogPreviewCard } from './blog-preview-card';
import Link from 'next/link';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {

  // A custom renderer for headings to add IDs
  const renderHeading = (props: any) => {
    const { level, children } = props;
    const text = React.Children.toArray(children).join('');
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    return <HeadingTag id={id} {...props}>{children}</HeadingTag>;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn('prose dark:prose-invert max-w-none', className)}
      components={{
        h2: (props) => renderHeading({...props, level: 2}),
        h3: (props) => renderHeading({...props, level: 3}),
        p: ({ node, ...props }) => <p className="leading-7 my-4" {...props} />,
        a: ({ node, href, ...props }) => {
          // Check for internal blog post links, but exclude external links
          const isInternalBlogLink = href && href.startsWith('/blog/') && !/^(https?:\/\/)/.test(href);

          if (isInternalBlogLink) {
            const slug = href.split('/blog/')[1];
            return (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Link href={href} className="text-primary hover:underline font-medium" {...props} />
                </HoverCardTrigger>
                <HoverCardContent className="w-80" side="top">
                  <BlogPreviewCard slug={slug} />
                </HoverCardContent>
              </HoverCard>
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
