'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getContent } from '@/lib/content';


export function Logo({ className }: { className?: string }) {
  const [content, setContent] = useState<any>(null);

  if (!content) {
    return null;
  }


  useEffect(() => {
    getContent().then(setContent);
  }, []);



  const siteName = content['global.siteName'] || 'Comparlify';

  return <Link href="/" className={cn('font-headline text-2xl font-bold text-foreground', className)}>
    {siteName}
  </Link>;
}
