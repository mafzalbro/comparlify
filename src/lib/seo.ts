import type { Metadata } from 'next';
import { getContent } from './content';

const defaultConfig = {
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

export async function generateSeoMetadata({
    title,
    description,
    keywords,
    image,
    path
}: GenerateMetadataProps): Promise<Metadata> {
    const content = await getContent();
    const siteName = content['global.siteName'] || defaultConfig.title;
    
    const pageTitle = title ? `${title} | ${siteName}` : `${siteName} - Helping Course Creators Grow`;
    const pageDescription = description || defaultConfig.description;
    const pageKeywords = Array.isArray(keywords) ? [...defaultConfig.keywords, ...keywords] : [defaultConfig.keywords, keywords].join(', ');
    const ogImage = image || defaultConfig.image;
    const canonicalUrl = `${defaultConfig.url}${path}`;

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: pageKeywords,
        authors: [{ name: `${siteName} Team`, url: defaultConfig.url }],
        creator: siteName,
        publisher: siteName,

        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: canonicalUrl,
            siteName: siteName,
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
            site: defaultConfig.twitter,
            creator: defaultConfig.twitter,
            images: [ogImage],
        },
        metadataBase: new URL(defaultConfig.url),
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
