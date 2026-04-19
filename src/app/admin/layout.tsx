import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminNav } from "./_components/admin-nav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getNotifications } from "../actions/notifications";
import { Logo } from "@/components/logo";
import { getSiteName } from "@/lib/content";
import { headers } from "next/headers";
import { checkAuthorization } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const pathname = (await headers()).get("x-pathname") || "/admin";

  // Perform authorization check for all admin routes
  await checkAuthorization(session, pathname);

  // We can safely assume session and user exist after the check
  const user = session!.user;

  const { notifications, unreadCount } = await getNotifications();
  let siteName = await getSiteName();

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
          <AdminNav userRole={user.role} />
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-border/50">
          {user && (
            <div className="flex items-center justify-center">
              <UserNav user={user} />
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
            <div className="h-4 w-px bg-border/50 mx-1 hidden md:block" />
            <h1 className="text-xl font-headline tracking-tight font-black opacity-90">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 mr-2">
              <ThemeToggle />
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>
            {user && <UserNav user={user} />}
          </div>
        </header>
        <main className="admin-panel p-6 md:p-8 animate-fade-in-up">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
