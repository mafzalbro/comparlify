import { Chatbot } from "@/components/chatbot";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getContent } from "@/lib/content";
import { AdPlacement } from "@/components/ad-placement";
import { PromoBanner } from "@/components/layout/promo-banner";

export const revalidate = 3600; // Default revalidation for main pages

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getContent();
  const footerContent = {
    "footer.tagline": content["footer.tagline"],
    "footer.newsletter.title": content["footer.newsletter.title"],
    "footer.newsletter.subtitle": content["footer.newsletter.subtitle"],
    "footer.navLinks.navigate": content["footer.navLinks.navigate"],
    "footer.navLinks.company": content["footer.navLinks.company"],
  };

  const siteName = content["global.siteName"] || "Comparlify";

  let navLinks: { href: string; label: string }[] = [];
  try {
    navLinks = JSON.parse(content["header.navLinks"] || "[]");
  } catch (e) {
    console.error("Failed to parse header.navLinks", e);
  }

  // Filter out disabled modules (community, AI, etc.) dynamically
  const isCommunityEnabled = content["module.community.enabled"] === "true";
  const isAiEnabled = content["module.ai.enabled"] === "true";

  navLinks = navLinks.filter((link) => {
    if (link.href.startsWith("/community") && !isCommunityEnabled) return false;
    if (link.href.startsWith("/tools/ai") && !isAiEnabled) return false;
    return true;
  });

  // Filter footer navigate links
  try {
    if (footerContent["footer.navLinks.navigate"]) {
      const parsed = JSON.parse(footerContent["footer.navLinks.navigate"]);
      footerContent["footer.navLinks.navigate"] = JSON.stringify(
        parsed.filter((link: { href: string }) => {
          if (link.href.startsWith("/community") && !isCommunityEnabled) return false;
          if (link.href.startsWith("/tools/ai") && !isAiEnabled) return false;
          return true;
        })
      );
    }
  } catch (e) {
    // ignore
  }

  const bannerSettings = {
    enabled: content["global.banner.enabled"] === "true",
    text: content["global.banner.text"] || "",
    linkText: content["global.banner.link.text"] || "",
    linkHref: content["global.banner.link.href"] || "",
  };

  return (
    <>
      <PromoBanner settings={bannerSettings} />
      <div className="fixed inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-[0.05] pointer-events-none"></div>
      <Header navLinks={navLinks} siteName={siteName} />
      <AdPlacement placement="HEADER" className="container mx-auto" />
      <main className="flex-1 flex flex-col">{children}</main>
      {isAiEnabled && <Chatbot />}
      <Footer content={footerContent} siteName={siteName} />
    </>
  );
}
