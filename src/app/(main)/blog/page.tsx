import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumb";
import { FilterControls } from "./_components/filter-controls";
import { getContent } from "@/lib/content";
import { MotionDiv } from "@/components/motion-wrapper";
import { PremiumNewsletterForm } from "@/components/premium-newsletter-form";
import type { SearchParams } from "@/types/next";
import { BlogPostsList } from "./_components/blog-posts-list";
import { BlogCardsSkeleton } from "./_components/blog-skeletons";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Creator Insights | The Comparlify Blog",
    description:
      "Actionable advice, deep dives, and growth strategies for the modern course creator. Stay ahead with AI insights.",
    path: "/blog",
  });
}

const getAuthors = cache(async () => {
  return prisma.user.findMany({
    where: { posts: { some: { published: true } } },
  });
});

const getPostCategories = cache(async () => {
  return prisma.postCategory.findMany({ orderBy: { name: "asc" } });
});

export default async function BlogPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const [authors, categories, content] = await Promise.all([
    getAuthors(),
    getPostCategories(),
    getContent(),
  ]);

  if (content["module.blog.enabled"] === "false") {
    notFound();
  }

  // Generate a key for Suspense so that any parameter changes (search, category, etc.)
  // trigger the Loading / Suspense skeleton instead of doing full page blanking.
  const filterKey = `${searchParams.search ?? ""}-${searchParams.category ?? ""}-${searchParams.author ?? ""}-${searchParams.sort ?? ""}`;

  return (
    <div className="bg-background min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-10 pb-8 overflow-hidden border-b border-border/20">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>

        <div className="container mx-auto relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <Breadcrumbs
                items={[{ name: "Home", href: "/" }, { name: "Insights" }]}
                className="mb-4 justify-center"
              />
              <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                Creator{" "}
                <span className="text-amber-500 italic font-semibold">
                  Insights
                </span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto font-medium">
                {content["blog.hero.subtitle"] ||
                  "Master the art of course creation with curated deep dives and surgical expert perspectives."}
              </p>
            </div>
          </MotionDiv>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4 md:px-6">
        {/* --- DYNAMIC FILTER SECTION --- */}
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 max-w-5xl mx-auto"
        >
          <div className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl shadow-sm">
            <FilterControls
              authors={authors}
              categories={categories}
              searchParams={searchParams}
            />
          </div>
        </MotionDiv>

        {/* --- SUSPENDED POSTS LIST --- */}
        <div className="max-w-6xl mx-auto">
          <Suspense key={filterKey} fallback={<BlogCardsSkeleton />}>
            <BlogPostsList searchParams={searchParams} content={content} />
          </Suspense>
        </div>
      </div>

      {/* --- NEWSLETTER BLOCK --- */}
      <section className="relative overflow-hidden bg-background py-20 border-t border-border/10">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 md:px-6 relative z-10"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              Join the{" "}
              <span className="text-amber-500 italic font-semibold">
                Creator Hub
              </span>
            </h2>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed font-medium max-w-xl mx-auto">
              The most critical creation strategies and tech breakthroughs,
              delivered with surgical precision every Monday.
            </p>

            <div className="flex justify-center">
              <PremiumNewsletterForm
                buttonText="Secure Access"
                accentColor="blue-500"
                containerClassName="bg-card/30 border-border/40 p-3 rounded-2xl shadow-sm max-w-xl w-full"
              />
            </div>
          </div>
        </MotionDiv>
      </section>
    </div>
  );
}
