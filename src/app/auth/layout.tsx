import { Logo } from "@/components/logo";
import { getContent, getSiteName } from "@/lib/content";
import Link from "next/link";
import { Suspense } from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = await getSiteName()
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4">
        <Link href="/">
          <Logo siteName={siteName} />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
