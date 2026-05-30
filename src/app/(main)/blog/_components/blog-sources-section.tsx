import Link from "next/link";
import { Link2 } from "lucide-react";

interface Source {
  title: string;
  url: string;
}

interface BlogSourcesSectionProps {
  sources: Source[];
}

export function BlogSourcesSection({ sources }: BlogSourcesSectionProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <section className="bg-card/20 backdrop-blur-md border border-border/10 rounded-3xl p-8 mt-24 relative overflow-hidden group">
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Link2 className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">
            Industrial Intelligence Sources
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source, index) => (
            <Link
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-transparent hover:border-primary/20 transition-all hover:bg-background/60 group/link"
            >
              <span className="text-sm font-bold text-foreground truncate mr-4">
                {source.title}
              </span>
              <div className="h-2 w-2 rounded-full bg-primary/20 group-hover/link:bg-primary transition-colors" />
            </Link>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground/60 font-medium italic">
          * This report utilizes raw data signals from the Comparlify Intelligence Engine and the verified sources listed above.
        </p>
      </div>
    </section>
  );
}
