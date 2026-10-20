import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { getContent } from "@/lib/content";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import { themeConfig } from "@/lib/theme";

const SITE_URL = "https://www.comparlify.com";

const font = Outfit({
  preload: true,
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

// DEFENSIVE: layout metadata intentionally does NOT set a canonical,
// openGraph, or twitter block. Those are page-level responsibilities
// (each page calls generateSeoMetadata() to declare its own).
// This prevents a page from ever accidentally inheriting "/" as its canonical.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Comparlify — Helping Course Creators Grow",
  description:
    "Unbiased comparisons, AI-powered tools, and community insights to help course creators succeed.",
  applicationName: "Comparlify",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();
  const siteName = content["global.siteName"] || "Comparlify";
  const siteDescription =
    content["seo.default.description"] ||
    "Unbiased comparisons, AI-powered tools, and community insights to help course creators succeed.";
  const orgLogo = content["seo.org.logo"] || `${SITE_URL}/logo.png`;
  const headCode = content["settings.code.head"] || "";
  const bodyCode = content["settings.code.body"] || "";

  // Site-wide JSON-LD graph.
  // Organization is given a stable @id so every page's Article / Product /
  // FAQPage schema can reference it via `publisher: { "@id": ".../#organization" }`.
  // SearchAction intentionally removed — Google retired Sitelinks Search Box in Nov 2024.
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: siteName,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: orgLogo,
          width: 512,
          height: 512,
        },
        description: siteDescription,
        // Populate sameAs when your public social profiles are ready:
        sameAs: [
          // "https://twitter.com/comparlify",
          // "https://www.linkedin.com/company/comparlify",
          // "https://github.com/comparlify",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: siteName,
        description: siteDescription,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
      },
    ],
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
      className={
        "scroll-smooth scheme-light dark:scheme-dark" + ` ${font.className}`
      }
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
        {themeCss && <style>{themeCss}</style>}
        {headCode && <div dangerouslySetInnerHTML={{ __html: headCode }} />}
      </head>
      <body
        className={cn(
          "font-body antialiased flex flex-col min-h-screen bg-background",
          font.className,
        )}
        suppressHydrationWarning
      >
        <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex-1 flex flex-col" suppressHydrationWarning>
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
