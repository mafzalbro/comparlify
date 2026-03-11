import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  siteName = "Comparlify",
  className,
  sidebar,
}: {
  siteName: string;
  className?: string;
  sidebar?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "font-headline text-2xl font-bold text-foreground flex items-center justify-center h-10 transition-all duration-300",
        className,
      )}
    >
      <span
        className={`group-data-[state=expanded]:inline group-data-[state=collapsed]:hidden text-2xl`}
      >
        {siteName}
      </span>
      {sidebar && (
        <span
          className={`group-data-[state=expanded]:hidden group-data-[state=collapsed]:inline italic text-primary font-black`}
        >
          {siteName.charAt(0)}
        </span>
      )}
    </Link>
  );
}
