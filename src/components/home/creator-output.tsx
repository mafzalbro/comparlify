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
    <section className="py-12 relative overflow-hidden bg-secondary/0">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-xs">
            <Star className="h-3.5 w-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              Network Verification
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Verified <span className="text-primary italic">Creator</span> Output
          </h2>
          <p className="text-sm text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            Real results from the world's most innovative course creators using Comparlify Intelligence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <MotionDiv
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors p-6 rounded-2xl shadow-md relative overflow-hidden">
                <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-1 text-amber-500 bg-amber-500/5 w-fit px-2.5 py-1 rounded-full border border-amber-500/10">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-2.5 w-2.5 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-sm font-medium text-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                      "{t.quote}"
                    </blockquote>
                  </div>
                  <div className="flex items-center space-x-4 pt-4 border-t border-border/20">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/10 border border-background">
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback>{t.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-extrabold text-foreground text-sm tracking-tight">
                        {t.name}
                      </div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
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
