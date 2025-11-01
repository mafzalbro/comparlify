"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useSession } from "next-auth/react";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "../theme-toggle";
import { UserNav } from "../user-nav";
import { getNotifications } from "@/app/actions/notifications";
import { NotificationBell } from "./notification-bell";
import type { Notification } from "@prisma/client";

type NavLink = {
  href: string;
  label: string;
};

interface HeaderProps {
  navLinks: NavLink[];
  siteName: string;
}

export default function Header({ navLinks = [], siteName }: HeaderProps) {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
    if (session) {
      getNotifications().then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      });
    }
  }, [session]);

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive =
      (href === "/" && pathname === href) ||
      (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive ? "font-semibold text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-3 sm:container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo siteName={siteName} />
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
              />
              <UserNav user={session.user} />
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          )}
        </div>
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          {isClient && (
            <MobileNav
              navLinks={navLinks}
              session={session}
              siteName={siteName}
            />
          )}
        </div>
      </div>
    </header>
  );
}
