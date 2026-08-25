import NextLink from "next/link";
import {
  ArrowRight,
  Search,
  Zap,
  FileText,
  BrainCircuit,
  LucideIcon,
} from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";

interface CoreCategory {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const coreCategories: CoreCategory[] = [
  {
    title: "Course Platforms",
    description: "Compare Kajabi, Teachable, Thinkific and more.",
    icon: Zap,
    href: "/compare",
  },
  {
    title: "AI Creation Tools",
    description: "Generate outlines, scripts, and catchy titles.",
    icon: BrainCircuit,
    href: "/tools",
  },
  {
    title: "Expert Guides",
    description: "In-depth tutorials on growing your online business.",
    icon: FileText,
    href: "/blog",
  },
];

export function DiscoveryHub() {
  return (
    <section className="py-8 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-xs">
            <Search className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold">
              Discovery Hub
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            Surgical <span className="text-primary italic">Intelligence</span> for Creators
          </h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Every tool, every platform, every strategy—vetted and verified for your absolute growth.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {coreCategories.map((cat, i) => (
            <MotionDiv
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <NextLink href={cat.href} className="group block h-full">
                <div className="h-full p-5 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300 shadow-xs">
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-[10px] font-extrabold text-primary uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                    Access Intelligence <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </div>
                </div>
              </NextLink>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
