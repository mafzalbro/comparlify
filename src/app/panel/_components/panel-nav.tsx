
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
import { LayoutDashboard, UserCircle, Settings } from "lucide-react";
import type { User } from "@prisma/client";

export function PanelNav({ user }: { user: User }) {
    const pathname = usePathname();

    const navItems = [
        {
            group: "Dashboard",
            items: [
                { href: "/panel", label: "Dashboard", Icon: LayoutDashboard },
            ]
        },
        {
            group: "My Account",
            items: [
                { href: "/panel/profile", label: "Profile", Icon: UserCircle },
                { href: "/panel/settings", label: "Settings", Icon: Settings },
            ]
        },
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
                                    isActive={pathname === item.href}
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
