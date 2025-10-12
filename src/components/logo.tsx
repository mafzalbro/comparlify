import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, siteName = 'Comparlify', sidebar }: { className?: string, siteName: string }) {
  return (
    <Link href="/" className={cn('font-headline text-2xl font-bold text-foreground flex items-center justify-center h-10', className)}>
      <span className="group-data-[state=expanded]/sidebar-wrapper:inline group-data-[state=collapsed]/sidebar-wrapper:hidden">{siteName}</span>
    </Link>
  );
}
