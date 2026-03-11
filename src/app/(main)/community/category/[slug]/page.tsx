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
      <header className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Community", href: "/community" },
                { name: category.name },
              ]}
              className="mb-8"
            />

            <div className="flex flex-col md:flex-row justify-between md:items-end gap-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-widest leading-none">
                    Forum Category
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight mb-6">
                  {category.name}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {category.description ||
                    "Dive into discussions, share your expertise, and connect with other creators in this dedicated forum space."}
                </p>
              </div>

              <div className="flex flex-col gap-4 min-w-[200px]">
                <Button
                  asChild
                  size="xl"
                  disabled={!session?.user}
                  className="rounded-2xl px-8 h-14 font-black gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Link href={`/community/new-topic?category=${category.id}`}>
                    <PlusCircle className="h-5 w-5" /> Start Discussion
                  </Link>
                </Button>
                {!session?.user && (
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center md:text-right">
                    Login to Participate
                  </p>
                )}
              </div>
            </div>
          </MotionDiv>
        </div>
      </header>

      <main className="container py-12 px-4 md:px-6">
        {/* Category Filters/Sort Bar */}
        <div className="flex items-center justify-between mb-12 p-6 bg-card/40 backdrop-blur-xl border border-border/10 rounded-[2rem] shadow-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-primary">
              <LayoutGrid className="h-5 w-5" />
              <span className="font-bold tracking-tight">
                Viewing All Topics
              </span>
            </div>
            <div className="h-4 w-px bg-border/20 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-bold">Latest First</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="px-3 py-1 bg-primary/5 text-primary border-primary/10 rounded-lg"
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
      <section className="container max-w-5xl py-24 px-4 md:px-6 text-center">
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
