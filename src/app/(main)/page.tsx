'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowRight,
  Lightbulb,
  FileText,
  Video,
  BookOpen,
  BrainCircuit,
  Scaling,
  BarChart,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WelcomeOnboarding } from '@/components/welcome-onboarding';
import type { Post, User } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Parallax } from 'react-parallax';


const testimonials = [
  {
    name: 'Sarah L.',
    title: 'Digital Marketing Guru',
    avatar: 'https://picsum.photos/100/100?random=1',
    dataAiHint: 'woman smiling',
    quote:
      "Comparlify's AI Title Generator is a game-changer! I've seen a 30% increase in click-through rates since I started using it.",
  },
  {
    name: 'Mike P.',
    title: 'Fitness Coach',
    avatar: 'https://picsum.photos/100/100?random=2',
    dataAiHint: 'man portrait',
    quote:
      'The platform comparisons saved me weeks of research. I found the perfect host for my courses in just one afternoon. Highly recommended!',
  },
  {
    name: 'Jessica T.',
    title: 'Online Art Instructor',
    avatar: 'https://picsum.photos/100/100?random=3',
    dataAiHint: 'woman professional',
    quote:
      "As a non-techy person, setting up an online course was daunting. Comparlify's clear guides and chatbot support made it so easy.",
  },
];

const featuredTools = [
    {
        Icon: Lightbulb,
        title: 'AI Title Generator',
        description: 'Craft catchy, SEO-friendly titles for your course.',
        href: '/tools/title-generator',
    },
    {
        Icon: FileText,
        title: 'AI Course Outliner',
        description: 'Generate a comprehensive, structured outline in minutes.',
        href: '/tools/course-outliner',
    },
    {
        Icon: Video,
        title: 'AI Video Script Assistant',
        description: 'Create engaging scripts for your video lessons.',
        href: '/tools/video-scripter',
    },
    {
        Icon: BookOpen,
        title: 'AI Lesson Summarizer',
        description: 'Automatically generate key takeaways for your lessons.',
        href: '/tools/lesson-summarizer',
    }
]

const whyChooseUsTabs = [
    {
        value: 'comparisons',
        title: 'Unbiased Comparisons',
        Icon: BarChart,
        description: 'Get in-depth, data-driven comparisons of the top platforms for course creation. We dig into the details so you can choose with absolute confidence.',
        image: 'https://picsum.photos/400/400?random=10',
        dataAiHint: 'data chart graph',
    },
    {
        value: 'ai-tools',
        title: 'Powerful AI Tools',
        Icon: BrainCircuit,
        description: 'From generating catchy titles to outlining entire courses, our suite of AI tools is designed to save you time and spark your creativity.',
        image: 'https://picsum.photos/400/400?random=11',
        dataAiHint: 'abstract technology circuit',
    },
    {
        value: 'strategies',
        title: 'Growth Strategies',
        Icon: Scaling,
        description: 'Access our regularly updated blog for expert tips, marketing strategies, and insights to help you scale your course business effectively.',
        image: 'https://picsum.photos/400/400?random=12',
        dataAiHint: 'business growth chart',
    }
]

type PostWithAuthor = Post & { author: User };


export default function Home() {
  const { data: session } = useSession();
  const showOnboarding = session?.user && !session.user.onboarded;
  
  // Data will be fetched on the client side, or passed in as props later.
  const [recentPosts, setRecentPosts] = useState<PostWithAuthor[]>([]);

  return (
    <>
      {showOnboarding && <WelcomeOnboarding user={session.user} />}
      
      <Parallax bgImage="https://picsum.photos/1920/1080?random=hero" bgImageAlt="hero background" strength={300}>
        <section className="relative w-full overflow-hidden h-[70vh] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/50" />
            <div className="container relative z-20 flex flex-col items-center justify-center text-center px-4 md:px-6 text-white">
            <div className="inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
                The Ultimate Co-pilot for Course Creators
            </div>
            <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Build, Market & Sell
                <br />
                <span className="text-primary">Smarter, Not Harder</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-2xl">
                Comparlify provides the tools, comparisons, and insights you need to turn your expertise into a thriving online business.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="group">
                <Link href="/tools">
                    Explore AI Tools
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                <Link href="/compare">
                    Compare Platforms
                </Link>
                </Button>
            </div>
            </div>
        </section>
      </Parallax>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-16 md:py-24 bg-secondary/30">
            <div className="container px-4 md:px-6">
                <div
                    className="mx-auto max-w-3xl text-center mb-12"
                >
                    <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                        Your All-In-One Creator Hub
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Stop juggling dozens of apps. Get everything you need to succeed from a single, powerful dashboard.
                    </p>
                </div>
                
                <Tabs defaultValue="comparisons" className="w-full">
                    <div>
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
                        {whyChooseUsTabs.map(tab => (
                             <TabsTrigger key={tab.value} value={tab.value} className="h-full flex flex-col md:flex-row items-center gap-3 p-4 text-base md:text-sm">
                                <tab.Icon className="h-6 w-6"/> {tab.title}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    </div>
                    
                    {whyChooseUsTabs.map(tab => (
                        <TabsContent key={tab.value} value={tab.value}>
                           <div
                                key={tab.value}
                                className="mt-8 bg-card/60 backdrop-blur-lg border border-border/20 p-8 rounded-xl shadow-lg"
                           >
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="bg-primary/20 p-3 rounded-full w-max">
                                        <tab.Icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="font-headline text-3xl font-bold text-foreground">{tab.title}</h3>
                                    <p className="text-lg text-muted-foreground">{tab.description}</p>
                                    <Button asChild className="group">
                                        <Link href={tab.value === 'comparisons' ? '/compare' : (tab.value === 'ai-tools' ? '/tools' : '/blog')}>
                                            Learn More <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </div>
                                <div>
                                    <Image
                                        src={tab.image}
                                        alt={tab.title}
                                        data-ai-hint={tab.dataAiHint}
                                        width={400}
                                        height={400}
                                        className="w-full h-auto object-cover rounded-lg shadow-xl"
                                    />
                                </div>
                            </div>
                           </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>

      {/* Featured Tools Section */}
      <section className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
              <div
                  className="mx-auto max-w-3xl text-center mb-12"
              >
                  <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                      Supercharge Your Workflow
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                      Our suite of AI-powered tools is designed to handle the tedious tasks, so you can focus on creating.
                  </p>
              </div>

                <div
                  className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
              >
                  {featuredTools.map((tool, index) => (
                      <div key={index}>
                          <Card className="bg-card/60 backdrop-blur-lg border border-border/20 flex h-full transform flex-col items-center p-6 text-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                              <div className="mb-4 rounded-full bg-primary/20 p-4">
                                  <tool.Icon className="h-8 w-8 text-primary" />
                              </div>
                              <CardTitle className="font-headline mb-2 text-xl">{tool.title}</CardTitle>
                              <CardContent className="flex-1 text-sm text-muted-foreground">
                                  <p>{tool.description}</p>
                              </CardContent>
                              <Button asChild variant="link" className="mt-4">
                                  <Link href={tool.href}>Use Tool <ArrowRight className="ml-2 h-4 w-4" /></Link>
                              </Button>
                          </Card>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* From the Blog Section */}
      {recentPosts.length > 0 && (
          <section className="py-16 md:py-24 bg-secondary/30">
              <div className="container px-4 md:px-6">
                  <div
                      className="mx-auto max-w-3xl text-center mb-12"
                  >
                      <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                          Creator Insights
                      </h2>
                      <p className="mt-4 text-lg text-muted-foreground">
                          The latest strategies, tips, and news from our blog.
                      </p>
                  </div>
                  <div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                      {recentPosts.map((post) => {
                          const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
                          return (
                              <div key={post.slug}>
                                  <Card className="bg-card/60 backdrop-blur-lg border border-border/20 flex flex-col overflow-hidden group h-full">
                                      <div className="relative overflow-hidden aspect-[16/10]">
                                          <Link href={`/blog/${post.slug}`} className="block">
                                              <Image
                                                  src={post.image}
                                                  alt={post.title}
                                                  data-ai-hint={post.dataAiHint ?? ''}
                                                  fill
                                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                              />
                                          </Link>
                                      </div>
                                      <CardHeader>
                                          <CardTitle className="font-headline text-xl">
                                              <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                                                  {post.title}
                                              </Link>
                                          </CardTitle>
                                      </CardHeader>
                                      <CardContent className="flex-1">
                                          <p className="text-muted-foreground text-sm line-clamp-3">{post.description}</p>
                                      </CardContent>
                                      <CardFooter className="flex justify-between items-center">
                                          <div className="text-sm text-muted-foreground">
                                              <span>{post.author.name}</span> &bull; <span>{readTime} min read</span>
                                          </div>
                                          <Button asChild variant="ghost" size="sm" className="group-hover:text-primary">
                                              <Link href={`/blog/${post.slug}`}>
                                                  Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                              </Link>
                                          </Button>
                                      </CardFooter>
                                  </Card>
                              </div>
                          )
                      })}
                  </div>
              </div>
          </section>
      )}

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div
              className="mx-auto max-w-3xl text-center mb-12"
          >
            <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
              Loved by Creators Worldwide
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Don't just take our word for it. Here's what creators are saying
              about Comparlify.
            </p>
          </div>
          <div
          >
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-2 h-full">
                    <Card className="bg-card/60 backdrop-blur-lg border border-border/20 flex flex-col justify-between h-full p-6 shadow-md">
                      <blockquote className="text-muted-foreground mb-6 text-base">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.dataAiHint} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.title}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-[-20px] md:left-[-50px]" />
            <CarouselNext className="right-[-20px] md:right-[-50px]" />
          </Carousel>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-secondary/30">
          <div
              className="container px-4 md:px-6 text-center"
          >
              <div className="mx-auto max-w-2xl">
              <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                  Ready to Elevate Your Course Business?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                  Join thousands of successful creators. Access all our tools and
                  resources for free.
              </p>
              <div className="mt-8">
                  <Button size="lg" className="group" asChild>
                  <Link href="/register">
                      Sign Up for Free
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  </Button>
              </div>
              </div>
          </div>
      </section>
    </>
  );
}
