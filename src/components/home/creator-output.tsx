import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Sarah L.",
    title: "Course Creator & Marketer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    quote:
      "Comparlify's AI tools cut my course planning time by 70%. The platform comparisons are the most detailed I've found online.",
  },
  {
    name: "Michael R.",
    title: "EdTech Consultant",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    quote:
      "Finally, a site that actually understands the nuances between LMS platforms. No more superficial feature lists—this is real data.",
  },
  {
    name: "Elena G.",
    title: "Content Strategist",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    quote:
      "I use the AI Title Generator for every single blog post now. It consistently out-performs my manual attempts in SEO and CTR.",
  },
];

export function CreatorOutput() {
  return (
    <section className="py-32 relative overflow-hidden bg-secondary/0">
      <div className="absolute inset-0 bg-grid-pattern-light opacity-5 pointer-events-none"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2 shadow-sm">
            <Star className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Network Verification
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.9]">
            Verified <span className="text-primary italic">Creator</span> Output
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            Real results from the world's most innovative course creators using
            Comparlify Intelligence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((t, i) => (
            <MotionDiv
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full bg-card/60 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-xl relative overflow-hidden border-t-4 border-t-primary/20">
                <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none translate-x-8 -translate-y-8">
                  <Sparkles className="h-32 w-32" />
                </div>
                <div className="flex flex-col h-full justify-between gap-12 relative z-10">
                  <div className="space-y-8">
                    <div className="flex items-center space-x-1 text-amber-500 bg-amber-500/5 w-fit px-3 py-1.5 rounded-full border border-amber-500/10">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-xl font-medium text-foreground leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2">
                      "{t.quote}"
                    </blockquote>
                  </div>
                  <div className="flex items-center space-x-6 pt-8 border-t border-border/10">
                    <Avatar className="h-14 w-14 ring-4 ring-primary/10 border-2 border-background shadow-xl">
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback>{t.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-black text-foreground text-base uppercase tracking-tight">
                        {t.name}
                      </div>
                      <div className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                        {t.title}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
