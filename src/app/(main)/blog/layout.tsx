import { getContent } from "@/lib/content";
import { isModuleEnabled } from "@/lib/module-navigation";
import { notFound } from "next/navigation";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getContent();
  if (!isModuleEnabled("blog", content)) {
    notFound();
  }

  return <>{children}</>;
}
