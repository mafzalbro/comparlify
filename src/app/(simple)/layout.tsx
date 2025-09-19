
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Chatbot } from "@/components/chatbot";
import { getContent } from "@/lib/content";

export default async function SimplePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getContent();
  const footerContent = {
    'footer.tagline': content['footer.tagline'],
    'footer.newsletter.title': content['footer.newsletter.title'],
    'footer.newsletter.subtitle': content['footer.newsletter.subtitle'],
  };

  let navLinks = [];
  try {
    navLinks = JSON.parse(content['header.navLinks'] || '[]');
  } catch (e) {
    console.error("Failed to parse header.navLinks", e);
  }

  return (
    <>
      <Header navLinks={navLinks} />
      <main>{children}</main>
      <Chatbot />
      <Footer content={footerContent}/>
    </>
  );
}
