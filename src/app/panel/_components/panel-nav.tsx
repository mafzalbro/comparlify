"use client";

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
import { Session } from "next-auth";

export function PanelNav({ user }: { user: Session["user"] }) {
  const pathname = usePathname();

  const navItems = [
    {
      group: "Main",
      items: [{ href: "/panel", label: "Dashboard", Icon: LayoutDashboard }],
    },
    {
      group: "Account",
      items: [
        { href: "/panel/profile", label: "Profile", Icon: UserCircle },
        { href: "/panel/settings", label: "Settings", Icon: Settings },
      ],
    },
  ];

  return (
    <SidebarMenu className="gap-6">
      {navItems.map((group) => (
        <div key={group.group} className="space-y-2">
          <div className="px-3 text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest opacity-60 group-data-[state=collapsed]:hidden">
            {group.group}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={isActive}
                    className={`
                      w-full h-10 px-3 rounded-xl flex items-center gap-3 transition-all duration-200
                      group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground font-extrabold shadow-sm"
                          : "hover:bg-primary/10 text-muted-foreground hover:text-primary font-bold"
                      }
                    `}
                  >
                    <Link href={item.href} className="group/item">
                      <item.Icon
                        className={`shrink-0 h-4 w-4 transition-transform duration-200 ${isActive ? "scale-105" : "group-hover/item:scale-105"}`}
                      />
                      <span className="text-xs uppercase tracking-wider truncate group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </div>
        </div>
      ))}
    </SidebarMenu>
  );
}
