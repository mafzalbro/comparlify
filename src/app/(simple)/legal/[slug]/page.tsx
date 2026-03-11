import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { cache } from "react";
import { Breadcrumbs } from "@/components/breadcrumb";
import { format } from "date-fns";
import { MarkdownContent } from "@/components/markdown-content";
import prisma from "@/lib/prisma";
import { SiteContent } from "@prisma/client";
import { MotionDiv } from "@/components/motion-wrapper";
import { ShieldCheck, Clock, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export async function generateStaticParams() {
  const docs = await prisma.siteContent.findMany({
    where: { group: "Legal Pages" },
    select: { key: true },
  });
  return docs.map((doc) => ({
    slug: doc.key.replace("legal.", ""),
  }));
}

const getDocument = cache(async (slug: string): Promise<SiteContent | null> => {
  const key = `legal.${slug}`;
  const doc = await prisma.siteContent.findUnique({ where: { key } });
  if (!doc) return null;
  return doc;
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const doc = await getDocument(slug);
  if (!doc) return {};

  // Create a more generic title from the key
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return generateSeoMetadata({
    title: `${title} | Legal Compliance Hub`,
    description: doc.value.substring(0, 160),
    path: `/legal/${slug}`,
  });
}

export default async function LegalDocumentPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const doc = await getDocument(slug);

  if (!doc) {
    notFound();
  }

  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="bg-background min-h-screen">
      <header className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              <Breadcrumbs
                items={[{ name: "Home", href: "/" }, { name: title }]}
                className="mb-8 justify-center"
              />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-widest leading-none">
                  Legal Document
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] mb-8">
                {title}
              </h1>

              <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    Last Updated:{" "}
                    {format(new Date(doc.updatedAt), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="h-4 w-px bg-border/20"></div>
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                  <FileText className="h-4 w-4" />
                  <span>Official Document</span>
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </header>

      <main className="container max-w-4xl py-24 px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-strong:text-foreground/90 prose-a:text-primary p-8 md:p-12 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 translate-x-8 -translate-y-8 select-none pointer-events-none">
              <Sparkles className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <MarkdownContent content={doc.value} />
            </div>
          </div>
        </MotionDiv>
      </main>

      {/* Legal Certification Footer */}
      <footer className="container max-w-5xl py-12 px-4 md:px-6">
        <div className="p-8 rounded-3xl bg-secondary/50 border border-border/10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Document Reference
          </p>
          <p className="text-sm font-medium text-foreground/60 leading-relaxed font-mono">
            {slug.toUpperCase()}-v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
