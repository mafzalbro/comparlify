import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AIGenericForm } from "@/components/ai-generic-form";
import { Breadcrumbs } from "@/components/breadcrumb";
import { MotionDiv } from "@/components/motion-wrapper";
import { Wand2, Sparkles, BrainCircuit } from "lucide-react";
import React, { cache } from "react";
import { iconMap } from "../tools";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";

const getToolBySlug = cache(async (slug: string) => {
  return await prisma.tool.findUnique({
    where: { slug, enabled: true },
  });
});

const STATIC_FEATURES = [
  {
    title: "Advanced Logic",
    icon: BrainCircuit,
    text: "Powered by the latest LLM models for high-fidelity output.",
  },
  {
    title: "Real-time Magic",
    icon: Sparkles,
    text: "Stream results directly with our specialized latency engine.",
  },
  {
    title: "Creative Edge",
    icon: Wand2,
    text: "Tailored for the modern creator, optimized for conversions.",
  },
];

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const tool = await getToolBySlug(slug);

  if (!tool) return {};

  return generateSeoMetadata({
    title: `${tool.title} | AI Creator Intelligence`,
    description: tool.description,
    path: `/tools/ai/${tool.slug}`,
  });
}

export async function generateStaticParams() {
  const tools = await prisma.tool.findMany({
    where: { enabled: true },
  });
  return tools.map((t) => ({ slug: t.slug }));
}

export default async function DynamicToolPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const tool = await getToolBySlug(slug);

  if (!tool) notFound();

  const ToolIcon = iconMap[tool.Icon] || Wand2;

  return (
    <div className="bg-background min-h-screen">
      <header className="relative pt-24 pb-12 overflow-hidden border-b border-border/10">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-10"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: "Tools", href: "/tools" },
                  { name: "AI Hub", href: "/tools/ai" },
                  { name: tool.title },
                ]}
                className="mb-8 pl-4 md:pl-0 self-start md:self-center"
              />
              <div className="p-6 bg-primary/10 rounded-4xl border border-primary/20 text-primary mb-8 shadow-inner group transition-all duration-700 hover:scale-110">
                <ToolIcon className="h-10 w-10 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight tracking-tight">
                {tool.title}
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                {tool.description}
              </p>
            </div>
          </MotionDiv>
        </div>
      </header>

      <main className="container max-w-7xl pb-40">
        <AIGenericForm tool={tool} />

        <section className="mt-32 pt-24 border-t border-border/5">
          <div className="grid md:grid-cols-3 gap-12">
            {STATIC_FEATURES.map((feature, i) => (
              <MotionDiv
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-4xl bg-card/40 backdrop-blur-3xl border border-border/10 hover:bg-primary/5 transition-all text-center md:text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 mx-auto md:mx-0">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {feature.text}
                </p>
              </MotionDiv>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
