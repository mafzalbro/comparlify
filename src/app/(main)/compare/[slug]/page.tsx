import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import Image from 'next/image';
import { Star, CheckCircle, XCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { ComparisonChart } from '@/components/comparison-chart';


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

    const featureCategories = [...new Set(
      [
          ...platformA.features.map(f => f.feature.category.name),
          ...platformB.features.map(f => f.feature.category.name),
      ]
    )].sort();

    const chartData = [
      { name: 'Overall Rating', [platformA.name]: platformA.rating, [platformB.name]: platformB.rating },
      { name: 'Ease of Use', [platformA.name]: platformA.easeOfUse, [platformB.name]: platformB.easeOfUse },
      { name: 'Features', [platformA.name]: platformA.featuresRating, [platformB.name]: platformB.featuresRating },
      { name: 'Support', [platformA.name]: platformA.support, [platformB.name]: platformB.support },
    ];

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
      <div className="container max-w-5xl py-16 md:py-24">
         <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-8 mb-4">
              <Image src={platformA.logoUrl} alt={`${platformA.name} logo`} width={200} height={60} className="object-contain" />
              <span className="text-4xl font-light text-muted-foreground">vs</span>
              <Image src={platformB.logoUrl} alt={`${platformB.name} logo`} width={200} height={60} className="object-contain" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            {comparison.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              {comparison.summary}
          </p>
        </div>
          
          <div className="prose prose-lg dark:prose-invert mx-auto">
              <MarkdownContent content={comparison.introduction} />
          </div>

          <section className="my-16">
              <h2 className="font-headline text-3xl font-bold text-center mb-8">At a Glance</h2>
              <Card>
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead className="w-1/3">Feature</TableHead>
                                  <TableHead className="text-center">{platformA.name}</TableHead>
                                  <TableHead className="text-center">{platformB.name}</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                               <TableRow>
                                  <TableCell className="font-medium">Overall Rating</TableCell>
                                  <TableCell className="text-center flex justify-center items-center gap-1"><Star className="w-5 h-5 text-amber-500 fill-amber-400" /> {platformA.rating?.toFixed(1)}</TableCell>
                                  <TableCell className="text-center flex justify-center items-center gap-1"><Star className="w-5 h-5 text-amber-500 fill-amber-400" /> {platformB.rating?.toFixed(1)}</TableCell>
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

          <section className="my-16">
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


          <section className="my-16">
              <h2 className="font-headline text-3xl font-bold text-center mb-8">Feature Comparison</h2>
               {featureCategories.map(category => (
                  <div key={category} className="mb-8">
                      <h3 className="font-headline text-2xl font-bold mb-4 border-b pb-2">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="md:col-span-1">
                              <ul className="space-y-4">
                                  {platformA.features.filter(f => f.feature.category.name === category).map(f => (
                                      <li key={f.feature.id} className="flex items-start gap-3">
                                          {f.hasFeature ? <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 mt-1 shrink-0" />}
                                          <div>
                                              <p className="font-semibold">{f.feature.name}</p>
                                              {f.details && <p className="text-sm text-muted-foreground">{f.details}</p>}
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                           <div className="md:col-span-1 md:col-start-3">
                              <ul className="space-y-4">
                                   {platformB.features.filter(f => f.feature.category.name === category).map(f => (
                                      <li key={f.feature.id} className="flex items-start gap-3">
                                          {f.hasFeature ? <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 mt-1 shrink-0" />}
                                          <div>
                                              <p className="font-semibold">{f.feature.name}</p>
                                              {f.details && <p className="text-sm text-muted-foreground">{f.details}</p>}
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  </div>
               ))}
          </section>
          
          <div className="prose prose-lg dark:prose-invert mx-auto my-16">
              <MarkdownContent content={comparison.conclusion} />
          </div>

          {comparison.faqs.length > 0 && (
               <section className="my-16">
                  <h2 className="font-headline text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                  <Accordion type="single" collapsible className="w-full">
                      {comparison.faqs.map((faq, index) => (
                           <AccordionItem value={`item-${index}`} key={faq.id}>
                              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                              <AccordionContent className="prose dark:prose-invert">
                                  <p>{faq.answer}</p>
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                  </Accordion>
               </section>
          )}
      </div>
    );
}
