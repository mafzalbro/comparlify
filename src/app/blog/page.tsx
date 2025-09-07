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
import { blogPosts } from '@/app/blog/posts';

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
                <Link href={`/blog/${post.slug}`} className="block">
                    <Image
                        src={post.image}
                        alt={post.title}
                        data-ai-hint={post.dataAiHint}
                        width={400}
                        height={250}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>
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
