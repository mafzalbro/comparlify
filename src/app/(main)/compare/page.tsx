import Link from 'next/link';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Platform Comparisons',
  description:
    "In-depth, side-by-side comparisons of the top course creation platforms. Find the perfect fit for your business.",
  path: '/compare',
});

async function getComparisons() {
  const comparisons = await prisma.comparison.findMany({
    where: { published: true },
    include: {
      platformA: true,
      platformB: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return comparisons;
}

export default async function ComparePage() {
  const comparisons = await getComparisons();

  return (
    <div className="bg-background">
      <div className="container py-16 md:py-24 px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Course Platform Face-Off
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            We've put the top platforms head-to-head. Get unbiased, in-depth
            analysis to make the right choice.
          </p>
        </div>

        {comparisons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No comparisons published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisons.map((comp) => (
              <Card
                key={comp.id}
                className="flex flex-col group overflow-hidden transition-shadow hover:shadow-xl"
              >
                <CardHeader>
                  <div className="relative h-24">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                      <Image
                        src={comp.platformA.logoUrl}
                        alt={`${comp.platformA.name} logo`}
                        width={140}
                        height={40}
                        className="object-contain transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                      <Image
                        src={comp.platformB.logoUrl}
                        alt={`${comp.platformB.name} logo`}
                        width={140}
                        height={40}
                        className="object-contain transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-background text-muted-foreground rounded-full p-2 border shadow-inner">
                            <span className='font-mono text-sm'>VS</span>
                        </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <h2 className="font-headline text-2xl text-center text-foreground">
                    <Link href={`/compare/${comp.slug}`} className="hover:text-primary transition-colors">
                        {comp.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground text-sm text-center">
                    {comp.summary}
                  </p>
                   <div className="flex justify-around pt-2">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 font-bold text-lg text-amber-500">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-500" /> {comp.platformA.rating?.toFixed(1) ?? 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">{comp.platformA.name}</p>
                        </div>
                         <div className="text-center">
                             <div className="flex items-center justify-center gap-1 font-bold text-lg text-amber-500">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-500" /> {comp.platformB.rating?.toFixed(1) ?? 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">{comp.platformB.name}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                    <Link href={`/compare/${comp.slug}`}>
                      View Comparison{' '}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
