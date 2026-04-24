import { PlatformData } from "../types";

export const substack: PlatformData = {
  name: "Substack",
  website: "https://substack.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Substack_logo.svg/1200px-Substack_logo.svg.png",
  description: "The home for independent writing and culture. Substack makes it simple for writers to publish a newsletter and get paid by their most dedicated readers.",
  rating: 4.6,
  easeOfUse: 4.9,
  featuresRating: 4.1,
  support: 4.3,
  pros: [
    "Completely free to get started (no monthly cost)",
    "High trust and built-in network effects (Recommendations)",
    "Clean, professional writing interface",
    "Built-in podcasting and video support",
    "Writers own their audience and email list"
  ],
  cons: [
    "High 10% platform fee on paid subscriptions",
    "Very limited design and branding customization",
    "Limited advanced marketing features (no funnels/automations)",
    "No built-in landing page builder beyond the standard signup"
  ],
  tiers: [
    {
      name: "Publishing",
      monthlyPrice: 0,
      transactionFeePercent: 10,
      features: ["Unlimited newsletters", "Unlimited subscribers", "Podcasting", "Substack Notes"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "Paid Subscriptions", categoryName: "Monetization", hasFeature: true },
    { featureName: "Podcast Hosting", categoryName: "Media", hasFeature: true },
    { featureName: "Custom Domains", categoryName: "Branding", hasFeature: true },
    { featureName: "Community Notes", categoryName: "Social", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://substack.com/going-paid"
};
