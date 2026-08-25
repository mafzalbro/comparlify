"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, FileText, ChevronDown, Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumb";
import { MotionDiv } from "@/components/motion-wrapper";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ToolDefinition, CATEGORIES } from "@/data/tools/registry";
import { trackToolEvent } from "@/lib/telemetry";

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export function ToolLayout({ tool, children }: ToolLayoutProps) {
  useEffect(() => {
    trackToolEvent({
      toolId: tool.id,
      category: tool.category,
      event: "view",
    });
  }, [tool.id, tool.category]);
  const categoryMeta = CATEGORIES[tool.category];
  const subcategories = categoryMeta.subcategories as Record<string, string> | undefined;
  const subcategoryName = tool.subcategory && subcategories ? subcategories[tool.subcategory] : undefined;

  // Build breadcrumbs path
  const breadcrumbItems: { name: string; href?: string }[] = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools" },
    { name: categoryMeta.name, href: `/tools/${tool.category}` },
  ];

  if (tool.subcategory && subcategoryName) {
    breadcrumbItems.push({
      name: subcategoryName,
      href: `/tools/${tool.category}/${tool.subcategory}`,
    });
  }

  breadcrumbItems.push({ name: tool.title });

  // Generate WebApplication / SoftwareApplication JSON-LD Schema
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.title,
    "description": tool.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
    },
    "provider": {
      "@type": "Organization",
      "name": "Comparlify",
      "url": "https://www.comparlify.com"
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />
      <Breadcrumbs items={breadcrumbItems} className="mb-6 p-0" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full">
            {categoryMeta.name}
          </span>
          {subcategoryName && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border/40 text-muted-foreground px-2.5 py-0.5 rounded-full">
              {subcategoryName}
            </span>
          )}
          {tool.tag && (
            <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              {tool.tag} Priority
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-foreground">
          {tool.title}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed font-medium">
          {tool.description}
        </p>
      </MotionDiv>

      {/* ── Interactive Workspace (Mounted children) ─────────────────── */}
      <div className="mb-12">
        <Card className="p-4 md:p-6 bg-card/40 border border-border/40 hover:border-border/60 transition-colors backdrop-blur-md rounded-2xl">
          {children}
        </Card>
      </div>

      {/* ── Educational Content ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-border/10">
        <div className="lg:col-span-2 space-y-10">
          {/* What is X? */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              What does the {tool.title} do?
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-line">
              {tool.whatIsIt}
            </div>
          </section>

          {/* How to use X? */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              How to use the {tool.title}?
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-line">
              {tool.howToUse}
            </div>
          </section>

          {/* Usage Example (Optional) */}
          {tool.example && (
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">
                Example Usage & Expected Outputs
              </h3>
              <pre className="p-4 rounded-xl bg-secondary/80 border border-border/40 text-xs font-mono overflow-x-auto text-muted-foreground leading-relaxed">
                {tool.example}
              </pre>
            </section>
          )}

          {/* FAQ Section */}
          {tool.faqs && tool.faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Frequently Asked Questions (FAQ)
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {tool.faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="border border-border/10 bg-card/10 rounded-xl px-4 overflow-hidden"
                  >
                    <AccordionTrigger className="text-sm font-bold py-3.5 hover:no-underline hover:text-primary transition-colors text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed font-medium pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}
        </div>

        {/* Sidebar / Extra info */}
        <div className="space-y-6">
          <Card className="p-5 bg-secondary/20 border border-border/30 rounded-2xl">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-3">
              Security & Privacy Guaranteed
            </h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-3">
              All operations for the <strong className="text-foreground">{tool.title}</strong> are processed
              entirely within your client browser.
            </p>
            <div className="text-[10px] text-muted-foreground/60 font-semibold flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% Client-Side. No servers involved.
            </div>
          </Card>

          <Card className="p-5 bg-card/25 border border-border/20 rounded-2xl">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-3">
              Need to Switch Platforms?
            </h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4">
              Switching from Kajabi to Skool, or Teachable to Mighty Networks? Calculate your potential fee savings.
            </p>
            <Link
              href="/tools/calculators/pricing"
              className="inline-flex w-full items-center justify-center py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-102 active:scale-98"
            >
              Analyze Your Savings <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
