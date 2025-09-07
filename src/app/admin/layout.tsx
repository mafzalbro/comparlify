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
import { Home, Settings, Table, PenSquare, LogOut, BookText, GitCompareArrows } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { signOut } from "@/lib/auth";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                                {/* <Link href="/admin/features"> */}
                                <SidebarMenuButton tooltip="Features" disabled>
                                    <PenSquare />
                                    Features
                                </SidebarMenuButton>
                                {/* </Link> */}
                            </SidebarMenuItem>
                        </SidebarGroup>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            {/* <Link href="/admin/settings"> */}
                            <SidebarMenuButton tooltip="Settings" disabled>
                                <Settings />
                                Settings
                            </SidebarMenuButton>
                            {/* </Link> */}
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <LogoutButton>
                                <SidebarMenuButton tooltip="Logout">
                                    <LogOut />
                                    Logout
                                </SidebarMenuButton>
                            </LogoutButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <div className="flex items-center gap-2 p-2">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/100/100?random=admin" alt="Admin" data-ai-hint="person photo" />
                                    <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Admin User</span>
                                    <span className="text-xs text-muted-foreground">admin@comparlify.com</span>
                                </div>
                            </div>
                        </SidebarMenuItem>
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
