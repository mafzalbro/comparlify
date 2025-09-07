import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    slug: 'choosing-the-right-platform',
    title: '10 Things to Consider When Choosing a Course Platform',
    description:
      'From pricing and features to scalability and support, here are the key factors to weigh before committing to a platform.',
    image: 'https://picsum.photos/400/250?random=1',
    dataAiHint: 'decision making choices',
    author: 'Jane Doe',
    date: 'October 26, 2023',
    readTime: 8,
  },
  {
    slug: 'engaging-course-content',
    title: '5 Secrets to Creating Wildly Engaging Course Content',
    description:
      "Move beyond static videos. Discover interactive techniques that captivate students and boost completion rates.",
    image: 'https://picsum.photos/400/250?random=2',
    dataAiHint: 'creative content creation',
    author: 'John Smith',
    date: 'October 22, 2023',
    readTime: 6,
  },
  {
    slug: 'marketing-your-online-course',
    title: 'The Ultimate Guide to Marketing Your Online Course in 2024',
    description:
      'Explore the latest strategies for social media, email marketing, and SEO to attract your ideal students.',
    image: 'https://picsum.photos/400/250?random=3',
    dataAiHint: 'digital marketing strategy',
    author: 'Emily White',
    date: 'October 18, 2023',
    readTime: 12,
  },
    {
    slug: 'ai-in-education',
    title: 'How AI is Revolutionizing the E-Learning Industry',
    description:
      'Learn how artificial intelligence is personalizing learning paths, automating grading, and creating smarter content.',
    image: 'https://picsum.photos/400/250?random=4',
    dataAiHint: 'artificial intelligence education',
    author: 'Chris Green',
    date: 'October 15, 2023',
    readTime: 9,
  },
  {
    slug: 'building-a-community',
    title: 'Beyond the Course: Building a Thriving Student Community',
    description:
      'A strong community increases student retention and word-of-mouth marketing. Here’s how to build one from scratch.',
    image: 'https://picsum.photos/400/250?random=5',
    dataAiHint: 'online community students',
    author: 'Maria Garcia',
    date: 'October 11, 2023',
    readTime: 7,
  },
    {
    slug: 'pricing-strategies',
    title: 'Pricing Your Course: Strategies for Maximum Profit and Impact',
    description:
      'Are you under-valuing your content? We break down different pricing models to help you find the sweet spot.',
    image: 'https://picsum.photos/400/250?random=6',
    dataAiHint: 'pricing strategy chart',
    author: 'David Lee',
    date: 'October 07, 2023',
    readTime: 10,
  },
];

export default function BlogPage() {
  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <div className="text-center mb-16">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
          Creator Insights
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Actionable advice, deep dives, and growth strategies for the modern course creator.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="flex flex-col overflow-hidden group">
            <div className="relative overflow-hidden">
                <Image
                    src={post.image}
                    alt={post.title}
                    data-ai-hint={post.dataAiHint}
                    width={400}
                    height={250}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">{post.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    <span>{post.author}</span> &bull; <span>{post.readTime} min read</span>
                </div>
              <Button asChild variant="ghost" size="sm" className="group-hover:text-primary">
                <Link href={`/blog/${post.slug}`}>
                  Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
    