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
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2 shadow-sm">
            <Search className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-black">
              Discovery Hub
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Surgical <span className="text-primary italic">Intelligence</span>{" "}
            for Creators
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            Every tool, every platform, every strategy—vetted and verified for
            your absolute growth.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {coreCategories.map((cat, i) => (
            <MotionDiv
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <NextLink href={cat.href} className="group block h-full">
                <div className="h-full p-7 rounded-4xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/5 flex flex-col justify-between border-b-4 border-b-transparent group-hover:border-b-primary">
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-md shadow-primary/5">
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-muted-foreground font-medium leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-12 flex items-center text-[10px] font-black text-primary uppercase tracking-[0.3em] group-hover:translate-x-3 transition-transform duration-500">
                    Access Intelligence <ArrowRight className="ml-3 h-4 w-4" />
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
