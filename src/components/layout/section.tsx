import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  withGlow?: boolean;
  className?: string;
  children: ReactNode;
}

interface SectionHeaderProps {
  title?: string;
  subtitle?: string;
  supertitle?: string;
  centered?: boolean;
  className?: string;
}

export function Section({ id, withGlow, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("relative w-full py-20 px-4", className)}>
      {withGlow && (
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
        </div>
      )}
      <div className="container mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  supertitle,
  centered,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-16 flex flex-col gap-4",
        centered && "items-center text-center",
        className,
      )}
    >
      {supertitle && (
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">
          {supertitle}
        </p>
      )}
      {title && (
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.05]">
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className={cn(
            "text-base md:text-lg text-muted-foreground leading-relaxed",
            centered && "max-w-2xl",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
