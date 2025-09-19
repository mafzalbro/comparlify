
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
import type { Post, User } from '@prisma/client';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { HomePageClient } from '@/components/home-page-client';
import { ManagedImage } from '@/components/managed-image';
import { cache } from 'react';
import { WhyChooseUs } from '@/components/why-choose-us';
import { getContent } from '@/lib/content';


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

type PostWithAuthor = Post & { author: User };

const getRecentPosts = cache(async (): Promise<PostWithAuthor[]> => {
    return prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { author: true },
    });
});


export default async function Home() {
    const session = await auth();
    const recentPosts = await getRecentPosts();
    const content = await getContent();

    return (
        <>
            <HomePageClient session={session} />

            <section className="relative w-full min-h-[70vh] py-10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                <div className="container relative z-10 flex flex-col items-center justify-center text-center px-4 md:px-6 text-foreground">
                    <div className="inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-4 backdrop-blur-sm animate-fade-in-up">
                        {content['homepage.hero.supertitle']}
                    </div>
                    <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl animate-fade-in-up animation-delay-200 whitespace-pre-line">
                        {content['homepage.hero.title']}
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-2xl animate-fade-in-up animation-delay-400">
                        {content['homepage.hero.subtitle']}
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-600">
                        <Button asChild size="lg" className="group">
                            <Link href="/tools">
                                {content['homepage.cta.primary']}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/compare">
                                {content['homepage.cta.secondary']}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <WhyChooseUs />

            {/* Featured Tools Section */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container px-4 md:px-6">
                    <div
                        className="mx-auto max-w-3xl text-center mb-12 animate-fade-in-up"
                    >
                        <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                            {content['homepage.tools.title']}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {content['homepage.tools.subtitle']}
                        </p>
                    </div>

                    <div
                        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
                    >
                        {featuredTools.map((tool, index) => (
                            <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
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
                            className="mx-auto max-w-3xl text-center mb-12 animate-fade-in-up"
                        >
                            <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                                {content['homepage.blog.title']}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                {content['homepage.blog.subtitle']}
                            </p>
                        </div>
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {recentPosts.map((post, index) => {
                                const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
                                return (
                                    <div key={post.slug} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                                        <Card className="bg-card/60 backdrop-blur-lg border border-border/20 flex flex-col overflow-hidden group h-full">
                                            <div className="relative overflow-hidden aspect-[16/10]">
                                                <Link href={`/blog/${post.slug}`} className="block">
                                                    <ManagedImage
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
                                            <CardFooter className="flex justify-between items-center bg-secondary/20 py-3 px-6">
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
                        className="mx-auto max-w-3xl text-center mb-12 animate-fade-in-up"
                    >
                        <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                           {content['homepage.testimonials.title']}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {content['homepage.testimonials.subtitle']}
                        </p>
                    </div>
                    <div
                        className="animate-fade-in-up animation-delay-200"
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
                            <CarouselPrevious className="left-[-1rem] md:left-0" />
                            <CarouselNext className="right-[-1rem] md:right-0" />
                        </Carousel>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 md:py-32 bg-secondary/30">
                <div
                    className="container px-4 md:px-6 text-center animate-fade-in-up"
                >
                    <div className="mx-auto max-w-2xl">
                        <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                            {content['homepage.finalCta.title']}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {content['homepage.finalCta.subtitle']}
                        </p>
                        <div className="mt-8">
                            <Button size="lg" className="group" asChild>
                                <Link href="/register">
                                    {content['homepage.finalCta.button']}
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
