
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { cache } from 'react';
import { Breadcrumbs } from '@/components/breadcrumb';
import { format } from 'date-fns';
import { MarkdownContent } from '@/components/markdown-content';
import prisma from '@/lib/prisma';
import { SiteContent } from '@prisma/client';

export async function generateStaticParams() {
    const docs = await prisma.siteContent.findMany({
      where: { group: 'Legal Pages' },
      select: { key: true }
    });
    return docs.map(doc => ({
      slug: doc.key.replace('legal.', ''),
    }));
}

const getDocument = cache(async (slug: string): Promise<SiteContent | null> => {
    const key = `legal.${slug}`;
    const doc = await prisma.siteContent.findUnique({ where: { key } });
    if (!doc) return null;
    return doc;
});

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const doc = await getDocument(params.slug);
    if (!doc) return {};

    // Create a more generic title from the key
    const title = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return generateSeoMetadata({
      title: title,
      description: doc.value.substring(0, 160),
      path: `/legal/${params.slug}`
    });
}

export default async function LegalDocumentPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const doc = await getDocument(params.slug);

    if (!doc) {
        notFound();
    }

    const title = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="container max-w-4xl py-16">
            <Breadcrumbs
                items={[
                    { name: "Home", href: "/" },
                    { name: title }
                ]}
                className="mb-8"
            />
             <div className="text-center mb-12">
                <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
                    {title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Last updated: {format(new Date(doc.updatedAt), 'MMMM d, yyyy')}
                </p>
            </div>
            <div className="prose dark:prose-invert mx-auto">
                <MarkdownContent content={doc.value} />
            </div>
        </div>
    );
}
