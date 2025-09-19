
import { Chatbot } from '@/components/chatbot';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { auth } from '@/lib/auth';
import { getContent } from '@/lib/content';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DUMMY CODE: START - To simulate an admin session for testing.
  // This code can be removed when the temporary login is no longer needed.
  let session = await auth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment && (!session || session.user.role !== 'ADMIN')) {
      // console.log("Creating dummy admin session for development.");
      session = {
          user: {
              id: 'dummy-admin-id',
              name: 'Admin (Dev)',
              email: 'mafzalbro@gmail.com',
              image: null,
              role: 'ADMIN',
              onboarded: true,
              newsletter: true,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
  }
  // DUMMY CODE: END
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
      <main className="flex-1">
        {children}
      </main>
      <Chatbot />
      <Footer content={footerContent} />
    </>
  );
}
