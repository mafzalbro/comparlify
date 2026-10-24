import { getContent } from "@/lib/content";
import { isModuleEnabled } from "@/lib/module-navigation";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getContent();
  if (!isModuleEnabled("tools", content)) {
    notFound();
  }

  return (
    <div className="bg-secondary/50 flex-1">
      {children}
    </div>
  );
}
