import { format } from "date-fns";
import { Breadcrumbs } from "@/components/breadcrumb";
import { getContent } from "@/lib/content";
import { MarkdownContent } from "@/components/markdown-content";
import { MotionDiv } from "@/components/motion-wrapper";
import { ShieldCheck, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const content = await getContent();
  const lastUpdated = format(new Date(), "MMMM d, yyyy");

  return (
    <div className="bg-background min-h-screen">
      <header className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
        <div className="container mx-auto relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: "Privacy Policy" },
                ]}
                className="mb-8 justify-center"
              />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-widest leading-none">
                  Privacy Policy
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] mb-8">
                Privacy <span className="text-primary italic">Policy</span>
              </h1>

              <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Last Updated: {lastUpdated}</span>
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </header>

      <main className="container mx-auto max-w-screen-xl py-12 px-1.5 md:px-8">
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-strong:text-foreground/90 prose-a:text-primary p-8 md:p-12 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
              <Sparkles className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <MarkdownContent content={content["privacy.policy"]} />
            </div>
          </div>
        </MotionDiv>
      </main>

      <footer className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
        <div className="p-8 rounded-3xl bg-secondary/50 border border-border/10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Our Commitment
          </p>
          <p className="text-sm font-medium text-foreground/60 leading-relaxed font-mono italic">
            "We believe privacy is a fundamental right, not just a feature."
          </p>
        </div>
      </footer>
    </div>
  );
}
