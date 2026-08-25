import { MotionDiv } from "@/components/motion-wrapper";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Users, PlusCircle, MessageSquare } from "lucide-react";

export function CommunityHero() {
  return (
    <section className="relative pt-16 pb-12 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
      <div className="container relative z-10 px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <Breadcrumbs
              items={[{ name: "Home", href: "/" }, { name: "Community" }]}
              className="mb-4 justify-center"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4 shadow-xs">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">
                Creator Intelligence Network
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-4">
              The Collective <span className="text-primary italic">Intelligence</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mb-8 font-medium">
              Connect with thousands of elite creators sharing raw data, surgical strategies, and verified breakthroughs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="default"
                className="rounded-full px-6 h-11 font-extrabold gap-2 shadow-md shadow-primary/20 hover:scale-102 active:scale-98 transition-all text-xs uppercase tracking-widest"
              >
                <NextLink href="/community/new-topic">
                  <PlusCircle className="h-4 w-4" /> Start Discussion
                </NextLink>
              </Button>
              <Button
                asChild
                variant="outline"
                size="default"
                className="rounded-full px-6 h-11 font-extrabold gap-2 border-border/40 hover:bg-secondary/50 transition-all text-xs uppercase tracking-widest"
              >
                <NextLink href="#categories">
                  <MessageSquare className="h-4 w-4" /> All Categories
                </NextLink>
              </Button>
            </div>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
