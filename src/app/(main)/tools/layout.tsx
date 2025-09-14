
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
} from "@/components/ui/sidebar";
import { allTools, categories } from './tools';
import Link from 'next/link';
import { Breadcrumbs } from "@/components/breadcrumb";
import { usePathname } from "next/navigation";


function ToolsSidebar() {
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
                                        <SidebarMenuButton tooltip={tool.title} size="sm">
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


export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <ToolsSidebar />
        <SidebarInset>
            <div className="bg-secondary/50 flex-1">
                <div className="container py-12">
                    <Breadcrumbs
                        items={[
                            { name: 'Home', href: '/' },
                            { name: 'Tools', href: '/tools' },
                        ]}
                        className="mb-12"
                    />
                    {children}
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
