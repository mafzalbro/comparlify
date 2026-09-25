import { Breadcrumbs } from "@/components/breadcrumb";

export const revalidate = 0;

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-secondary/50 flex-1">
    <div className="bg-secondary/50 flex-1">{children}</div>
    </div>
  );
}
