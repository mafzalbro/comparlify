import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getContent } from '@/lib/content';

export function Logo({ className, siteName = 'Comparlify' }: { className?: string, siteName: string }) {
  return (
    <Link href="/" className={cn('font-headline text-2xl font-bold text-foreground', className)}>
      {siteName}
    </Link>
  );
}
