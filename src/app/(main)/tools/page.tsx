
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateSeoMetadata } from '@/lib/seo';
import { ToolsClientPage } from './_components/tools-client-page';
import { getContent } from '@/lib/content';

export const metadata: Metadata = generateSeoMetadata({
  title: 'AI Creator Tools',
  description: 'A suite of intelligent tools designed to streamline your course creation workflow, from outlining content to marketing.',
  path: '/tools'
});

export default async function ToolsPage() {
  const content = await getContent();
  if (content['module.tools.enabled'] === 'false') {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AI Creator Tools',
    description: 'A suite of intelligent tools designed to streamline your course creation workflow, from outlining content to marketing.',
    itemListElement: [
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolsClientPage />
    </>
  );
}

    