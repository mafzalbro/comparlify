import { PlatformData } from "../types";

export const patreon: PlatformData = {
  name: "Patreon",
  website: "https://patreon.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/94/Patreon_logo.svg",
  description: "Patreon is the pioneer that defined the 'membership' economy, allowing fans to become active participants in the work of their favorite creators. It is the gold standard for YouTubers, podcasters, and artists who want to build a reliable, monthly recurring income. While many platforms have since added membership features, Patreon’s power lies in its name recognition and the trust it has built with millions of patrons worldwide. With its new 'Commerce' features and native video hosting, it has evolved from a simple donation button into a full-scale creative business hub where you can sell digital goods and host a private community under one roof.",
  rating: 4.4,
  easeOfUse: 4.8,
  featuresRating: 4.0,
  support: 3.8,
  pros: [
    "Most recognized membership platform in the world",
    "Extremely easy for fans to join and pay",
    "Native video hosting included (Pro tier)",
    "Strong integration with Discord and YouTube",
    "New 'Commerce' features for one-time sales"
  ],
  cons: [
    "High revenue share (up to 12%)",
    "Limited design and branding flexibility",
    "Community features are basic compared to Circle/Skool",
    "Limited email marketing capabilities"
  ],
  tiers: [
    {
      name: "Pro",
      monthlyPrice: 0,
      features: ["8% Revenue share", "Membership tiers", "Analytics", "App integrations"],
      isPopular: true
    },
    {
      name: "Premium",
      monthlyPrice: 0,
      features: ["12% Revenue share", "Dedicated account manager", "Merch for membership"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Membership Tiers", categoryName: "Monetization", hasFeature: true },
    { featureName: "Native Video", categoryName: "Content", hasFeature: true },
    { featureName: "Discord Integration", categoryName: "Community", hasFeature: true },
    { featureName: "Merch Fulfillment", categoryName: "Sales", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.patreon.com/pricing"
};
