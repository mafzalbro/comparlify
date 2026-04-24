import { PlatformData } from "../types";

export const plausible: PlatformData = {
  name: "Plausible",
  website: "https://plausible.io",
  logoUrl: "https://plausible.io/assets/images/icon/plausible-logo.png",
  description: "Plausible is the 'breath of fresh air' in the world of web analytics. It was built as a direct response to the complexity and privacy concerns of Google Analytics. Plausible is lightweight (17x smaller than GA4 scripts), open-source, and fully GDPR/CCPA compliant out of the box without needing annoying cookie banners. It provides a single-page dashboard that tells you exactly what you need to know: where your traffic is coming from and what they're doing on your site. For founders and marketers who value speed, privacy, and simplicity over 'data hoarding,' Plausible is the ultimate choice.",
  rating: 4.8,
  easeOfUse: 5.0,
  featuresRating: 4.2,
  support: 4.7,
  pros: [
    "Extremely lightweight script (under 1KB)",
    "No cookie banners required (GDPR compliant)",
    "Simple, intuitive one-page dashboard",
    "Open-source and transparent",
    "Easy to share dashboards with clients"
  ],
  cons: [
    "Lacks advanced 'big data' features of GA4",
    "No free tier (starts at $9/mo)",
    "Limited ecommerce-specific tracking",
    "Fewer third-party integrations than Google"
  ],
  tiers: [
    {
      name: "Growth",
      monthlyPrice: 9,
      annualPriceMonthlyEquivalent: 7.5,
      features: ["10k Pageviews", "Unlimited sites", "100% Data ownership", "Email reports"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 19,
      annualPriceMonthlyEquivalent: 15.8,
      features: ["100k Pageviews", "Custom domains", "Stats API", "Priority support"],
      isPopular: false
    },
    {
      name: "Enterprise",
      monthlyPrice: 69,
      annualPriceMonthlyEquivalent: 57.5,
      features: ["1M+ Pageviews", "White-labeling", "Custom contract", "Dedicated support"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Privacy First", categoryName: "Compliance", hasFeature: true },
    { featureName: "Real-time Stats", categoryName: "Analytics", hasFeature: true },
    { featureName: "Goal Tracking", categoryName: "Analytics", hasFeature: true },
    { featureName: "Email Reports", categoryName: "Reporting", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://plausible.io/pricing"
};
