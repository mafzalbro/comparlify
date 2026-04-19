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
    <SidebarMenu className="gap-8">
      {navItems.map((group) => (
        <div key={group.group} className="space-y-4">
          <div className="px-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50 group-data-[state=collapsed]:hidden">
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
                      w-full h-12 px-4 rounded-3xl flex items-center gap-4 transition-all duration-200
                      group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground scale-[1.02]"
                          : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      }
                    `}
                  >
                    <Link href={item.href} className="group/item">
                      <item.Icon
                        className={`shrink-0 h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover/item:scale-110"}`}
                      />
                      <span className="text-[11px] font-black uppercase tracking-widest truncate group-data-[collapsible=icon]:hidden">
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
