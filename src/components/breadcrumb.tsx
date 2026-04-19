import React, { useMemo, memo } from 'react';
import Link from "next/link";
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type BreadcrumbItem = {
  name: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = memo(function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const siteUrl = 'https://www.comparlify.com'; // Replace with your actual domain

  const breadcrumbSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href ? `${siteUrl}${item.href}` : undefined,
    })),
  }), [items, siteUrl]);

  return (
    <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <nav aria-label="Breadcrumb" className={cn('container', className)}>
        <ol className="flex items-center gap-1.5 wrap-break-word text-sm text-muted-foreground sm:gap-2.5">
            {items.map((item, index) => (
            <li key={index} className="inline-flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                {item.href ? (
                <Link
                    href={item.href}
                    className="hover:text-primary transition-colors"
                >
                    {item.name}
                </Link>
                ) : (
                <span className="font-medium text-foreground">{item.name}</span>
                )}
            </li>
            ))}
        </ol>
        </nav>
    </>
  );
});
