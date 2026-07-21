import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Chatbot } from "@/components/chatbot";
import { getContent } from "@/lib/content";
import { auth } from "@/lib/auth";
import { PromoBanner } from "@/components/layout/promo-banner";

export default async function SimplePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, content] = await Promise.all([auth(), getContent()]);

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

  const bannerSettings = {
    enabled: content["global.banner.enabled"] === "true",
    text: content["global.banner.text"] || "",
    linkText: content["global.banner.link.text"] || "",
    linkHref: content["global.banner.link.href"] || "",
  };

  return (
    <>
      <PromoBanner settings={bannerSettings} />
      <Header navLinks={navLinks} siteName={siteName} />
      <main className="flex-1 flex flex-col min-h-[60vh]">
        {children}
      </main>
      {session?.user && <Chatbot />}
      <Footer content={footerContent} siteName={siteName} />
    </>
  );
}
