import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeroProps {
  title: ReactNode;
  subtitle?: string;
  supertitle?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  supertitle,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden pt-32 pb-20 flex flex-col items-center text-center px-4",
        className,
      )}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto w-full flex flex-col items-center gap-6">
        {supertitle && (
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">
            {supertitle}
          </p>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
          {title}
        </h1>

        {subtitle && (
          <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}

        {children && <div className="mt-6 w-full">{children}</div>}
      </div>
    </section>
  );
}
