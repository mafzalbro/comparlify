import { PlatformData } from "../types";

export const ga4: PlatformData = {
  name: "Google Analytics 4",
  website: "https://analytics.google.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Google_Analytics_logo.svg",
  description: "Google Analytics 4 (GA4) is the world’s most powerful and widely used analytics platform, redesigned from the ground up to handle a future without third-party cookies. Unlike its predecessor, GA4 is 'event-based,' meaning it tracks every single interaction (clicks, scrolls, file downloads) as a distinct event rather than a pageview. This makes it incredibly powerful for mobile apps and complex web applications. While it has a notoriously high learning curve and a cluttered UI, the depth of data available—especially when integrated with Google Ads and BigQuery—is unmatched by any other free tool. It is the 'Big Data' solution for everyone from solo bloggers to Fortune 500 companies.",
  rating: 4.0,
  easeOfUse: 2.0,
  featuresRating: 5.0,
  support: 3.5,
  pros: [
    "Most advanced data modeling and AI insights",
    "Completely free for the vast majority of users",
    "Deep integration with Google Ads ecosystem",
    "Native BigQuery export for custom analysis",
    "Cross-platform tracking (Web + App)"
  ],
  cons: [
    "Extremely steep learning curve",
    "Confusing UI compared to Plausible",
    "Privacy concerns and cookie banner requirements",
    "Data takes 24-48 hours to fully process"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited data collection", "Standard reports", "Google Ads integration", "BigQuery export"],
      isPopular: true
    },
    {
      name: "Analytics 360",
      monthlyPrice: 2500,
      features: ["Advanced governance", "Unsampled reports", "Higher data limits", "SLA support"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Event-based Tracking", categoryName: "Analytics", hasFeature: true },
    { featureName: "Predictive Insights", categoryName: "AI", hasFeature: true },
    { featureName: "BigQuery Export", categoryName: "Data", hasFeature: true },
    { featureName: "Custom Explorations", categoryName: "Reporting", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://marketingplatform.google.com/about/analytics/pricing/"
};
