
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { signOut, type Session } from 'next-auth/react';
import { ScrollArea } from '../ui/scroll-area';

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
    const pathname = usePathname();

    const NavLink = ({ href, label }: { href: string; label: string }) => {
        const isActive = (href === '/' && pathname === href) || (href !== '/' && pathname.startsWith(href));
        return (
            <Link
              href={href}
              className={cn(
                'text-lg font-medium transition-colors hover:text-primary',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              onClick={() => setSheetOpen(false)}
            >
              {label}
            </Link>
        )
    };

    return (
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">A menu with links to navigate the website.</SheetDescription>
            <Logo />
          </SheetHeader>
          <ScrollArea className="flex-1 p-4">
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
              </nav>
          </ScrollArea>
          <div className="p-4 border-t flex flex-col gap-2">
             {session ? (
              <>
                <Button variant="outline" asChild>
                  <Link href="/panel" onClick={() => setSheetOpen(false)}>User Panel</Link>
                </Button>
                 <Button variant="outline" asChild>
                  <Link href="/profile" onClick={() => setSheetOpen(false)}>My Profile</Link>
                </Button>
                {session.user.role === 'ADMIN' && (
                   <Button variant="outline" asChild>
                      <Link href="/admin" onClick={() => setSheetOpen(false)}>Admin Panel</Link>
                   </Button>
                )}
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
        </SheetContent>
      </Sheet>
    );
}
