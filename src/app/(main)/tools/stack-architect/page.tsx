import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import prisma from "@/lib/prisma";
import { StackArchitect } from "./_components/stack-architect";
import { getUserProjects } from "@/app/actions/projects";
import { MotionDiv } from "@/components/motion-wrapper";
import { LayoutGrid, Info, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumb";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "E-Learning Stack Architect | Comparlify",
    description:
      "Visually build and cost your course creator tech stack. Detect integration gaps and redundant tools before you buy.",
    path: "/tools/stack-architect",
  });
}

async function getPlatforms() {
  return await prisma.platform.findMany({
    include: { tiers: true, features: { include: { feature: true } } },
    orderBy: {
      name: "asc",
    },
  });
}

export default async function StackArchitectPage() {
  const platforms = await getPlatforms();
  const projects = await getUserProjects();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs 
        items={[
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: "Stack Architect" }
        ]}
        className="mb-8 pl-4 md:pl-0"
      />
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
          <LayoutGrid className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Structural Intelligence
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          E-Learning{" "}
          <span className="text-primary italic">Stack Architect</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Map out your entire digital ecosystem. From LMS cores to email
          automations, ensure your tools talk to each other without burning your
          margin.
        </p>
      </MotionDiv>

      <StackArchitect platforms={platforms as any} projects={projects as any} />

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 pt-20 border-t border-border/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              Integration{" "}
              <span className="text-primary italic">Compliance</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              One of the biggest leaks in a creator's budget is **Tool
              Redundancy**. Many all-in-one platforms (like Kajabi or
              MyOwnPlatform) include features you might be paying for elsewhere.
              The Architect helps you identify these overlaps and choose the
              most streamlined path.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/10">
              <Info className="h-6 w-6 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest leading-normal">
                Hover over any tool in your blueprint to see its core
                compatibility status.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-card border border-border/10 shadow-xl">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">
              Architect Tips
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm font-medium">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <span>
                  Choose an LMS with a native community if you want to maximize
                  student retention and login simplicity.
                </span>
              </li>
              <li className="flex gap-3 text-sm font-medium">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <span>
                  External Email tools like ConvertKit are great for advanced
                  automation, but check if your LMS's API supports deep tagging.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}