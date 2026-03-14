import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateSeoMetadata } from "@/lib/seo";
import { ToolsClientPage } from "./_components/tools-client-page";
import { getContent } from "@/lib/content";
import prisma from "@/lib/prisma";
import { type Tool } from "./tools";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "AI Creator Hub | Relocated Tools",
    description:
      "A hub for our 18 legacy AI creator tools, moved for surgical precision and platform clarity.",
    path: "/tools/ai",
  });
}

async function getTools(): Promise<Tool[]> {
  const dbTools = await prisma.tool.findMany({
    where: { enabled: true },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });
  return dbTools;
}

export default async function AIToolsDashboard() {
  const content = await getContent();
  if (content["module.tools.enabled"] === "false") {
    notFound();
  }

  const tools = await getTools();

  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <ToolsClientPage allTools={tools} />
    </Suspense>
  );
}
