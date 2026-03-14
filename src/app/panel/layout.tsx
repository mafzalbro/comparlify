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
import {
  Settings,
  LogOut,
  LayoutDashboard,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserNav } from "@/components/user-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getNotifications } from "@/app/actions/notifications";
import { getSiteName } from "@/lib/content";
import { PanelNav } from "./_components/panel-nav";
import { headers } from "next/headers";
import { checkAuthorization } from "@/lib/authorization";
import { MotionDiv } from "@/components/motion-wrapper";
import { Breadcrumbs } from "@/components/breadcrumb";
import { ChevronRight } from "lucide-react";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const pathname = (await headers()).get("x-pathname") || "/panel";

  // Perform authorization check for all panel routes
  await checkAuthorization(session, pathname);

  // We can safely assume session and user exist after the check
  const user = session!.user;

  const { notifications, unreadCount } = await getNotifications();
  const siteName = await getSiteName();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
        {/* Universal Background for Panel */}
        <div className="fixed inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-[0.03] pointer-events-none"></div>

        <Sidebar className="border-r border-border/5 bg-card/30 backdrop-blur-3xl">
          <SidebarHeader className="p-8 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center">
            <Logo siteName={siteName} sidebar />
          </SidebarHeader>
          <SidebarContent className="px-4 group-data-[state=collapsed]:px-2">
            <PanelNav user={user} />
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-border/5 group-data-[state=collapsed]:px-0">
            <SidebarMenu className="gap-4">
              {user.role === "ADMIN" && (
                <SidebarMenuItem>
                  <Link href="/admin">
                    <SidebarMenuButton
                      tooltip="Admin Terminal"
                      className="h-12 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] group-data-[state=collapsed]:justify-center"
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">
                        Admin Terminal
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <div className="p-2 flex items-center gap-4 bg-muted/30 rounded-[2rem] border border-border/10 group-data-[state=collapsed]:p-1 group-data-[state=collapsed]:justify-center transition-all duration-300">
                  <UserNav user={user} />
                  <div className="flex flex-col min-w-0 group-data-[state=collapsed]:hidden">
                    <span className="text-xs font-black truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                      {user.role}
                    </span>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <LogoutButton>
                  <SidebarMenuButton
                    tooltip="Terminate Session"
                    className="h-12 rounded-2xl hover:bg-destructive/10 hover:text-destructive font-black uppercase tracking-widest text-[10px] group-data-[state=collapsed]:justify-center"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span className="group-data-[state=collapsed]:hidden">
                      Terminate Session
                    </span>
                  </SidebarMenuButton>
                </LogoutButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-transparent">
          <header className="sticky top-0 z-40 w-full bg-background/50 backdrop-blur-3xl border-b border-border/5">
            <div className="flex h-20 items-center justify-between px-8">
              <div className="flex items-center gap-6">
                <SidebarTrigger className="h-10 w-10 rounded-2xl bg-secondary/50 flex items-center justify-center border border-border/10 hover:bg-secondary transition-colors [&>svg]:h-5 [&>svg]:w-5" />
                <div className="hidden md:block">
                  <Breadcrumbs
                    items={[
                      { name: "Terminal", href: "/panel" },
                      {
                        name:
                          pathname
                            .split("/")
                            .pop()
                            ?.replace(/^\w/, (c) => c.toUpperCase()) ||
                          "Dashboard",
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                />
                <div className="h-10 w-px bg-border/10"></div>
                {user && <UserNav user={user} />}
              </div>
            </div>
          </header>

          <main className="relative flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">
            <MotionDiv
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </MotionDiv>
          </main>
        </SidebarInset>
      </div>
      <Sidebar>
        <SidebarHeader>
          <Logo siteName={siteName} />
        </SidebarHeader>
        <SidebarContent>
          <PanelNav user={user} />
        </SidebarContent>
        <SidebarFooter>
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
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-headline">User Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
            />
            {user && <UserNav user={user} />}
          </div>
        </header>
        <main className="p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
