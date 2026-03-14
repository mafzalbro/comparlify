import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { MigrationEstimator } from "./_components/migration-estimator";
import { MotionDiv } from "@/components/motion-wrapper";
import { ArrowRightLeft, ShieldAlert, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "True Migration Estimator | Comparlify",
    description:
      "Calculate the hidden costs, manual hours, and data risks of moving your course business between platforms. Get a professional migration roadmap.",
    path: "/tools/migration-estimator",
  });
}

export default async function MigrationEstimatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
          <ArrowRightLeft className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Operational Intelligence
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          True <span className="text-primary italic">Migration Estimator</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Moving your business shouldn't be a guessing game. Quantify the hours,
          costs, and risks of switching course platforms with technical
          precision.
        </p>
      </MotionDiv>

      <MigrationEstimator />

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 pt-20 border-t border-border/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              The <span className="text-primary italic">Switching Cost</span>{" "}
              Trap
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Most creators underestimate the time it takes to move. It's not
              just about the files; it's about the **URL redirects**, the
              **email sequences**, and the **student progress data**. Our
              estimator analyzes these factors to give you a realistic labor
              roadmap.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <p className="text-xs font-bold uppercase tracking-widest leading-normal text-destructive-foreground">
                Warning: High migration complexity can cause up to 48 hours of
                checkout downtime if not managed correctly.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-card border border-border/10 shadow-xl overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">
                Migration Roadmap
              </h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex gap-3">
                  <span className="text-primary">01.</span>
                  <span>
                    Audit existing content hierarchy and video assets.
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">02.</span>
                  <span>Setup "Parallel Sandbox" on the new platform.</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">03.</span>
                  <span>Execute content porting and QA testing.</span>
                </div>
              </div>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5" />
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
