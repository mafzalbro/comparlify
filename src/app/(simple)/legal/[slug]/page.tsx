
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { cache } from 'react';
import { Breadcrumbs } from '@/components/breadcrumb';
import { format } from 'date-fns';
import { MarkdownContent } from '@/components/markdown-content';
import { getContent } from '@/lib/content';
import prisma from '@/lib/prisma';

// This function tells Next.js which slugs to pre-render at build time.
export async function generateStaticParams() {
  const content = await getContent();
  const legalKeys = Object.keys(content).filter(key => key.startsWith('legal.'));
  return legalKeys.map(key => ({
    slug: key.replace('legal.', '')
  }));
}

const getDocument = cache(async (slug: string) => {
    const content = await getContent();
    const docContent = content[`legal.${slug}`];
    
    // We need a title for the page, so we'll derive it from the slug
    if (!docContent) return null;

    const title = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    return { title, content: docContent, slug };
});

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const doc = await getDocument(params.slug);
  if (!doc) return {};

  return generateSeoMetadata({
    title: doc.title,
    description: doc.content.substring(0, 160),
    path: `/legal/${doc.slug}`
  });
}

export default async function LegalDocumentPage({ params }: { params: { slug: string } }) {
    const doc = await getDocument(params.slug);

    if (!doc) {
        notFound();
    }

    return (
        <div className="container max-w-4xl py-16">
            <Breadcrumbs
                items={[
                    { name: "Home", href: "/" },
                    { name: doc.title }
                ]}
                className="mb-8"
            />
             <div className="text-center mb-12">
                <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
                    {doc.title}
                </h1>
                {/* Note: last updated time isn't stored for siteContent, so we'll omit it for now */}
            </div>
            <div className="prose dark:prose-invert mx-auto">
                <MarkdownContent content={doc.content} />
            </div>
        </div>
    );
}
