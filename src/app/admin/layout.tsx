

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
    SidebarFooter
} from "@/components/ui/sidebar";
import { Home, Settings, Table, PenSquare, LogOut, BookText, GitCompareArrows, Users, LayoutDashboard, MessageCircle, Mail, Globe, Send, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserNav } from "@/components/user-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getNotifications } from "@/app/actions/notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSiteName, } from "@/lib/content";
import { AdminNav } from "./_components/admin-nav";


export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const { notifications, unreadCount } = await getNotifications();
    let siteName = await getSiteName()

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="!overflow-hidden">
                        <Logo siteName={siteName} className="justify-start"/>
                </SidebarHeader>
                <SidebarContent>
                    <AdminNav />
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <Link href="/">
                                <SidebarMenuButton tooltip="View Site">
                                    <LayoutDashboard />
                                    View Site
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <LogoutButton>
                                <SidebarMenuButton tooltip="Logout">
                                    <LogOut />
                                    Logout
                                </SidebarMenuButton>
                            </LogoutButton>
                        </SidebarMenuItem>
                        {session?.user && (
                             <div className="p-2 flex items-center justify-center">
                                <UserNav user={session.user} />
                            </div>
                        )}
                    </SidebarMenu>
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
                        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
                        {session?.user && <UserNav user={session.user} />}
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
