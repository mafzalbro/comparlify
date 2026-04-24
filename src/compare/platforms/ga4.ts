import { PlatformData } from "../types";

export const ga4: PlatformData = {
  name: "Google Analytics 4",
  website: "https://analytics.google.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Analytics_logo.svg/1200px-Google_Analytics_logo.svg.png",
  description: "The next generation of Google Analytics. GA4 uses an event-based data model to provide a more complete view of the customer journey across websites and apps.",
  rating: 4.6,
  easeOfUse: 3.2,
  featuresRating: 5.0,
  support: 4.0,
  pros: [
    "Completely free for most businesses",
    "Most powerful and detailed analytics tool",
    "Cross-platform tracking (Web + App)",
    "Deep integration with Google Ads and BigQuery",
    "Advanced machine learning insights and predictions"
  ],
  cons: [
    "Significant learning curve compared to Universal Analytics",
    "Privacy concerns and complex GDPR configuration",
    "Interface can be confusing for non-experts",
    "Data retention limits on the free tier"
  ],
  tiers: [
    {
      name: "Standard",
      monthlyPrice: 0,
      features: ["Cross-platform tracking", "Event-based data", "Predictive insights", "BigQuery export"],
      isPopular: true
    },
    {
      name: "360 (Enterprise)",
      monthlyPrice: 2500,
      features: ["Higher data limits", "SLA on data freshness", "Advanced sub-properties", "Dedicated support"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Event Tracking", categoryName: "Analytics", hasFeature: true },
    { featureName: "Machine Learning", categoryName: "Intelligence", hasFeature: true },
    { featureName: "BigQuery Integration", categoryName: "Data", hasFeature: true },
    { featureName: "Custom Explorations", categoryName: "Reporting", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://marketingplatform.google.com/about/analytics/pricing/"
};
