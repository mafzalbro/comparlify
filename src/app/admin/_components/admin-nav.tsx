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
import { Home, Settings, Table, PenSquare, BookText, GitCompareArrows, Users, Globe, Send, MessageCircle, Mail, Newspaper, MessageSquare, Gavel, ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

type NavItem = {
    href: string;
    label: string;
    Icon: React.ElementType;
    roles: Role[];
};

type NavGroup = {
    group: string;
    items: NavItem[];
};

const navConfig: NavGroup[] = [
    {
        group: "Overview",
        items: [
            { href: "/admin", label: "Dashboard", Icon: Home, roles: ['ADMIN'] },
        ]
    },
    {
        group: "Content Management",
        items: [
            { href: "/admin/content", label: "Site Content", Icon: Globe, roles: ['ADMIN'] },
            { href: "/admin/blog", label: "Blog", Icon: BookText, roles: ['ADMIN', 'AUTHOR'] },
            { href: "/admin/comparisons", label: "Comparisons", Icon: GitCompareArrows, roles: ['ADMIN', 'AUTHOR'] },
            { href: "/admin/news", label: "News", Icon: Newspaper, roles: ['ADMIN', 'AUTHOR'] },
            { href: "/admin/community", label: "Community", Icon: MessageSquare, roles: ['ADMIN', 'MODERATOR'] },
            { href: "/admin/media", label: "Media", Icon: ImageIcon, roles: ['ADMIN'] },
            { href: "/admin/legal", label: "Legal", Icon: Gavel, roles: ['ADMIN'] },
        ]
    },
    {
        group: "Data Management",
        items: [
            { href: "/admin/platforms", label: "Platforms", Icon: Table, roles: ['ADMIN'] },
            { href: "/admin/features", label: "Features", Icon: PenSquare, roles: ['ADMIN'] },
        ]
    },
    {
        group: "Communication",
        items: [
            { href: "/admin/emails", label: "Emails", Icon: Send, roles: ['ADMIN'] },
            { href: "/admin/comments", label: "Comments", Icon: MessageCircle, roles: ['ADMIN', 'MODERATOR'] },
            { href: "/admin/contacts", label: "Contacts", Icon: Mail, roles: ['ADMIN'] },
        ]
    },
    {
        group: "Administration",
        items: [
            { href: "/admin/users", label: "Users", Icon: Users, roles: ['ADMIN'] },
            { href: "/admin/settings", label: "Settings", Icon: Settings, roles: ['ADMIN'] },
        ]
    }
];

export function AdminNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userRole = session?.user?.role;

    if (!userRole) {
        return null; // Or a loading spinner
    }

    return (
        <SidebarMenu>
            {navConfig.map(group => {
                const accessibleItems = group.items.filter(item => item.roles.includes(userRole));
                if (accessibleItems.length === 0) return null;

                return (
                    <SidebarGroup key={group.group}>
                        <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
                        {accessibleItems.map(item => (
                            <SidebarMenuItem key={item.label}>
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
                );
            })}
        </SidebarMenu>
    );
}
