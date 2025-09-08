
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Search } from 'lucide-react';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { Comparison, Platform } from '@prisma/client';
import { ManagedImage } from '@/components/managed-image';
import { cache } from 'react';

type ComparisonWithPlatforms = Comparison & { platformA: Platform, platformB: Platform };

export const metadata: Metadata = generateSeoMetadata({
  title: 'Platform Comparisons',
  description:
    'In-depth, side-by-side comparisons of the top course creation platforms. Find the perfect fit for your business.',
  path: '/compare',
});

const getComparisons = cache(async ({
  search,
  sort,
  platforms,
}: {
  search?: string;
  sort?: string;
  platforms?: string[];
}) => {
  let where: any = { published: true };
  let orderBy: any = { createdAt: 'desc' };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (sort === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (sort === 'rating') {
    // This is a simplified rating sort. A real-world implementation might be more complex.
    orderBy = [
      { platformA: { rating: 'desc' } },
      { platformB: { rating: 'desc' } },
    ];
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


export default async function ComparePage({ searchParams }: { searchParams: Promise<{ search?: string; sort?: string; platforms?: string | string[] }> }) {
  const { search, sort } = await searchParams;
  const platforms = Array.isArray((await searchParams).platforms) ? (await searchParams).platforms : ((await searchParams).platforms ? [(await searchParams).platforms] : []);

  const [comparisons, allPlatforms] = await Promise.all([
    getComparisons({ search, sort, platforms }),
    getAllPlatforms()
  ]);

  return (
    <div className="bg-background">
       <section className="bg-secondary/30 border-b">
        <div className="container text-center py-16 md:py-24 px-4 md:px-6">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Course Platform Face-Off
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            We've put the top platforms head-to-head. Get unbiased, in-depth
            analysis to make the right choice.
          </p>
        </div>
      </section>

      <div className="container py-16 md:py-24 px-4 md:px-6">
        <Card className="mb-12 p-4 md:p-6 shadow-lg bg-card/60 border">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto] gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="search">Search Comparisons</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="search"
                    name="search"
                    placeholder="Search by keyword (e.g. Teachable...)"
                    className="pl-10"
                    defaultValue={search}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                <Select name="sort" defaultValue={sort ?? 'newest'}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="flex items-end gap-2">
                <Button type="submit" className="w-full">Apply</Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/compare">Reset</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <Label className="block font-medium">Filter by Platform</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-3">
                {allPlatforms.map(platform => (
                  <div key={platform.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`platform-${platform.id}`}
                      name="platforms"
                      value={platform.id}
                      defaultChecked={(platforms || "")?.includes(platform.id)}
                    />
                    <Label htmlFor={`platform-${platform.id}`} className="font-normal text-sm cursor-pointer">{platform.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </Card>

        {comparisons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground animate-fade-in-up">
            <h3 className="text-2xl font-headline mb-2">No Comparisons Found</h3>
            <p>Try adjusting your search or filters. Or check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisons.map((comp, index) => (
              <div key={comp.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                <Card
                  className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                >
                  <CardHeader className="p-6">
                    <div className="relative h-20">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                        <ManagedImage
                          src={comp.platformA.logoUrl}
                          alt={`${comp.platformA.name} logo`}
                          width={140}
                          height={40}
                          className="object-contain transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                        <ManagedImage
                          src={comp.platformB.logoUrl}
                          alt={`${comp.platformB.name} logo`}
                          width={140}
                          height={40}
                          className="object-contain transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-background text-muted-foreground rounded-full p-2 border shadow-inner">
                          <span className="font-mono text-sm">VS</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 px-6 pb-4 space-y-4">
                    <h2 className="font-headline text-2xl text-center text-foreground h-20 line-clamp-3">
                      <Link
                        href={`/compare/${comp.slug}`}
                        className="hover:text-primary transition-colors stretched-link"
                      >
                        {comp.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground text-sm text-center h-12 line-clamp-3">
                      {comp.summary}
                    </p>
                    <div className="flex justify-around pt-4 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-lg text-amber-500">
                          <Star className="w-5 h-5 fill-amber-400 text-amber-500" />{' '}
                          {comp.platformA.rating?.toFixed(1) ?? 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {comp.platformA.name}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-lg text-amber-500">
                          <Star className="w-5 h-5 fill-amber-400 text-amber-500" />{' '}
                          {comp.platformB.rating?.toFixed(1) ?? 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {comp.platformB.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 bg-secondary/30">
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
