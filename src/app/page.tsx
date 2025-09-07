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
} from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

const features = [
  {
    icon: <CheckCircle className="h-10 w-10 text-primary" />,
    title: 'Unbiased Comparisons',
    description:
      'Get in-depth, data-driven comparisons of the top platforms for course creation, so you can choose with confidence.',
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Tools',
    description:
      'From generating catchy titles to optimizing your content, our AI tools are designed to save you time and boost your success.',
  },
  {
    icon: <Scaling className="h-10 w-10 text-primary" />,
    title: 'Growth Strategies',
    description:
      'Access our regularly updated blog for expert tips, marketing strategies, and insights to scale your course business.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Community Insights',
    description:
      'Learn from the experiences of other course creators. Our community-driven data provides real-world perspectives.',
  },
];

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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-background">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
          <Image
            src="https://picsum.photos/1920/1080"
            alt="A creative workspace for a course creator"
            data-ai-hint="creative workspace"
            fill
            className="object-cover"
            priority
          />
          <div className="relative z-20 flex h-full items-center justify-center text-center">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl space-y-6">
                <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground md:text-7xl animate-fade-in-up">
                  Stop Guessing.
                  <br />
                  <span className="text-primary">Start Growing.</span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl animate-fade-in-up animation-delay-200">
                  Comparlify provides course creators with the tools, comparisons,
                  and insights needed to build a successful online business.
                </p>
                <div className="animate-fade-in-up animation-delay-400">
                  <Button asChild size="lg" className="group">
                    <Link href="/#features">
                      Explore Features
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We've built a suite of tools and resources specifically for course
                creators like you.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="bg-card/80 backdrop-blur-sm border-2 border-accent/20 hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                  style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                >
                  <CardHeader className="items-center text-center">
                    {feature.icon}
                    <CardTitle className="font-headline text-2xl mt-4">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* AI Tools Spotlight */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                  AI-Powered
                </div>
                <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                  Generate Catchy Titles in Seconds
                </h2>
                <p className="text-lg text-muted-foreground">
                  Struggling with the perfect course title? Our AI Title Generator creates engaging, SEO-friendly titles based on your course description. Capture attention and attract more students effortlessly.
                </p>
                <Button asChild size="lg" className="group">
                  <Link href="/tools/title-generator">
                    Try Title Generator
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl">
                 <Image
                    src="https://picsum.photos/600/400"
                    alt="AI Title Generator interface"
                    data-ai-hint="abstract technology"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
              </div>
            </div>
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                Loved by Creators Worldwide
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Don't just take our word for it. Here's what creators are saying
                about Comparlify.
              </p>
            </div>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1 h-full">
                      <Card className="flex flex-col justify-between h-full p-6 bg-card/80">
                        <blockquote className="text-muted-foreground mb-6">
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
              <CarouselPrevious className="left-[-50px]" />
              <CarouselNext className="right-[-50px]" />
            </Carousel>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                Ready to Elevate Your Course Business?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of successful creators. Access all our tools and
                resources for free.
              </p>
              <div className="mt-8">
                <Button size="lg" className="group">
                  Sign Up for Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
    