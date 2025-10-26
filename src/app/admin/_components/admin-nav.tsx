
'use client';

import Link from "next/link";
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { type Role } from "@prisma/client";
import { navConfig } from "@/lib/admin-nav";
import { usePathname } from "next/navigation";


interface AdminNavProps {
    userRole: Role;
}

export function AdminNav({ userRole }: AdminNavProps) {
    const pathname = usePathname();

    if (!userRole) {
        return null;
    }

    return (
        <SidebarMenu>
            {navConfig.map(group => {
                const accessibleItems = group.items.filter(item => item.roles.includes(userRole));
                if (accessibleItems.length === 0) return null;

                return (
                    <SidebarGroup key={group.group}>
                        <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
                        {accessibleItems.map(item => {
                            const isActive = (item.href === '/admin' && pathname === '/admin') || (item.href !== '/admin' && pathname.startsWith(item.href));
                            return (
                                <SidebarMenuItem key={item.label}>
                                    <Link href={item.href}>
                                        <SidebarMenuButton
                                            tooltip={item.label}
                                            isActive={isActive}
                                        >
                                            <item.Icon />
                                            {item.label}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarGroup>
                );
            })}
        </SidebarMenu>
    );
}
