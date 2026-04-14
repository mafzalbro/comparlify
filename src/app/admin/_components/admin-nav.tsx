"use client";

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
import { cn } from "@/lib/utils";

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
      {navConfig.map((group) => {
        const accessibleItems = group.items.filter((item) =>
          item.roles.includes(userRole),
        );
        if (accessibleItems.length === 0) return null;

        return (
          <SidebarGroup className="p-0!" key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            {accessibleItems.map((item) => {
              const isActive =
                (item.href === "/admin" && pathname === "/admin") ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <SidebarMenuItem key={item.label} className="mb-0.5">
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={isActive}
                    className={cn(
                      "w-full h-9 rounded-lg transition-all duration-200 px-3 flex items-center gap-2",
                      "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                      isActive
                        ? "bg-primary/10 text-primary font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <Link href={item.href}>
                      <item.Icon
                        className={cn(
                          "shrink-0 h-4 w-4",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground/70",
                        )}
                      />
                      <span className="text-xs font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarGroup>
        );
      })}
    </SidebarMenu>
  );
}
