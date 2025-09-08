
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
import { Home, Settings, Table, PenSquare, LogOut, BookText, GitCompareArrows, Users, LayoutDashboard, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { UserNav } from "@/components/user-nav";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Logo />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/admin">
                                <SidebarMenuButton tooltip="Dashboard">
                                    <Home />
                                    Dashboard
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarGroup>
                            <SidebarGroupLabel>Manage</SidebarGroupLabel>
                            <SidebarMenuItem>
                                <Link href="/admin/blog">
                                    <SidebarMenuButton tooltip="Blog">
                                        <BookText />
                                        Blog
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/comments">
                                    <SidebarMenuButton tooltip="Comments">
                                        <MessageCircle />
                                        Comments
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/comparisons">
                                    <SidebarMenuButton tooltip="Comparisons">
                                        <GitCompareArrows />
                                        Comparisons
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/platforms">
                                    <SidebarMenuButton tooltip="Platforms">
                                        <Table />
                                        Platforms
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/features">
                                    <SidebarMenuButton tooltip="Features">
                                        <PenSquare />
                                        Features
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/users">
                                    <SidebarMenuButton tooltip="Users">
                                        <Users />
                                        Users
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarGroup>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/admin/settings">
                                <SidebarMenuButton tooltip="Settings">
                                    <Settings />
                                    Settings
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                           <Link href="/panel">
                             <SidebarMenuButton tooltip="User Panel">
                               <LayoutDashboard />
                               User Panel
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
                             <SidebarMenuItem>
                                <UserNav user={session.user} />
                             </SidebarMenuItem>
                         )}
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex items-center justify-between p-4 border-b">
                    <SidebarTrigger />
                    <h1 className="text-2xl font-headline">Admin Dashboard</h1>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
