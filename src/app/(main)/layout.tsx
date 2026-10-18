import { Chatbot } from "@/components/chatbot";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getContent } from "@/lib/content";
import { AdPlacement } from "@/components/ad-placement";
import { PromoBanner } from "@/components/layout/promo-banner";
import {
  filterNavigation,
  isModuleEnabled,
  parseNavigation,
} from "@/lib/module-navigation";

export const revalidate = 3600;

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getContent();

  const siteName = content["global.siteName"] || "Comparlify";

  // Filter header navigation dynamically.
  const navLinks = filterNavigation(
    parseNavigation(content["header.navLinks"]),
    content,
  );

  // Filter footer navigation using the same rules.
  const footerContent = {
    "footer.tagline": content["footer.tagline"],
    "footer.newsletter.title": content["footer.newsletter.title"],
    "footer.newsletter.subtitle": content["footer.newsletter.subtitle"],
    "footer.navLinks.navigate": JSON.stringify(
      filterNavigation(
        parseNavigation(content["footer.navLinks.navigate"]),
        content,
      ),
    ),
    "footer.navLinks.company": content["footer.navLinks.company"],
  };

  const bannerSettings = {
    enabled: content["global.banner.enabled"] === "true",
    text: content["global.banner.text"] || "",
    linkText: content["global.banner.link.text"] || "",
    linkHref: content["global.banner.link.href"] || "",
  };

  const aiEnabled = isModuleEnabled("ai", content);

  return (
    <>
      <PromoBanner settings={bannerSettings} />

      <div className="fixed inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-[0.05] pointer-events-none" />

      <Header navLinks={navLinks} siteName={siteName} />

      <AdPlacement placement="HEADER" className="container mx-auto" />

      <main className="flex-1 flex flex-col">{children}</main>

      {aiEnabled && <Chatbot />}

      <Footer content={footerContent} siteName={siteName} />
    </>
  );
}
