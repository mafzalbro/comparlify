
import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSeoMetadata } from '@/lib/seo';
import { ManagedImage } from '@/components/managed-image';
import { Breadcrumbs } from '@/components/breadcrumb';
import { Lightbulb, Users, HeartHandshake, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getContent } from '@/lib/content';
import { MarkdownContent } from '@/components/markdown-content';


export const metadata: Metadata = generateSeoMetadata({
    title: 'About Us',
    description: 'Empowering course creators with clarity and confidence. Learn about the mission and story behind Comparlify.',
    path: '/about'
});

const values = [
    {
        Icon: Lightbulb,
        title: "Clarity",
        description: "We cut through the noise, providing clear, unbiased information to help you make confident decisions."
    },
    {
        Icon: Users,
        title: "Community",
        description: "We believe in the power of creators helping creators. We're building a space for support and growth."
    },
    {
        Icon: HeartHandshake,
        title: "Empowerment",
        description: "Our goal is to give you the tools and insights you need to turn your passion into a thriving business."
    }
];

const team = [
    {
        name: "Alex Doe",
        role: "Co-Founder & Lead Strategist",
        avatar: "https://picsum.photos/seed/alex/100/100",
        dataAiHint: "man professional portrait"
    },
    {
        name: "Jamie Smith",
        role: "Co-Founder & Head of Product",
        avatar: "https://picsum.photos/seed/jamie/100/100",
        dataAiHint: "woman smiling portrait"
    }
];

export default async function AboutPage() {
    const content = await getContent();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-secondary/30 border-b">
        <div className="container text-center py-16 md:py-24 px-4 md:px-6">
            <Breadcrumbs
                items={[
                { name: 'Home', href: '/' },
                { name: 'About' },
                ]}
                className="mb-8 justify-center"
            />
            <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
                {content['about.hero.title']}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                {content['about.hero.subtitle']}
            </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="container py-16 md:py-24 px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="prose prose-lg dark:prose-invert text-foreground max-w-none">
               <MarkdownContent content={content['about.story.content']} className="h-auto" />
            </div>
             <div className="relative h-80 md:h-96 w-full">
                <ManagedImage 
                    src="https://picsum.photos/seed/story/800/600"
                    alt="A team of creators collaborating around a table with laptops"
                    data-ai-hint="team collaboration creative"
                    fill
                    className="object-cover rounded-xl shadow-lg transform md:rotate-3"
                />
            </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="font-headline text-4xl font-bold text-foreground">Our Core Values</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    These principles guide everything we do.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {values.map(value => (
                    <Card key={value.title} className="text-center p-6 bg-card/60">
                        <div className="mx-auto bg-primary/20 p-4 rounded-full w-max mb-4">
                            <value.Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">{value.title}</h3>
                        <p className="text-muted-foreground mt-2">{value.description}</p>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="font-headline text-4xl font-bold text-foreground">Meet the Creators</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    We're a small, passionate team dedicated to your success.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
                {team.map(member => (
                    <div key={member.name} className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h4 className="text-xl font-bold text-foreground">{member.name}</h4>
                            <p className="text-primary font-medium">{member.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container px-4 md:px-6 text-center">
              <div className="mx-auto max-w-2xl">
                  <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
                      Ready to Join Us?
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                      Become part of a community of forward-thinking creators. Explore our tools and insights today.
                  </p>
                  <div className="mt-8">
                      <Button size="lg" className="group" asChild>
                          <Link href="/register">
                              Get Started for Free
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
