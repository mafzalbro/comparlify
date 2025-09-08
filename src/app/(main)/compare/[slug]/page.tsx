
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { Star, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { MarkdownContent } from '@/components/markdown-content';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { ComparisonChart } from '@/components/comparison-chart';
import { ManagedImage } from '@/components/managed-image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


async function getComparisonBySlug(slug: string) {
  const comparison = await prisma.comparison.findUnique({
    where: { slug, published: true },
    include: {
      platformA: { include: { features: { include: { feature: { include: { category: true } } } } } },
      platformB: { include: { features: { include: { feature: { include: { category: true } } } } } },
      facts: true,
      faqs: true,
    },
  });
  return comparison;
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const comparison = await getComparisonBySlug(params.slug);

    if (!comparison) {
      return {};
    }

    return generateSeoMetadata({
      title: comparison.title,
      description: comparison.summary,
      path: `/compare/${comparison.slug}`,
    });
}

export async function generateStaticParams() {
    const comparisons = await prisma.comparison.findMany({ where: { published: true } });
    return comparisons.map((comp) => ({
      slug: comp.slug,
    }));
}


export default async function ComparisonDetailPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const comparison = await getComparisonBySlug(params.slug);

    if (!comparison) {
      notFound();
    }

    const { platformA, platformB } = comparison;

    const allFeatures = await prisma.feature.findMany({ include: { category: true }});
    const allCategories = await prisma.featureCategory.findMany({ orderBy: { name: 'asc' }});

    const getFeature = (platform: typeof platformA, featureId: string) => {
        return platform.features.find(f => f.featureId === featureId);
    }

    const chartData = [
      { name: 'Overall Rating', [platformA.name]: platformA.rating ?? 0, [platformB.name]: platformB.rating ?? 0 },
      { name: 'Ease of Use', [platformA.name]: platformA.easeOfUse ?? 0, [platformB.name]: platformB.easeOfUse ?? 0 },
      { name: 'Features', [platformA.name]: platformA.featuresRating ?? 0, [platformB.name]: platformB.featuresRating ?? 0 },
      { name: 'Support', [platformA.name]: platformA.support ?? 0, [platformB.name]: platformB.support ?? 0 },
    ].filter(d => d[platformA.name] > 0 || d[platformB.name] > 0);

    const chartConfig = {
      [platformA.name]: {
        label: platformA.name,
        color: "hsl(var(--chart-1))",
      },
      [platformB.name]: {
        label: platformB.name,
        color: "hsl(var(--chart-2))",
      },
    }

    return (
      <div className="bg-background">
        <section className="bg-secondary/30 border-b py-16 md:py-24">
            <div className="container">
                <div className="text-sm mb-6">
                    <Button asChild variant="ghost">
                        <Link href="/compare">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Comparisons
                        </Link>
                    </Button>
                </div>
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
                        <ManagedImage src={platformA.logoUrl} alt={`${platformA.name} logo`} width={240} height={80} className="object-contain h-12 md:h-16 w-auto" />
                        <span className="text-3xl md:text-5xl font-light text-muted-foreground">vs</span>
                        <ManagedImage src={platformB.logoUrl} alt={`${platformB.name} logo`} width={240} height={80} className="object-contain h-12 md:h-16 w-auto" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
                        {comparison.title}
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        {comparison.summary}
                    </p>
                </div>
            </div>
        </section>

        <div className="container max-w-5xl py-16 md:py-24">
          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
              <MarkdownContent content={comparison.introduction} />
          </div>

          <section className="my-12 md:my-20">
              <h2 className="font-headline text-3xl font-bold text-center mb-8">At a Glance</h2>
              <Card>
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead className="w-1/3 font-semibold text-foreground">Feature</TableHead>
                                  <TableHead className="text-center font-semibold text-foreground">{platformA.name}</TableHead>
                                  <TableHead className="text-center font-semibold text-foreground">{platformB.name}</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                               <TableRow>
                                  <TableCell className="font-medium">Overall Rating</TableCell>
                                  <TableCell className="text-center"><div className="flex justify-center items-center gap-1 font-semibold"><Star className="w-5 h-5 text-amber-400 fill-amber-400" /> {platformA.rating ? platformA.rating.toFixed(1) : 'N/A'}</div></TableCell>
                                  <TableCell className="text-center"><div className="flex justify-center items-center gap-1 font-semibold"><Star className="w-5 h-5 text-amber-400 fill-amber-400" /> {platformB.rating ? platformB.rating.toFixed(1) : 'N/A'}</div></TableCell>
                              </TableRow>
                              {comparison.facts.map(fact => (
                                  <TableRow key={fact.id}>
                                      <TableCell className="font-medium">{fact.title}</TableCell>
                                      <TableCell className="text-center">{fact.platformAValue}</TableCell>
                                      <TableCell className="text-center">{fact.platformBValue}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </section>

          {chartData.length > 0 && (
            <section className="my-12 md:my-20">
                <h2 className="font-headline text-3xl font-bold text-center mb-8">Ratings Breakdown</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Side-by-Side Ratings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ComparisonChart
                            chartConfig={chartConfig}
                            chartData={chartData}
                            platformAName={platformA.name}
                            platformBName={platformB.name}
                        />
                    </CardContent>
                </Card>
            </section>
          )}

          <section className="my-12 md:my-20">
              <h2 className="font-headline text-3xl font-bold text-center mb-8">Feature Comparison</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/3 font-semibold text-foreground">Feature</TableHead>
                            <TableHead className="text-center font-semibold text-foreground">{platformA.name}</TableHead>
                            <TableHead className="text-center font-semibold text-foreground">{platformB.name}</TableHead>
                        </TableRow>
                    </TableHeader>
                    {allCategories.map(category => {
                        const featuresInCategory = allFeatures.filter(f => f.categoryId === category.id);
                        if (featuresInCategory.length === 0) return null;
                        
                        return (
                            <TableBody key={category.id}>
                                <TableRow>
                                    <TableCell colSpan={3} className="bg-secondary/50">
                                        <h3 className="font-headline text-lg font-bold">{category.name}</h3>
                                    </TableCell>
                                </TableRow>
                                {featuresInCategory.map(feature => {
                                    const platformAFeature = getFeature(platformA, feature.id);
                                    const platformBFeature = getFeature(platformB, feature.id);
                                    
                                    const renderCheck = (pf: (typeof platformAFeature)) => (
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            {pf?.hasFeature 
                                                ? <CheckCircle className="h-6 w-6 text-green-500" />
                                                : <XCircle className="h-6 w-6 text-red-500" />
                                            }
                                            {pf?.details && <p className="text-xs text-muted-foreground text-center">{pf.details}</p>}
                                        </div>
                                    );

                                    return (
                                        <TableRow key={feature.id}>
                                            <TableCell className="font-medium">{feature.name}</TableCell>
                                            <TableCell className="text-center">{renderCheck(platformAFeature)}</TableCell>
                                            <TableCell className="text-center">{renderCheck(platformBFeature)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                           </TableBody>
                        )
                    })}
                </Table>
          </section>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto my-12 md:my-20">
              <MarkdownContent content={comparison.conclusion} />
          </div>

          {comparison.faqs.length > 0 && (
               <section className="my-12 md:my-20">
                  <h2 className="font-headline text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                  <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                      {comparison.faqs.map((faq, index) => (
                           <AccordionItem value={`item-${index}`} key={faq.id}>
                              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                              <AccordionContent className="prose dark:prose-invert pt-2">
                                  <p>{faq.answer}</p>
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                  </Accordion>
               </section>
          )}
      </div>
    </div>
    );
}
