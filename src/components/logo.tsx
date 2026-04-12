import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  siteName = "Comparlify",
  className,
  sidebar,
  noLink = false,
}: {
  siteName: string;
  className?: string;
  sidebar?: boolean;
  noLink?: boolean;
}) {
  const content = (
    <>
      <span
        className={`group-data-[state=expanded]:inline group-data-[state=collapsed]:hidden text-2xl`}
      >
        {siteName}
      </span>
      {sidebar && (
        <span
          className={`group-data-[state=expanded]:hidden group-data-[state=collapsed]:flex items-center justify-center`}
        >
          <Image
            src="/icon.png"
            alt={siteName}
            width={32}
            height={32}
            className="rounded-lg object-contain"
          />
        </span>
      )}
    </>
  );

  const classes = cn(
    "font-headline text-2xl font-bold text-foreground flex items-center justify-center h-10 transition-all duration-300",
    className,
  );

  if (noLink) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link href="/" className={classes}>
      {content}
    </Link>
  );
}
