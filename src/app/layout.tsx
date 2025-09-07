
import './globals.css';
import { Toaster } from '@/components/ui/toaster';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
        <div className='flex-1 flex flex-col'>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
