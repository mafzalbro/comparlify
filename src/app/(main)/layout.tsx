
import { Chatbot } from '@/components/chatbot';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Logo } from '@/components/logo';
import { auth } from '@/lib/auth';
import { getContent } from '@/lib/content';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = await auth();
  const content = await getContent();
  const footerContent = {
    'footer.tagline': content['footer.tagline'],
    'footer.newsletter.title': content['footer.newsletter.title'],
    'footer.newsletter.subtitle': content['footer.newsletter.subtitle'],
  };

  const siteName = content['header.siteName'];

  let navLinks = [];
  try {
    navLinks = JSON.parse(content['header.navLinks'] || '[]');
  } catch (e) {
    console.error("Failed to parse header.navLinks", e);
  }


  return (
    <>
      <Header navLinks={navLinks} siteName={siteName} />
      <main className="flex-1">
        {children}
      </main>
      {session?.user && <Chatbot />}
      <Footer content={footerContent} siteName={siteName} />
    </>
  );
}
