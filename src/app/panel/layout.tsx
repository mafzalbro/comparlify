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
  SidebarGroup,
  SidebarGroupLabel,
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
