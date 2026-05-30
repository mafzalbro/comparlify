import { BarChart3 } from "lucide-react";

interface Fact {
  title: string;
  value: string;
}

interface BlogFactsSidebarProps {
  facts: Fact[];
}

export function BlogFactsSidebar({ facts }: BlogFactsSidebarProps) {
  if (!facts || facts.length === 0) return null;

  return (
    <section className="bg-card/40 backdrop-blur-3xl border border-border/10 p-8 rounded-4xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
        <BarChart3 className="h-32 w-32" />
      </div>

      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">
            Facts at a Glance
          </h3>
        </div>

        <div className="space-y-6">
          {facts.map((fact, index) => (
            <div key={index} className="space-y-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                {fact.title}
              </p>
              <p className="text-lg font-black text-foreground uppercase tracking-tight">
                {fact.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
