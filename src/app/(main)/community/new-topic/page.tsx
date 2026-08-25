import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { NewTopicForm } from "../_components/new-topic-form";
import { Breadcrumbs } from "@/components/breadcrumb";
import { MotionDiv } from "@/components/motion-wrapper";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewTopicPage() {
  const categories = await prisma.forumCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="bg-background min-h-screen pt-16 pb-16 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>

      <div className="container mx-auto relative z-10 px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: "Community", href: "/community" },
                  { name: "New Topic" },
                ]}
                className="mb-4"
              />
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Initialize <span className="text-primary italic">Dispatch</span>
              </h1>
            </div>
            <Button
              asChild
              variant="ghost"
              className="h-10 px-6 rounded-xl gap-2 font-extrabold uppercase tracking-widest text-xs hover:bg-primary/10 text-primary self-start md:self-auto"
            >
              <Link href="/community">
                <ChevronLeft className="h-4 w-4" /> Back to Collective
              </Link>
            </Button>
          </div>
        </MotionDiv>

        <Suspense
          fallback={
            <div className="w-full h-96 flex items-center justify-center bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/10 animate-pulse">
              <div className="text-center">
                <div className="text-lg font-black uppercase tracking-widest text-muted-foreground mb-4">
                  Re-Calculating Signal
                </div>
                <div className="w-12 h-1 bg-primary mx-auto rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-primary/20 animate-shimmer" />
                </div>
              </div>
            </div>
          }
        >
          <NewTopicForm categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
