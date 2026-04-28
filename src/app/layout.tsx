import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { getContent } from "@/lib/content";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import { themeConfig } from "@/lib/theme";
// import { syncComparisonData } from "@/compare/sync";

const font = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = await generateSeoMetadata({
  path: "/",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // syncComparisonData();
  const content = await getContent();
  const siteName = content["global.siteName"] || "Comparlify";
  const headCode = content["settings.code.head"] || "";
  const bodyCode = content["settings.code.body"] || "";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: "https://www.comparlify.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.comparlify.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const themeOverrides: { [key: string]: string | undefined } = {};
  for (const key in themeConfig) {
    themeOverrides[key] = content[key];
  }

  const generateThemeCss = () => {
    let lightCss = "";
    let darkCss = "";

    for (const [key, variable] of Object.entries(themeConfig)) {
      const dbValue = themeOverrides[key];
      if (dbValue) {
        if (key.startsWith("theme.light")) {
          lightCss += `  ${variable}: ${dbValue};\n`;
        } else if (key.startsWith("theme.dark")) {
          darkCss += `  ${variable}: ${dbValue};\n`;
        }
      }
    }

    let css = "";
    if (lightCss) {
      css += `:root {\n${lightCss}}\n`;
    }
    if (darkCss) {
      css += `.dark {\n${darkCss}}\n`;
    }
    return css;
  };

  const themeCss = generateThemeCss();

  return (
    <html
      lang="en"
      className="scroll-smooth scheme-light dark:scheme-dark"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {themeCss && <style>{themeCss}</style>}
        {headCode && <div dangerouslySetInnerHTML={{ __html: headCode }} />}
      </head>
      <body
        className={cn(
          "font-body antialiased flex flex-col min-h-screen bg-background",
          font.variable,
        )}
      >
        <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex-1 flex flex-col">
              <Suspense fallback={null}>{children}</Suspense>
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
