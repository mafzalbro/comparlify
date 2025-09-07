import { Chatbot } from '@/components/chatbot';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Chatbot />
      <Footer />
    </>
  );
}
