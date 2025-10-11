
'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Home, Settings, Table, PenSquare, BookText, GitCompareArrows, Users, Globe, Send, MessageCircle, Mail } from "lucide-react";


export function AdminNav() {
    const pathname = usePathname();

    const navItems = [
        {
            group: "Overview",
            items: [
                { href: "/admin", label: "Dashboard", Icon: Home },
            ]
        },
        {
            group: "Content Management",
            items: [
                { href: "/admin/content", label: "Site Content", Icon: Globe },
                { href: "/admin/blog", label: "Blog", Icon: BookText },
                { href: "/admin/comparisons", label: "Comparisons", Icon: GitCompareArrows },
            ]
        },
        {
            group: "Data Management",
            items: [
                { href: "/admin/platforms", label: "Platforms", Icon: Table },
                { href: "/admin/features", label: "Features", Icon: PenSquare },
            ]
        },
        {
            group: "Communication",
            items: [
                { href: "/admin/emails", label: "Emails", Icon: Send },
                { href: "/admin/comments", label: "Comments", Icon: MessageCircle },
                { href: "/admin/contacts", label: "Contacts", Icon: Mail },
            ]
        },
        {
            group: "Administration",
            items: [
                { href: "/admin/users", label: "Users", Icon: Users },
                { href: "/admin/settings", label: "Settings", Icon: Settings },
            ]
        }
    ];

    return (
        <SidebarMenu>
            {navItems.map(group => (
                <SidebarGroup key={group.group}>
                    <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
                    {group.items.map(item => (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href}>
                                <SidebarMenuButton
                                    tooltip={item.label}
                                    isActive={pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin')}
                                >
                                    <item.Icon />
                                    {item.label}
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>
            ))}
        </SidebarMenu>
    );
}
