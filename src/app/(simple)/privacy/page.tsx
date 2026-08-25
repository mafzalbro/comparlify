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
                items={[
                  { name: "Home", href: "/" },
                  { name: "Privacy Policy" },
                ]}
                className="mb-4 justify-center"
              />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest leading-none">
                  Privacy Policy
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-4">
                Privacy <span className="text-primary italic">Policy</span>
              </h1>

              <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Last Updated: {lastUpdated}</span>
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
              <MarkdownContent content={content["privacy.policy"]} />
            </div>
          </div>
        </MotionDiv>
      </main>

      <footer className="container mx-auto max-w-4xl py-8 px-4 md:px-6">
        <div className="p-6 rounded-2xl bg-secondary/30 border border-border/20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Our Commitment
          </p>
          <p className="text-xs font-medium text-foreground/70 leading-relaxed font-mono italic">
            "We believe privacy is a fundamental right, not just a feature."
          </p>
        </div>
      </footer>
    </div>
  );
}
