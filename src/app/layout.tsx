'use client';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Chatbot } from '@/components/chatbot';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { usePathname } from 'next/navigation';
import { seed } from '../../prisma/seed';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  useEffect(() => {
    seed()
  }, [])


  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
        <title>Comparlify - Helping Course Creators Grow</title>
        <meta name="description" content="Unbiased comparisons, AI-powered tools, and community insights to help course creators succeed." />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        {!isAdminRoute && <Header />}
        <div className='flex-1'>
          {children}
        </div>
        <Toaster />
        {!isAdminRoute && <Chatbot />}
        {!isAdminRoute && <Footer />}
      </body>
    </html>
  );
}
