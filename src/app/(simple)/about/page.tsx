import type { Metadata } from "next";
import Link from "next/link";
import { generateSeoMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { Section, SectionHeader } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/breadcrumb";
import { ManagedImage } from "@/components/managed-image";
import {
  Lightbulb,
  Users,
  HeartHandshake,
  ArrowRight,
  Target,
  Rocket,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/content";
import { MarkdownContent } from "@/components/markdown-content";
import { MotionDiv } from "@/components/motion-wrapper";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = await generateSeoMetadata({
  title: "Our Story | The Vision Behind Comparlify",
  description:
    "Empowering course creators with data-driven clarity. Discover how Comparlify is reshaping the digital education landscape.",
  path: "/about",
});

type TeamMember = {
  name: string;
  role: string;
  avatar: string;
  dataAiHint: string;
};

export default async function AboutPage() {
  const content = await getContent();
  const siteName = content["global.siteName"] || "Comparlify";

  const values = [
    {
      Icon: Lightbulb,
      title: content["about.values.clarity.title"],
      description: content["about.values.clarity.description"],
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      Icon: Users,
      title: content["about.values.community.title"],
      description: content["about.values.community.description"],
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      Icon: HeartHandshake,
      title: content["about.values.empowerment.title"],
      description: content["about.values.empowerment.description"],
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  let team: TeamMember[] = [];
  try {
    team = JSON.parse(content["about.team.members"]);
  } catch (e) {
    console.error("Failed to parse team members from site content:", e);
  }

  return (
    <div className="bg-background min-h-screen">
      <PageHero
        supertitle="Our Mission"
        title={content["about.hero.title"]}
        subtitle={(content["about.hero.subtitle"] || "").replace("Comparlify", siteName)}
      >
        <Breadcrumbs
          items={[{ name: "Home", href: "/" }, { name: "About" }]}
          className="mb-8 justify-center"
        />
      </PageHero>

      {/* Narrative Section */}
      <Section id="story" className="py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <MotionDiv
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl group-hover:bg-primary/10 transition-all"></div>
              <div className="relative aspect-video lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background ring-1 ring-border/10">
                <ManagedImage
                  src="https://picsum.photos/seed/story/1000/800"
                  alt="The Comparlify Journey"
                  data-ai-hint="team collaboration creative"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest mb-6 text-sm">
              <span className="w-8 h-px bg-primary/30"></span> Our Story
            </div>
            <MarkdownContent
              content={(content["about.story.content"] || "").replace(
                "Comparlify",
                siteName,
              )}
            />
          </MotionDiv>
        </div>
      </Section>

      {/* Core Values */}
      <Section withGlow id="values">
        <SectionHeader
          title={content["about.values.title"]}
          subtitle={content["about.values.subtitle"]}
          centered
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value, idx) => (
            <MotionDiv
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full rounded-[2rem] p-8 bg-card/40 backdrop-blur-xl border border-border/10 hover:shadow-2xl transition-all duration-500 group">
                <div
                  className={`w-16 h-16 rounded-3xl ${value.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}
                >
                  <value.Icon className={`h-8 w-8 ${value.color}`} />
                </div>
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </Section>

      {/* Team */}
      <Section id="team">
        <SectionHeader
          supertitle="The Team"
          title="Meet the Team"
          subtitle="A world-class team of creators, engineers, and analysts dedicated to your success."
          centered
        />
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
          {team.map((member, idx) => (
            <MotionDiv
              key={member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center group"
            >
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100"></div>
                <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-[6px] ring-background shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                  <AvatarImage
                    src={member.avatar}
                    alt={member.name}
                    data-ai-hint={member.dataAiHint}
                  />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center relative z-10">
                <h4 className="text-xl font-bold text-foreground mb-1 leading-none tracking-tight">
                  {member.name}
                </h4>
                <p className="text-primary font-medium uppercase tracking-wider text-xs">
                  {member.role}
                </p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section id="cta" className="mb-12">
        <MotionDiv
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-12 md:p-16 rounded-[3rem] bg-card/60 backdrop-blur-xl border border-primary/20 shadow-2xl overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-[0.03]"></div>
          <div className="relative z-10 max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-8 uppercase">
              {content["about.cta.title"]}
            </h2>
            <p className="text-xl text-muted-foreground mb-12 font-medium">
              {content["about.cta.subtitle"]}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="xl"
                className="rounded-xl px-10 h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-105"
                asChild
              >
                <Link href="/register">
                  {content["about.cta.button"]}
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="rounded-xl px-10 h-14 font-black uppercase tracking-widest text-[10px] backdrop-blur-md transition-all hover:scale-105"
                asChild
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </MotionDiv>
      </Section>
    </div>
  );
}
