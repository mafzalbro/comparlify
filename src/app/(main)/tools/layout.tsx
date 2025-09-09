
import { Breadcrumbs } from "@/components/breadcrumb";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="bg-secondary/50 flex-1 py-12 md:py-20">
          <Breadcrumbs
            items={[
                { name: 'Home', href: '/' },
                { name: 'Tools', href: '/tools' },
            ]}
            className="mb-12"
          />
          {children}
      </div>
  );
}
