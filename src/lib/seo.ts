
import type { Metadata } from 'next';
import { getContent } from './content';

const fallbackConfig = {
    title: 'Comparlify',
    description: 'Unbiased comparisons, AI-powered tools, and community insights to help course creators succeed.',
    keywords: 'online course platform, course creation, e-learning, ai tools for creators, teachable vs thinkific, course marketing',
    twitter: '@comparlify',
    url: 'https://comparlify.com',
    image: 'https://comparlify.com/og-image.png',
    ogImage: 'https://comparlify.com/og-image.png',
    twitterImage: 'https://comparlify.com/twitter-image.png',
    orgName: 'Comparlify',
    orgLogo: 'https://comparlify.com/logo.png',
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
    
    const siteName = content['global.siteName'] || fallbackConfig.title;

    const defaultConfig = {
        title: content['seo.default.title'] || fallbackConfig.title,
        description: content['seo.default.description'] || fallbackConfig.description,
        keywords: content['seo.default.keywords'] || fallbackConfig.keywords,
        twitter: content['seo.default.twitter'] || fallbackConfig.twitter,
        url: content['seo.default.url'] || fallbackConfig.url,
        ogImage: content['seo.og.image'] || fallbackConfig.ogImage,
        twitterImage: content['seo.twitter.image'] || fallbackConfig.twitterImage,
        orgName: content['seo.org.name'] || fallbackConfig.orgName,
        orgLogo: content['seo.org.logo'] || fallbackConfig.orgLogo,
    };
    
    const pageTitle = title ? `${title} | ${siteName}` : `${defaultConfig.title} - Helping Course Creators Grow`;
    const pageDescription = description || defaultConfig.description;
    
    const pageKeywords = Array.isArray(keywords) 
        ? [...defaultConfig.keywords.split(',').map(k => k.trim()), ...keywords] 
        : [defaultConfig.keywords, keywords].filter(Boolean).join(', ');

    const ogImage = image || defaultConfig.ogImage;
    const twitterImage = image || defaultConfig.twitterImage;
    const canonicalUrl = `${defaultConfig.url}${path}`;

    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: defaultConfig.orgName,
        url: defaultConfig.url,
        logo: defaultConfig.orgLogo,
    };

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
            images: [twitterImage],
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
        other: {
            'script:ld+json': JSON.stringify(organizationSchema)
        }
    };
}
