'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { signOut, type Session } from 'next-auth/react';

type NavLink = {
    href: string;
    label: string;
};

interface MobileNavProps {
    navLinks: NavLink[];
    session: Session | null;
}

export function MobileNav({ navLinks, session }: MobileNavProps) {
    const [isSheetOpen, setSheetOpen] = useState(false);

    const NavLink = ({ href, label }: { href: string; label: string }) => (
        <Link
          href={href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            'text-muted-foreground'
          )}
          onClick={() => setSheetOpen(false)}
        >
          {label}
        </Link>
    );

    return (
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="p-4">
            <Logo />
            <nav className="mt-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-4">
               {session ? (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/profile" onClick={() => setSheetOpen(false)}>Profile</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => {
                      setSheetOpen(false);
                      signOut();
                  }}>Log Out</Button>
                </>
              ) : (
                <Button asChild>
                  <Link href="/login" onClick={() => setSheetOpen(false)}>Log In</Link>
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
}
