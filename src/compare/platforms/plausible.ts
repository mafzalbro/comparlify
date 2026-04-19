import { PlatformData } from "../types";

export const plausible: PlatformData = {
  name: "Plausible",
  website: "https://plausible.io",
  logoUrl: "https://plausible.io/assets/images/icon/plausible-logo.png",
  description: "Lightweight and open-source web analytics. No cookies and fully compliant with GDPR, CCPA, and PECR. Made and hosted in the EU.",
  rating: 4.9,
  easeOfUse: 5.0,
  featuresRating: 4.5,
  support: 4.7,
  pros: [
    "Privacy-first (No cookies, no GDPR banners needed)",
    "Extremely lightweight script (< 1KB)",
    "Clean, simple one-page dashboard",
    "Open-source and transparent",
    "Easy to set up and understand"
  ],
  cons: [
    "No free tier (paid monthly based on traffic)",
    "Limited feature set compared to GA4 (no advanced cohorts/predictive analytics)",
    "Limited attribution data for complex ad campaigns"
  ],
  tiers: [
    {
      name: "10k Monthly Views",
      monthlyPrice: 9,
      features: ["Unlimited websites", "Custom events", "Email reports", "Shared dashboards"],
      isPopular: true
    },
    {
      name: "100k Monthly Views",
      monthlyPrice: 19,
      features: ["Everything in 10k tier", "Higher traffic limit"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Cookieless Tracking", categoryName: "Privacy", hasFeature: true },
    { featureName: "Custom Events", categoryName: "Analytics", hasFeature: true },
    { featureName: "Email/Slack Reports", categoryName: "Reporting", hasFeature: true },
    { featureName: "Google Search Console Integration", categoryName: "Integrations", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://plausible.io/pricing"
};
