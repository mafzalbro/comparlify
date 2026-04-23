import { PlatformData } from "../types";

export const plausible: PlatformData = {
  name: "Plausible",
  website: "https://plausible.io",
  logoUrl: "https://plausible.io/assets/images/icon/plausible_logo.png",
  description: "Lightweight and open-source web analytics. Plausible is a privacy-friendly alternative to Google Analytics that doesn't use cookies and is fully compliant with GDPR, CCPA, and PECR.",
  rating: 4.8,
  easeOfUse: 5.0,
  featuresRating: 4.4,
  support: 4.6,
  pros: [
    "Extremely lightweight (< 1KB script)",
    "Privacy-first (no cookies, no cross-site tracking)",
    "Simple and intuitive one-page dashboard",
    "Open-source and transparent",
    "Easy to set up in minutes"
  ],
  cons: [
    "Fewer advanced features than GA4",
    "No free tier beyond the 30-day trial",
    "Limited depth for complex ecommerce tracking"
  ],
  tiers: [
    {
      name: "Growth (10k)",
      monthlyPrice: 9,
      features: ["10,000 Monthly Pageviews", "50 Websites", "Unlimited data retention", "Email/Slack reports"],
      isPopular: true
    },
    {
      name: "Business (100k)",
      monthlyPrice: 19,
      features: ["100,000 Monthly Pageviews", "50 Websites", "Custom events", "Unlimited team members"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Privacy Compliance", categoryName: "Compliance", hasFeature: true },
    { featureName: "Cookieless Tracking", categoryName: "Privacy", hasFeature: true },
    { featureName: "Custom Events", categoryName: "Analytics", hasFeature: true },
    { featureName: "Shared Dashboards", categoryName: "Social", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://plausible.io/pricing"
};
