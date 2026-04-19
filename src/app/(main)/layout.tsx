import { Chatbot } from "@/components/chatbot";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { auth } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { AdPlacement } from "@/components/ad-placement";
import { PromoBanner } from "@/components/layout/promo-banner";

export const revalidate = 3600; // Default revalidation for main pages

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = await auth();
  const content = await getContent();
  const footerContent = {
    "footer.tagline": content["footer.tagline"],
    "footer.newsletter.title": content["footer.newsletter.title"],
    "footer.newsletter.subtitle": content["footer.newsletter.subtitle"],
    "footer.navLinks.navigate": content["footer.navLinks.navigate"],
    "footer.navLinks.company": content["footer.navLinks.company"],
  };

  const siteName = content["global.siteName"] || "Comparlify";

  let navLinks = [];
  try {
    navLinks = JSON.parse(content["header.navLinks"] || "[]");
  } catch (e) {
    console.error("Failed to parse header.navLinks", e);
  }

  return (
    <>
      <PromoBanner />
      <div className="fixed inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-[0.05] pointer-events-none"></div>
      <Header navLinks={navLinks} siteName={siteName} />
      <AdPlacement placement="HEADER" className="container mx-auto" />
      <main className="flex-1 flex flex-col">{children}</main>
      {session?.user && <Chatbot />}
      <Footer content={footerContent} siteName={siteName} />
    </>
  );
}
