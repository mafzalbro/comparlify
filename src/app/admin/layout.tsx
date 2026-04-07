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
      <Sidebar>
        <SidebarHeader className="overflow-hidden!">
          <Logo siteName={siteName} className="justify-start pl-2" />
        </SidebarHeader>
        <SidebarContent>
          <AdminNav userRole={user.role} />
        </SidebarContent>
        <SidebarFooter>
          {user && (
            <div className="p-2 flex items-center justify-center">
              <UserNav user={user} />
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-headline">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
