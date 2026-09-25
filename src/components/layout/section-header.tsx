import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MICRO_LABEL } from "@/lib/design-tokens";

interface SectionHeaderProps {
  icon?: LucideIcon;
  label: string;
  title?: string;
  className?: string;
}

/**
 * Shared "micro-label + heading" section header used across compare and
 * tools pages so every section reads the same way.
 */
export function SectionHeader({ icon: Icon, label, title, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <span className={cn("text-primary", MICRO_LABEL)}>{label}</span>
        <span className="h-px w-8 bg-border" aria-hidden="true" />
      </div>
      {title && (
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          {title}
        </h2>
      )}
    </div>
  );
}
