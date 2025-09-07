'use client'

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  level: number;
  text: string;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("h2, h3")
    );

    const extractedHeadings = headingElements.map(heading => {
      const id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      if(!heading.id) {
          heading.id = id;
      }
      return {
        id,
        level: Number(heading.tagName.substring(1)),
        text: heading.textContent || ''
      };
    });
    setHeadings(extractedHeadings);
    
    observer.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveId(entry.target.id);
            }
        });
    }, { rootMargin: "0px 0px -80% 0px" });

    headingElements.forEach(heading => {
        if (observer.current) {
            observer.current.observe(heading);
        }
    });

    return () => {
        headingElements.forEach(heading => {
            if (observer.current) {
                observer.current.unobserve(heading);
            }
        });
    }

  }, [content]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-headline text-xl font-semibold">Table of Contents</h3>
      <ul className="space-y-2 text-sm">
        {headings.map(heading => (
          <li key={heading.id}
              className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  heading.level === 3 && "pl-4",
                  activeId === heading.id && "text-primary font-medium"
              )}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
