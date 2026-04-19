import { PlatformData } from "../types";

export const ga4: PlatformData = {
  name: "Google Analytics 4",
  website: "https://analytics.google.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_Analytics_logo.svg",
  description: "The next generation of Google Analytics. GA4 uses event-based data and AI-driven insights to help businesses understand the customer journey across websites and apps.",
  rating: 4.5,
  easeOfUse: 2.8,
  featuresRating: 5.0,
  support: 4.0,
  pros: [
    "Completely free for most businesses",
    "Extremely powerful data collection and predictive analytics",
    "Seamless integration with the Google Ads ecosystem",
    "Deep audience segmentation and cohort analysis",
    "BigQuery export support"
  ],
  cons: [
    "Overwhelmingly complex to set up and use",
    "Privacy concerns (requires complex consent handling and GDPR banners)",
    "Data thresholding can hide small amounts of traffic",
    "Very steep learning curve for non-data analysts"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited data collection", "Predictive metrics", "BigQuery export", "AdWords integration"],
      isPopular: true
    },
    {
      name: "Analytics 360",
      monthlyPrice: 12500,
      features: ["Higher data limits", "Advanced support", "SLAs", "Enterprise governance"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Event-based Tracking", categoryName: "Analytics", hasFeature: true },
    { featureName: "Predictive Analytics", categoryName: "AI", hasFeature: true },
    { featureName: "Cross-platform Tracking", categoryName: "Analytics", hasFeature: true },
    { featureName: "Google Ads Integration", categoryName: "Marketing", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://marketingplatform.google.com/about/analytics/pricing/"
};
