import { getContent } from "@/lib/content";
import { isModuleEnabled } from "@/lib/module-navigation";
import { notFound } from "next/navigation";

export default async function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getContent();
  if (!isModuleEnabled("compare", content)) {
    notFound();
  }

  return <>{children}</>;
}
