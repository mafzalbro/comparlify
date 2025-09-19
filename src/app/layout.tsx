
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { seed } from '../../prisma/seed';
import { Poppins, Lato } from 'next/font/google';
import { cn } from '@/lib/utils';
import { getContent } from '@/lib/content';

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-headline',
});

const fontBody = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});


export const metadata: Metadata = generateSeoMetadata({
  path: '/',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // seed()
  const content = await getContent();
  const siteName = content['global.siteName'] || 'Comparlify';

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: 'https://www.comparlify.com', // Replace with your actual domain
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.comparlify.com/search?q={search_term_string}', // Replace with your actual domain
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
       <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={cn("font-body antialiased flex flex-col min-h-screen bg-background", fontHeadline.variable, fontBody.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className='flex-1 flex flex-col'>
              {children}
            </div>
            <Toaster />
            <CookieConsentBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
