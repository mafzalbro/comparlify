import type { Metadata } from "next";
import { getContent } from "./content";

const CANONICAL_HOST = "comparlify.com";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

const fallbackConfig = {
  title: "Comparlify",
  description:
    "Unbiased comparisons, AI-powered tools, and community insights to help course creators succeed.",
  keywords:
    "online course platform, course creation, e-learning, ai tools for creators, teachable vs thinkific, course marketing",
  twitter: "@comparlify",
  url: CANONICAL_ORIGIN,
  ogImage: `${CANONICAL_ORIGIN}/og-image.png`,
  twitterImage: `${CANONICAL_ORIGIN}/twitter-image.png`,
  orgName: "Comparlify",
  orgLogo: `${CANONICAL_ORIGIN}/logo.png`,
};

/** Force every URL — regardless of what's in the DB — onto www.comparlify.com. */
function normalizeToCanonical(input: string | undefined | null, fallback: string): string {
  if (!input) return fallback;
  // Rewrite any known variant (with or without www, or vercel subdomain)
  return input
    .replace(/^https?:\/\/comparlify\.com/i, CANONICAL_ORIGIN)
    .replace(/^https?:\/\/www\.comparlify\.com/i, CANONICAL_ORIGIN)
    .replace(/^https?:\/\/comparlify\.vercel\.app/i, CANONICAL_ORIGIN);
}

type GenerateMetadataProps = {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  image?: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export async function generateSeoMetadata({
  title,
  description,
  keywords,
  image,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: GenerateMetadataProps): Promise<Metadata> {
  const content = await getContent();

  const siteName = content["global.siteName"] || fallbackConfig.title;

  const defaultConfig = {
    title: content["seo.default.title"] || fallbackConfig.title,
    description: content["seo.default.description"] || fallbackConfig.description,
    keywords: content["seo.default.keywords"] || fallbackConfig.keywords,
    twitter: content["seo.default.twitter"] || fallbackConfig.twitter,
    url: normalizeToCanonical(content["seo.default.url"], CANONICAL_ORIGIN),
    ogImage: normalizeToCanonical(content["seo.og.image"], fallbackConfig.ogImage),
    twitterImage: normalizeToCanonical(content["seo.twitter.image"], fallbackConfig.twitterImage),
    orgName: content["seo.org.name"] || fallbackConfig.orgName,
    orgLogo: normalizeToCanonical(content["seo.org.logo"], fallbackConfig.orgLogo),
  };

  const pageTitle = title
    ? `${title} | ${siteName}`
    : `${defaultConfig.title} - Helping Course Creators Grow`;
  const pageDescription = description || defaultConfig.description;

  const pageKeywords = Array.isArray(keywords)
    ? [...defaultConfig.keywords.split(",").map((k: string) => k.trim()), ...keywords]
    : typeof keywords === "string"
      ? [...defaultConfig.keywords.split(",").map((k: string) => k.trim()), ...keywords.split(",").map((k: string) => k.trim())]
      : defaultConfig.keywords;

  const ogImage = normalizeToCanonical(image, defaultConfig.ogImage);
  const twitterImage = normalizeToCanonical(image, defaultConfig.twitterImage);
  const canonicalUrl = `${defaultConfig.url}${path === "/" ? "/" : path}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    authors: authors?.map((name) => ({ name })) ?? [{ name: `${siteName} Team`, url: defaultConfig.url }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(defaultConfig.url),
    alternates: { canonical: canonicalUrl },
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
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: pageDescription }],
      locale: "en_US",
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      site: defaultConfig.twitter,
      creator: defaultConfig.twitter,
      images: [twitterImage],
    },
  };
}

export type SeoMetadataResult = Awaited<ReturnType<typeof generateSeoMetadata>>;

/* -------------------------------------------------------------------------- */
/*                       JSON-LD SCHEMA GENERATORS                            */
/* -------------------------------------------------------------------------- */

export function generateArticleSchema(input: {
  headline: string;
  description: string;
  authorName: string;
  datePublished: string;
  dateModified: string;
  imageUrl?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    image: input.imageUrl || fallbackConfig.ogImage,
    author: { "@type": "Person", name: input.authorName },
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    publisher: {
      "@type": "Organization",
      name: fallbackConfig.orgName,
      logo: { "@type": "ImageObject", url: fallbackConfig.orgLogo },
    },
  };
}

export function generateFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateSoftwareApplicationSchema(input: {
  name: string;
  description: string;
  applicationCategory: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    description: input.description,
    applicationCategory: input.applicationCategory,
    operatingSystem: "Web",
    url: input.url,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}