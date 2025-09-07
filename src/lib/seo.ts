import type { Metadata } from 'next';

const seoConfig = {
    title: 'Comparlify',
    description: 'Unbiased comparisons, AI-powered tools, and community insights to help course creators succeed.',
    keywords: ['online course platform', 'course creation', 'e-learning', 'ai tools for creators', 'teachable vs thinkific', 'course marketing'],
    twitter: '@comparlify',
    url: 'https://comparlify.com', // Replace with your actual domain
    image: 'https://comparlify.com/og-image.png' // Replace with your actual OG image URL
};

type GenerateMetadataProps = {
    title?: string;
    description?: string;
    keywords?: string[] | string;
    image?: string;
    path: string;
};

export function generateSeoMetadata({
    title,
    description,
    keywords,
    image,
    path
}: GenerateMetadataProps): Metadata {
    const pageTitle = title ? `${title} | ${seoConfig.title}` : `${seoConfig.title} - Helping Course Creators Grow`;
    const pageDescription = description || seoConfig.description;
    const pageKeywords = Array.isArray(keywords) ? [...seoConfig.keywords, ...keywords] : [seoConfig.keywords, keywords].join(', ');
    const ogImage = image || seoConfig.image;
    const canonicalUrl = `${seoConfig.url}${path}`;

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: pageKeywords,
        authors: [{ name: 'Comparlify Team', url: seoConfig.url }],
        creator: 'Comparlify',
        publisher: 'Comparlify',

        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: canonicalUrl,
            siteName: seoConfig.title,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: pageDescription,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            site: seoConfig.twitter,
            creator: seoConfig.twitter,
            images: [ogImage],
        },
        metadataBase: new URL(seoConfig.url),
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}
