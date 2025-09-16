
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from "@/components/ui/sidebar";
import { Breadcrumbs } from "@/components/breadcrumb";
import { ToolsSidebar } from "./_components/tools-sidebar";


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
