
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { cache } from 'react';
import { Breadcrumbs } from '@/components/breadcrumb';
import { TopicList } from '../../_components/topic-list';
import { auth } from '@/lib/auth';

const getCategory = cache(async (slug: string) => {
    return prisma.forumCategory.findUnique({
        where: { slug },
        include: {
            topics: {
                where: { status: 'APPROVED' },
                include: {
                    author: true,
                    _count: {
                        select: { posts: { where: { status: 'APPROVED' }}}
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
});

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const category = await getCategory(params.slug);
    if (!category) return {};

    return generateSeoMetadata({
        title: `${category.name} - Community`,
        description: category.description,
        path: `/community/category/${category.slug}`
    });
}


export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const [category, session] = await Promise.all([
      getCategory(params.slug),
      auth()
    ]);

    if (!category) {
      notFound();
    }

    return (
      <div className="container py-12">
          <Breadcrumbs 
              items={[
                  { name: 'Home', href: '/' },
                  { name: 'Community', href: '/community' },
                  { name: category.name }
              ]}
              className="mb-8"
          />

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
              <div>
                  <h1 className="text-4xl font-bold font-headline">{category.name}</h1>
                  <p className="text-muted-foreground mt-2">{category.description}</p>
              </div>
               <div className="flex-shrink-0">
                  <Button asChild disabled={!session?.user}>
                      <Link href={`/community/new-topic?category=${category.id}`}>New Topic</Link>
                  </Button>
                  {!session?.user && <p className="text-xs text-muted-foreground mt-2 text-right">You must be logged in to create a topic.</p>}
              </div>
          </div>

          <TopicList topics={category.topics} />
      </div>
    )
}
