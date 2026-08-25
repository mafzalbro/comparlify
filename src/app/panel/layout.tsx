import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getNotifications } from "@/app/actions/notifications";
import { getSiteName } from "@/lib/content";
import { PanelNav } from "./_components/panel-nav";
import { headers } from "next/headers";
import { checkAuthorization } from "@/lib/authorization";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/panel";

  // Perform authorization check for all panel routes
  await checkAuthorization(session, pathname);

  // We can safely assume session and user exist after the check
  const user = session!.user;

  const { notifications, unreadCount } = await getNotifications();
  const siteName = await getSiteName();

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/50 bg-secondary/30 dark:bg-background/50 backdrop-blur-xl">
        <SidebarHeader className="h-16 flex items-center border-b border-border/50">
          <Logo
            siteName={siteName}
            sidebar
            className="justify-start scale-90 origin-left"
          />
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <PanelNav user={user} />
        </SidebarContent>
        <SidebarFooter className="border-t border-border/50">
          <SidebarMenu>
            {user.role === "ADMIN" && (
              <SidebarMenuItem>
                <Link href="/admin">
                  <SidebarMenuButton tooltip="Admin Panel">
                    <ShieldCheck />
                    Admin Panel
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <LogoutButton>
                <SidebarMenuButton tooltip="Logout">
                  <LogOut />
                  Logout
                </SidebarMenuButton>
              </LogoutButton>
            </SidebarMenuItem>
            {user && (
              <div className="p-2 flex items-center justify-center">
                <UserNav user={user} />
              </div>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 md:px-6 bg-card/60 backdrop-blur-md border-b border-border/40 shadow-xs">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hover:bg-primary/10 transition-colors h-9 w-9" />
            <div className="h-4 w-px bg-border/40 mx-1 hidden md:block" />
            <h1 className="text-lg font-extrabold tracking-tight opacity-90">
              User Panel
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 mr-1">
              <ThemeToggle />
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>
            {user && <UserNav user={user} />}
          </div>
        </header>
        <main className="p-4 md:p-6 animate-fade-in-up">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
