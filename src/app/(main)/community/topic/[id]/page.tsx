import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Breadcrumbs } from "@/components/breadcrumb";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { TopicPost } from "../../_components/topic-post";
import { ReplyForm } from "../../_components/reply-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  MessageSquare,
  Zap,
  Share2,
  Sparkles,
} from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Button } from "@/components/ui/button";

const getTopic = cache(async (id: string) => {
  return prisma.forumTopic.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      posts: {
        where: { status: "APPROVED" },
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
});

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  const topic = await getTopic(id);
  if (!topic) return {};

  return generateSeoMetadata({
    title: `${topic.title} - Community Discussion`,
    description: topic.content.substring(0, 150),
    path: `/community/topic/${topic.id}`,
  });
}

export default async function TopicPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const [topic, session] = await Promise.all([getTopic(id), auth()]);

  if (!topic) notFound();

  const canView =
    topic.status === "APPROVED" ||
    session?.user?.role === "ADMIN" ||
    session?.user?.id === topic.authorId;

  if (!canView) notFound();

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
                {
                  name: topic.category.name,
                  href: `/community/category/${topic.category.slug}`,
                },
                { name: topic.title },
              ]}
              className="mb-4"
            />

            {topic.status !== "APPROVED" && (
              <Alert
                variant="destructive"
                className="mb-6 p-4 rounded-2xl bg-yellow-50/50 backdrop-blur-md border-yellow-200 text-yellow-900 border"
              >
                <ShieldAlert className="h-5 w-5 text-yellow-600!" />
                <div className="ml-3">
                  <AlertTitle className="text-base font-extrabold uppercase tracking-widest mb-0.5">
                    Under Expert Review
                  </AlertTitle>
                  <AlertDescription className="text-xs font-medium opacity-80 leading-relaxed">
                    This discussion is currently undergoing safety verification.
                    It remains hidden from the global network until cleared.
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className="px-3 py-1 bg-primary/10 text-primary border-primary/20 text-xs font-extrabold uppercase tracking-widest rounded-full">
                    {topic.category.name}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="h-3 w-3" /> Latest Activity Today
                  </div>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  {topic.title}
                </h1>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  asChild
                  size="default"
                  className="rounded-full h-11 px-6 font-extrabold gap-2 uppercase tracking-widest text-xs"
                >
                  <a href="#reply-section">
                    <Zap className="h-4 w-4" /> Post Reply
                  </a>
                </Button>
              </div>
            </div>
          </MotionDiv>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6 max-w-5xl">
        <div className="space-y-12">
          <MotionDiv
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TopicPost
              id={topic.id}
              author={topic.author}
              content={topic.content}
              createdAt={topic.createdAt}
              isTopicPost={true}
            />
          </MotionDiv>

          {topic.posts.length > 0 && (
            <div className="relative pl-8 md:pl-0">
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-primary/20 via-border/10 to-transparent md:-translate-x-1/2"></div>
              {topic.posts.map((post: any, idx: number) => (
                <MotionDiv
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="mt-12 first:mt-0 relative"
                >
                  <div className="absolute top-8 left-0 md:left-1/2 w-8 h-px bg-primary/20 md:-translate-x-1/2"></div>
                  <TopicPost
                    id={post.id}
                    author={post.author}
                    content={post.content}
                    createdAt={post.createdAt}
                  />
                </MotionDiv>
              ))}
            </div>
          )}
        </div>

        <MotionDiv
          id="reply-section"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-primary/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
              <Sparkles className="h-48 w-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tight mb-4 uppercase">
                Contribute{" "}
                <span className="text-primary italic">Expertise</span>
              </h2>
              <p className="text-base text-muted-foreground mb-10 max-w-xl">
                Share your thoughts with the global network. High-signal
                contribution is audited for quality.
              </p>
              <ReplyForm topicId={topic.id} session={session} />
            </div>
          </div>
        </MotionDiv>
      </main>

      {/* Bottom Actions Hint */}
      <section className="container mx-auto max-w-5xl py-24 px-4 md:px-6">
        <div className="flex items-center justify-between p-6 rounded-4xl bg-secondary/50 border border-border/10 overflow-hidden relative">
          <div className="flex items-center gap-6">
            <div className="flex items-center -space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 ring-4 ring-secondary/50"></div>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Certified Discussion Audit
            </p>
          </div>
          <Button
            variant="ghost"
            className="gap-2 font-black uppercase tracking-widest text-xs h-auto group"
          >
            Report Issue{" "}
            <ShieldAlert className="h-4 w-4 transition-transform group-hover:scale-110" />
          </Button>
        </div>
      </section>
    </div>
  );
}
