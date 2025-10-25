
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import type { Comparison, Platform, ComparisonCategory } from '@prisma/client';
import { ManagedImage } from '@/components/managed-image';
import { cache } from 'react';
import type { SearchParams } from '@/types/next';
import { Breadcrumbs } from '@/components/breadcrumb';
import { FilterControls } from './_components/filter-controls';
import { getContent } from '@/lib/content';

type ComparisonWithPlatforms = Comparison & { platformA: Platform, platformB: Platform };

export const metadata: Metadata = await generateSeoMetadata({
  title: 'Platform Comparisons',
  description:
    'In-depth, side-by-side comparisons of the top course creation platforms. Find the perfect fit for your business.',
  path: '/compare',
});

const getComparisons = cache(async ({
  search,
  sort,
  platforms,
  category,
}: {
  search?: string;
  sort?: string;
  platforms?: string[];
  category?: string;
}) => {
  let where: any = { published: true };
  let orderBy: any = { createdAt: 'desc' };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
      { platformA: { name: { contains: search } } },
      { platformB: { name: { contains: search } } },
    ];
  }

  if (category && category !== 'all') {
    where.categoryId = category;
  }

  if (sort === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (sort === 'rating') {
    // This is a simplified rating sort. A more complex one might average platform ratings.
    orderBy = { platformA: { rating: 'desc' } };
  }

  if (platforms && platforms.length > 0) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { platformAId: { in: platforms } },
          { platformBId: { in: platforms } },
        ],
      },
    ];
  }

  const comparisons: ComparisonWithPlatforms[] = await prisma.comparison.findMany({
    where,
    include: {
      platformA: true,
      platformB: true,
    },
    orderBy,
  });
  return comparisons;
});

const getAllPlatforms = cache(async () => {
  return prisma.platform.findMany({ orderBy: { name: 'asc' } });
});

const getComparisonCategories = cache(async () => {
  return prisma.comparisonCategory.findMany({ orderBy: { name: 'asc' } });
});


export default async function ComparePage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = (await props.searchParams);
  const { search, sort, category } = searchParams;
  const platformsParam = searchParams.platforms;
  const selectedPlatforms = Array.isArray(platformsParam) ? platformsParam : (platformsParam ? [platformsParam] : []);

  const [comparisons, allPlatforms, categories, content] = await Promise.all([
    getComparisons({ search: String(search ?? ''), sort: String(sort ?? 'newest'), platforms: selectedPlatforms, category: String(category ?? 'all') }),
    getAllPlatforms(),
    getComparisonCategories(),
    getContent()
  ]);

  if (content['module.compare.enabled'] === 'false') {
    notFound();
  }

  return (
    <div className="bg-background">
      <section className="bg-secondary/30 border-b">
        <div className="container text-center py-8 md:py-12 px-4 md:px-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Compare' },
            ]}
            className="mb-8 justify-center"
          />
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            {content['compare.hero.title']}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            {content['compare.hero.subtitle']}
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-4 md:px-6">
        <FilterControls allPlatforms={allPlatforms} categories={categories} searchParams={searchParams} />

        {comparisons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground animate-fade-in-up">
            <h3 className="text-2xl font-headline mb-2">{content['compare.empty.title']}</h3>
            <p>{content['compare.empty.subtitle']}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisons.map((comp, index) => (
              <div key={comp.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                <Card
                  className="flex flex-col group overflow-hidden transition-all duration-300 h-full border hover:border-primary/50 hover:shadow-lg rounded-xl"
                >
                  <CardHeader className="p-6">
                    <div className="flex justify-around items-center h-10">
                      <div className="w-2/5 flex justify-center">
                        <ManagedImage
                          src={comp.platformA.logoUrl}
                          alt={`${comp.platformA.name} logo`}
                          width={140}
                          height={40}
                          className="object-contain h-8 w-auto transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="w-1/5 flex justify-center">
                        <span className="font-mono text-sm text-muted-foreground">VS</span>
                      </div>
                      <div className="w-2/5 flex justify-center">
                        <ManagedImage
                          src={comp.platformB.logoUrl}
                          alt={`${comp.platformB.name} logo`}
                          width={140}
                          height={40}
                          className="object-contain h-8 w-auto transition-transform group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 px-6 pb-6 space-y-3 text-center">
                    <h2 className="font-headline text-xl text-foreground">
                      <Link
                        href={`/compare/${comp.slug}`}
                        className="hover:text-primary transition-colors stretched-link"
                      >
                        {comp.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {comp.summary}
                    </p>
                    <div className="flex justify-around pt-3 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-lg text-amber-500">
                          <Star className="w-4 h-4 fill-current text-current" />{' '}
                          {comp.platformA.rating?.toFixed(1) ?? 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {comp.platformA.name}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-lg text-amber-500">
                          <Star className="w-4 h-4 fill-current text-current" />{' '}
                          {comp.platformB.rating?.toFixed(1) ?? 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {comp.platformB.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 bg-muted/50">
                    <Button
                      asChild
                      className="w-full"
                      variant="ghost"
                    >
                      <Link href={`/compare/${comp.slug}`}>
                        View Comparison{' '}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

    