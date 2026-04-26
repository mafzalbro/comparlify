import { MotionDiv } from "@/components/motion-wrapper";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Users, PlusCircle, MessageSquare } from "lucide-react";
import { CommunitySearch } from "./community-search";
import { Suspense } from "react";

export function CommunityHero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
      <div className="absolute top-0 right-0 p-32 text-primary/5 -rotate-12 translate-x-24 -translate-y-24 select-none pointer-events-none">
        <Users className="h-96 w-96" />
      </div>
      <div className="container relative z-10 px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <Breadcrumbs
              items={[{ name: "Home", href: "/" }, { name: "Community" }]}
              className="mb-10 justify-center"
            />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 shadow-sm">
              <Users className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Creator Intelligence Network
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[0.9] mb-8">
              The Collective <br />
              <span className="text-primary italic">Intelligence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-12 font-medium">
              Connect with thousands of elite creators sharing raw data,
              surgical strategies, and verified breakthroughs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Button
                asChild
                size="xl"
                className="rounded-full px-10 h-14 font-black gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                <NextLink href="/community/new-topic">
                  <PlusCircle className="h-5 w-5" /> Start Discussion
                </NextLink>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="rounded-full px-10 h-14 font-black gap-3 backdrop-blur-xl border-border/10 hover:bg-secondary/50 transition-all text-sm uppercase tracking-widest"
              >
                <NextLink href="#categories">
                  <MessageSquare className="h-5 w-5" /> All Categories
                </NextLink>
              </Button>
            </div>

            <Suspense fallback={<div className="h-16 w-full max-w-xl bg-card/20 rounded-full mt-12 animate-pulse mx-auto" />}>
              <CommunitySearch />
            </Suspense>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
