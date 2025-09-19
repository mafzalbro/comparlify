
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/breadcrumb';
import { getContent } from '@/lib/content';
import { MarkdownContent } from '@/components/markdown-content';

export default async function PrivacyPage() {
  const content = await getContent();
  const lastUpdated = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="container py-16 md:py-24 px-4 md:px-6 prose">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Privacy Policy' },
        ]}
        className="mb-8 not-prose"
      />
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert mx-auto text-foreground">
          <MarkdownContent content={content['privacy.policy']} className="h-auto" />
        </div>
      </div>
    </div>
  );
}
