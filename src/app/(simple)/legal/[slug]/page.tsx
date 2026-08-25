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
  return docs.map((doc: { key: string }) => ({
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
      <header className="relative pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
        <div className="container mx-auto relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <Breadcrumbs
                items={[{ name: "Home", href: "/" }, { name: title }]}
                className="mb-4 justify-center"
              />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest leading-none">
                  Legal Document
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-4">
                {title}
              </h1>

              <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Last Updated:{" "}
                    {format(new Date(doc.updatedAt), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="h-4 w-px bg-border/20"></div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Official Document</span>
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl py-8 px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-6 md:p-8 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <MarkdownContent content={doc.value} />
            </div>
          </div>
        </MotionDiv>
      </main>

      {/* Legal Certification Footer */}
      <footer className="container mx-auto max-w-4xl py-8 px-4 md:px-6">
        <div className="p-6 rounded-2xl bg-secondary/30 border border-border/20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Document Reference
          </p>
          <p className="text-xs font-medium text-foreground/70 leading-relaxed font-mono">
            {slug.toUpperCase()}-v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
