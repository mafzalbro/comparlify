import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getContent } from '@/lib/content';

export async function Logo({ className }: { className?: string }) {
  const content = await getContent();
  const siteName = content['global.siteName'] || 'Comparlify';
  return (
    <Link href="/" className={cn('font-headline text-2xl font-bold text-foreground', className)}>
      {siteName}
    </Link>
  );
}
