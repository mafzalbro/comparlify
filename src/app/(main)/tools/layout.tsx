import { Breadcrumbs } from "@/components/breadcrumb";

export const revalidate = 0;

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-secondary/50 flex-1">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
