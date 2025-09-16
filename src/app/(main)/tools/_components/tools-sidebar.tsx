'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { allTools, categories } from '../tools';
import Link from 'next/link';
import { usePathname } from "next/navigation";

export function ToolsSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarTrigger />
                <h2 className="font-headline text-lg">AI Tools</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {categories.map((category) => (
                        <SidebarGroup key={category}>
                            <SidebarGroupLabel>{category}</SidebarGroupLabel>
                            {allTools.filter(tool => tool.category === category).map(tool => (
                                <SidebarMenuItem key={tool.slug}>
                                    <Link href={tool.href} className="w-full">
                                        <SidebarMenuButton tooltip={tool.title} size="sm" isActive={pathname === tool.href}>
                                            <tool.Icon />
                                            <span>{tool.title}</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarGroup>
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
