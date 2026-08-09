import { getVerifiedStacks } from "@/app/actions/stacks";
import { StackCard } from "@/components/verification/stack-card";
import { VerifiedStacksHero } from "@/components/verification/hero";
import { generateSeoMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { ShieldCheck, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = await generateSeoMetadata({
  title: "Verified Creator Stacks | Comparlify",
  description: "Browse verified technology stacks used by professional course creators. See the real infrastructure behind million-dollar academies.",
  path: "/community/verified-stacks",
});

export default async function VerifiedStacksPage() {
  const stacks = await getVerifiedStacks();

  return (
    <div className="min-h-screen bg-background pb-20">
      <VerifiedStacksHero />

      <div className="container mx-auto px-4 md:px-6 -mt-10 relative z-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-4xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
                <h2 className="text-2xl font-black tracking-tight mb-1 italic">Stack <span className="text-primary not-italic uppercase tracking-widest text-lg">Leaderboard</span></h2>
                <p className="text-xs text-muted-foreground font-medium italic">Ordered by verification status and software efficiency.</p>
            </div>
          </div>

          <Link 
            href="/community/verified-stacks/share" 
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-black font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 group"
          >
            Share My Stack <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
          </Link>
        </div>

        {stacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {stacks.map((stack: any) => (
              <StackCard key={stack.id} stack={stack} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center rounded-[3rem] bg-muted/20 border border-dashed border-border/20">
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-xl font-black tracking-tight mb-2 opacity-60 italic">Waiting for submissions</h3>
            <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed italic">
                Our team is currently reviewing the first batch of creator tech stacks. 
                Be the first to share yours.
            </p>
            <Link 
              href="/community/verified-stacks/share" 
              className="inline-block mt-8 text-primary font-black uppercase text-[10px] tracking-[0.3em] hover:opacity-70 transition-opacity"
            >
                Submit for Verification &rarr;
            </Link>
          </div>
        )}

        <div className="mt-20 p-12 rounded-[4rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                    <h3 className="text-3xl font-black tracking-tighter mb-4 italic leading-none">Why verify your <span className="text-primary">stack?</span></h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-6 italic opacity-80">
                        Credibility is essential in the creator economy. Sharing your stack proves to your students and peers 
                        that you run a professional operation on reliable software.
                    </p>
                    <ul className="space-y-3">
                        {[
                            "Increase student trust in your platform delivery",
                            "Get featured on the Comparlify homepage",
                            "Receive direct feedback from our stack engineers",
                            "Unlock premium affiliate deals on migration tools"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground italic">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-full md:w-auto h-48 aspect-video rounded-3xl bg-black border border-border/10 shadow-2xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Plus className="h-12 w-12 text-primary opacity-20" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
