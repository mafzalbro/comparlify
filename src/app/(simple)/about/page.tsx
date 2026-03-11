import type { Metadata } from "next";
import Link from "next/link";
import { generateSeoMetadata } from "@/lib/seo";
import { ManagedImage } from "@/components/managed-image";
import { Breadcrumbs } from "@/components/breadcrumb";
import {
  Lightbulb,
  Users,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Target,
  Rocket,
  ShieldCheck,
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
      {/* Premium Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              <Breadcrumbs
                items={[{ name: "Home", href: "/" }, { name: "About" }]}
                className="mb-8 justify-center"
              />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
                <Rocket className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  Our Mission
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-8">
                {content["about.hero.title"]}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                {content["about.hero.subtitle"].replace("Comparlify", siteName)}
              </p>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="container py-24 px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <MotionDiv
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-all"></div>
              <div className="relative aspect-square md:aspect-[4/3] rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-background ring-1 ring-border/10">
                <ManagedImage
                  src="https://picsum.photos/seed/story/1000/800"
                  alt="The Comparlify Journey"
                  data-ai-hint="team collaboration creative"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
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
            <div className="prose prose-xl dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black">
              <MarkdownContent
                content={content["about.story.content"].replace(
                  "Comparlify",
                  siteName,
                )}
              />
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Core Values - Premium Icons */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/30"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {content["about.values.title"]}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content["about.values.subtitle"]}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <MotionDiv
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full rounded-[3rem] p-10 bg-card/40 backdrop-blur-xl border border-border/10 hover:shadow-2xl transition-all duration-500 group">
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
        </div>
      </section>

      {/* Team - Premium Layout */}
      <section className="py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 uppercase tracking-widest text-xs font-bold rounded-full mb-4">
              The Team
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A world-class team of creators, engineers, and analysts dedicated
              to your success.
            </p>
          </div>
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
        </div>
      </section>

      {/* CTA Section - High Impact */}
      <section className="container py-24 mb-24 px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-16 md:p-24 rounded-[4rem] bg-card/60 backdrop-blur-xl border border-primary/20 shadow-2xl overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-10"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-8">
              {content["about.cta.title"]}
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              {content["about.cta.subtitle"]}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="rounded-xl px-8 h-14 font-bold uppercase tracking-wider text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                asChild
              >
                <Link href="/register">
                  {content["about.cta.button"]}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-8 h-14 font-bold uppercase tracking-wider text-sm backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                asChild
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </MotionDiv>
      </section>
    </div>
  );
}
