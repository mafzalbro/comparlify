"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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

  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 10);
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 300) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

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
          "text-sm font-medium transition-colors hover:text-primary relative group",
          isActive ? "font-semibold text-primary" : "text-muted-foreground",
        )}
      >
        {label}
        <span
          className={cn(
            "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary/40 rounded-full transition-all duration-300 group-hover:w-full",
            isActive && "w-1/2 bg-primary",
          )}
        />
      </Link>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled && !hidden ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 top-0 h-32 bg-linear-to-b from-background via-background/80 to-transparent z-40 pointer-events-none"
      />
      <motion.header
        layout
        variants={{
          visible: { y: scrolled ? 10 : 0 },
          hidden: { y: "-150%" },
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "sticky top-0 z-50 mx-auto flex items-center border transition-all duration-500 left-0 right-0 self-center",
          scrolled
            ? "w-[95%] max-w-7xl rounded-full border-border/40 bg-card/60 backdrop-blur-xl shadow-lg"
            : "mt-0 w-full max-w-full rounded-none border-transparent border-b-border/20 bg-card/30 backdrop-blur-md shadow-none flex justify-center items-center",
        )}
      >
        <div className="w-full px-4 sm:container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo siteName={siteName} noLink={true} />
            </Link>
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
      </motion.header>
    </>
  );
}
