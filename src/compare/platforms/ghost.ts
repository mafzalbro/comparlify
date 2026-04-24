import { PlatformData } from "../types";

export const ghost: PlatformData = {
  name: "Ghost",
  website: "https://ghost.org",
  logoUrl: "https://ghost.org/favicon.ico",
  description: "Ghost is the professional's choice for independent publishing. Unlike other newsletter platforms, Ghost is a fully-featured, open-source Content Management System (CMS) that prioritizes speed, SEO, and design. It’s built for creators who want to own their platform entirely and create a truly custom brand experience. With its '0% transaction fee' model and powerful membership tools, Ghost allows you to build a subscription-based media empire. It’s the platform of choice for tech-savvy writers and organizations who value the longevity of open-source software and the freedom to customize every pixel of their publication.",
  rating: 4.8,
  easeOfUse: 4.2,
  featuresRating: 4.7,
  support: 4.5,
  pros: [
    "Zero transaction fees (keep 100% revenue)",
    "Incredible SEO and lightning-fast performance",
    "Open-source and fully customizable",
    "Professional, minimalist design aesthetics",
    "Powerful native membership and subscription tools"
  ],
  cons: [
    "Higher technical barrier than Substack",
    "Hosted version (Ghost Pro) can get expensive",
    "Fewer 'built-in' growth network features than Beehiiv",
    "Requires more setup for email automations"
  ],
  tiers: [
    {
      name: "Starter",
      monthlyPrice: 11,
      annualPriceMonthlyEquivalent: 9,
      features: ["Up to 500 members", "Official Ghost themes", "Custom domain", "SSL included"],
      isPopular: false
    },
    {
      name: "Creator",
      monthlyPrice: 31,
      annualPriceMonthlyEquivalent: 25,
      features: ["Up to 1,000 members", "Unlimited custom themes", "1,000+ Integrations"],
      isPopular: true
    },
    {
      name: "Team",
      monthlyPrice: 63,
      annualPriceMonthlyEquivalent: 50,
      features: ["Up to 1,000 members", "Priority support", "Higher usage limits"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Custom Themes", categoryName: "Design", hasFeature: true },
    { featureName: "Membership Tiers", categoryName: "Monetization", hasFeature: true },
    { featureName: "Newsletter Sending", categoryName: "Marketing", hasFeature: true },
    { featureName: "SEO Tools", categoryName: "Growth", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://ghost.org/pricing"
};
