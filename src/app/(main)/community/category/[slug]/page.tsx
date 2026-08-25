import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { cache } from "react";
import { Breadcrumbs } from "@/components/breadcrumb";
import { TopicList } from "../../_components/topic-list";
import { auth } from "@/lib/auth";
import { MotionDiv } from "@/components/motion-wrapper";
import {
  MessageSquare,
  PlusCircle,
  Sparkles,
  Filter,
  LayoutGrid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCommunityStats } from "@/lib/community";

const getCategory = cache(async (slug: string) => {
  return prisma.forumCategory.findUnique({
    where: { slug },
    include: {
      topics: {
        where: { status: "APPROVED" },
        include: {
          author: true,
          _count: {
            select: { posts: { where: { status: "APPROVED" } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const category = await getCategory(slug);
  if (!category) return {};

  return generateSeoMetadata({
    title: `${category.name} Discussions - Community`,
    description: category.description,
    path: `/community/category/${category.slug}`,
  });
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const [category, stats, session] = await Promise.all([
    getCategory(slug),
    getCommunityStats(),
    auth(),
  ]);

  if (!category) {
    notFound();
  }

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
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Community", href: "/community" },
                { name: category.name },
              ]}
              className="mb-4"
            />

            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold uppercase tracking-widest leading-none">
                    Forum Category
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-3">
                  {category.name}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {category.description ||
                    "Dive into discussions, share your expertise, and connect with other creators in this dedicated forum space."}
                </p>
              </div>

              <div className="flex flex-col gap-2 min-w-[180px]">
                <Button
                  asChild
                  size="default"
                  disabled={!session?.user}
                  className="rounded-full px-6 h-11 font-extrabold gap-2 shadow-md shadow-primary/20 transition-all hover:scale-102 active:scale-98 text-xs uppercase tracking-widest"
                >
                  <Link href={`/community/new-topic?category=${category.id}`}>
                    <PlusCircle className="h-4 w-4" /> Start Discussion
                  </Link>
                </Button>
                {!session?.user && (
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center md:text-right">
                    Login to Participate
                  </p>
                )}
              </div>
            </div>
          </MotionDiv>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6">
        {/* Category Filters/Sort Bar */}
        <div className="flex items-center justify-between mb-8 p-4 bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <LayoutGrid className="h-4 w-4" />
              <span className="font-bold tracking-tight text-sm">
                Viewing All Topics
              </span>
            </div>
            <div className="h-4 w-px bg-border/20 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <Filter className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">Latest First</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="px-2.5 py-0.5 bg-primary/10 text-primary border-none rounded-full text-xs font-bold"
            >
              {category.topics.length} Discussions
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <TopicList topics={category.topics} />
          </MotionDiv>
        </div>
      </main>

      {/* Social Proof Section at Bottom */}
      <section className="container mx-auto max-w-5xl py-24 px-4 md:px-6 text-center">
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 rounded-[2.5rem] bg-secondary/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 translate-x-8 -translate-y-8 select-none pointer-events-none">
            <Sparkles className="h-48 w-48" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-4">
            Can't find what you need?
          </h3>
          <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
            Our global search covers {stats.totalMessages.toLocaleString()}{" "}
            dispatches and verified blog insights across the network.
          </p>
          <Button
            asChild
            variant="outline"
            size="xl"
            className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest text-sm backdrop-blur-md"
          >
            <Link href="/search">Try Advanced Search</Link>
          </Button>
        </MotionDiv>
      </section>
    </div>
  );
}
