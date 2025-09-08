
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { useSession } from 'next-auth/react';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from '../theme-toggle';
import { UserNav } from '../user-nav';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Comparisons' },
  { href: '/blog', label: 'Blog' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = (href === '/' && pathname === href) || (href !== '/' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {status === 'loading' ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <UserNav user={session.user} />
          ) : (
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          )}
        </div>
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          {isClient && <MobileNav navLinks={navLinks} session={session} />}
        </div>
      </div>
    </header>
  );
}
