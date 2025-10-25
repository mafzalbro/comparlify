
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { Poppins, Lato } from 'next/font/google';
import { cn } from '@/lib/utils';
import { getContent } from '@/lib/content';
import { Suspense } from 'react';
import NextTopLoader from 'nextjs-toploader';

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


export const metadata: Metadata = await generateSeoMetadata({
  path: '/',
  description: 'Compare course creation platforms and find the best fit for your business.',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const content = await getContent();
  const siteName = content['global.siteName'] || 'Comparlify';
  const headCode = content['settings.code.head'] || '';
  const bodyCode = content['settings.code.body'] || '';


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
        {headCode && <div dangerouslySetInnerHTML={{ __html: headCode }} />}
      </head>
      <body className={cn("font-body antialiased flex flex-col min-h-screen bg-background", fontHeadline.variable, fontBody.variable)}>
        <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className='flex-1 flex flex-col'>
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </div>
            <Toaster />
            <CookieConsentBanner />
          </AuthProvider>
        </ThemeProvider>
         {bodyCode && <div dangerouslySetInnerHTML={{ __html: bodyCode }} />}
      </body>
    </html>
  );
}
