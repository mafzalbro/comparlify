
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateSeoMetadata } from '@/lib/seo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumb';
import { MessageSquare, ChevronsRight } from 'lucide-react';
import { getContent } from '@/lib/content';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Community Forums',
  description: 'Join the conversation! Ask questions, share your knowledge, and connect with other course creators.',
  path: '/community',
});

async function getForumCategories() {
  return prisma.forumCategory.findMany({
    include: {
      topics: {
        where: { status: 'APPROVED' },
        select: { id: true, _count: { select: { posts: { where: { status: 'APPROVED' }}} } },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export default async function CommunityPage() {
  const [categories, content] = await Promise.all([getForumCategories(), getContent()]);

  if (content['module.community.enabled'] === 'false') {
    notFound();
  }

  return (
    <div className="bg-background">
      <section className="bg-secondary/30 border-b">
        <div className="container py-12 md:py-16 px-4 md:px-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Community' },
            ]}
            className="mb-8"
          />
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
              Community Forums
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Join the conversation, ask questions, and connect with fellow creators.
            </p>
          </div>
        </div>
      </section>
      <div className="container py-8 md:py-12 px-4 md:px-6">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-2xl font-headline mb-2">Forums Coming Soon</h3>
            <p>Our community forums are under construction. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const topicCount = category.topics.length;
              const postCount = category.topics.reduce((sum, topic) => sum + topic._count.posts + 1, 0);

              return (
              <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    <Link href={`/community/category/${category.slug}`} className="hover:text-primary transition-colors">
                      {category.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t bg-muted/50 p-4">
                  <div className="flex gap-4">
                    <span>{topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}</span>
                    <span>{postCount} {postCount === 1 ? 'Post' : 'Posts'}</span>
                  </div>
                  <Link href={`/community/category/${category.slug}`} className="flex items-center text-primary font-semibold hover:underline">
                    View Forum <ChevronsRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}

    