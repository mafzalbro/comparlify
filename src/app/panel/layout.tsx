
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
import { Settings, LogOut, LayoutDashboard, UserCircle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserNav } from "@/components/user-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getNotifications } from "@/app/actions/notifications";


export default async function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const { notifications, unreadCount } = await getNotifications();

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Logo />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/panel">
                                <SidebarMenuButton tooltip="Dashboard">
                                    <LayoutDashboard />
                                    Dashboard
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarGroup>
                            <SidebarGroupLabel>My Account</SidebarGroupLabel>
                            <SidebarMenuItem>
                                <Link href="/profile">
                                    <SidebarMenuButton tooltip="Profile">
                                        <UserCircle />
                                        Profile
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/panel/settings">
                                    <SidebarMenuButton tooltip="Settings">
                                        <Settings />
                                        Settings
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarGroup>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                         {session?.user.role === 'ADMIN' && (
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
                         {session?.user && (
                             <SidebarMenuItem>
                                <UserNav user={session.user} />
                             </SidebarMenuItem>
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
                        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
