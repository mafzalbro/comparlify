
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
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
  CheckCircle,
  Lightbulb,
  Scaling,
  Users,
  BarChart,
  BrainCircuit,
  LayoutPanelLeft,
  FileText,
  Video,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function Home() {
  return (
    <>
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-background py-32 md:py-48">
             <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5" style={{ maskImage: 'linear-gradient(to bottom, transparent, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black, transparent)'}}></div>
             <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-10" />

            <motion.div
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="container relative z-20 flex flex-col items-center justify-center text-center px-4 md:px-6"
            >
                <motion.div variants={fadeIn} className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                    The Ultimate Co-pilot for Course Creators
                </motion.div>
                <motion.h1 
                    variants={fadeIn}
                    className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl"
                >
                    Build, Market & Sell
                    <br />
                    <span className="text-primary">Smarter, Not Harder</span>
                </motion.h1>
                <motion.p
                    variants={fadeIn}
                    className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl"
                >
                  Comparlify provides the tools, comparisons, and insights you need to turn your expertise into a thriving online business.
                </motion.p>
                <motion.div
                    variants={fadeIn}
                    className="mt-8 flex flex-wrap justify-center gap-4"
                >
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
                </motion.div>
            </motion.div>
        </section>

        {/* Why Choose Us Section */}
        <section id="why-us" className="py-16 md:py-24 bg-secondary/30">
            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-3xl text-center mb-12"
                >
                    <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                        Your All-In-One Creator Hub
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Stop juggling dozens of apps. Get everything you need to succeed from a single, powerful dashboard.
                    </p>
                </motion.div>
                
                <Tabs defaultValue="comparisons" className="w-full">
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true, amount: 0.5 }}
                         transition={{ duration: 0.6, delay: 0.2 }}
                    >
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
                        {whyChooseUsTabs.map(tab => (
                             <TabsTrigger key={tab.value} value={tab.value} className="h-full flex flex-col md:flex-row items-center gap-3 p-4 text-base md:text-sm">
                                <tab.Icon className="h-6 w-6"/> {tab.title}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    </motion.div>
                    
                    {whyChooseUsTabs.map(tab => (
                        <TabsContent key={tab.value} value={tab.value}>
                           <motion.div
                                key={tab.value}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="mt-8 bg-card p-8 rounded-xl shadow-lg"
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
                                <motion.div
                                     initial={{ scale: 0.9, opacity: 0 }}
                                     whileInView={{ scale: 1, opacity: 1 }}
                                     viewport={{ once: true }}
                                     transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <Image
                                        src={tab.image}
                                        alt={tab.title}
                                        data-ai-hint={tab.dataAiHint}
                                        width={400}
                                        height={400}
                                        className="w-full h-auto object-cover rounded-lg shadow-xl"
                                    />
                                </motion.div>
                            </div>
                           </motion.div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>

        {/* Featured Tools Section */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-3xl text-center mb-12"
                >
                    <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                        Supercharge Your Workflow
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our suite of AI-powered tools is designed to handle the tedious tasks, so you can focus on creating.
                    </p>
                </motion.div>

                 <motion.div
                    initial="initial"
                    whileInView="animate"
                    variants={staggerContainer}
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
                >
                    {featuredTools.map((tool, index) => (
                        <motion.div key={index} variants={fadeIn}>
                            <Card className="flex h-full transform flex-col items-center p-6 text-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
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
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
                className="mx-auto max-w-3xl text-center mb-12"
            >
              <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                Loved by Creators Worldwide
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Don't just take our word for it. Here's what creators are saying
                about Comparlify.
              </p>
            </motion.div>
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, amount: 0.5 }}
                 transition={{ duration: 0.6, delay: 0.2 }}
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
                      <Card className="flex flex-col justify-between h-full p-6 bg-card shadow-md">
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
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-32 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
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
            </motion.div>
        </section>
    </>
  );
}
