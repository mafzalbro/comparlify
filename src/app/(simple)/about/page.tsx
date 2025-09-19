
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

type TeamMember = {
    name: string;
    role: string;
    avatar: string;
    dataAiHint: string;
}

export default async function AboutPage() {
    const content = await getContent();
    const siteName = content['global.siteName'] || 'Comparlify';

    const values = [
        {
            Icon: Lightbulb,
            title: content['about.values.clarity.title'],
            description: content['about.values.clarity.description']
        },
        {
            Icon: Users,
            title: content['about.values.community.title'],
            description: content['about.values.community.description']
        },
        {
            Icon: HeartHandshake,
            title: content['about.values.empowerment.title'],
            description: content['about.values.empowerment.description']
        }
    ];

    let team: TeamMember[] = [];
    try {
        team = JSON.parse(content['about.team.members']);
    } catch (e) {
        console.error("Failed to parse team members from site content:", e);
    }

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
                {content['about.hero.subtitle'].replace('Comparlify', siteName)}
            </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="container py-16 md:py-24 px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="prose prose-lg dark:prose-invert text-foreground max-w-none">
               <MarkdownContent content={content['about.story.content'].replace('Comparlify', siteName)} className="h-auto" />
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
                <h2 className="font-headline text-4xl font-bold text-foreground">{content['about.values.title']}</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {content['about.values.subtitle']}
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
                <h2 className="font-headline text-4xl font-bold text-foreground">{content['about.team.title']}</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {content['about.team.subtitle']}
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
                      {content['about.cta.title']}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                      {content['about.cta.subtitle']}
                  </p>
                  <div className="mt-8">
                      <Button size="lg" className="group" asChild>
                          <Link href="/register">
                              {content['about.cta.button']}
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
