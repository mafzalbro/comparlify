import { PlatformData } from "../types";

export const patreon: PlatformData = {
  name: "Patreon",
  website: "https://patreon.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Patreon_logo.svg/1200px-Patreon_logo.svg.png",
  description: "The best place for creators to build memberships by providing exclusive access to their work and a deeper connection with their communities.",
  rating: 4.6,
  easeOfUse: 4.7,
  featuresRating: 4.3,
  support: 4.2,
  pros: [
    "Most recognized membership platform for creators",
    "Easy to set up recurring payments",
    "Built-in community engagement tools",
    "Strong mobile app for creators and patrons",
    "Free to start (only pay when you earn)"
  ],
  cons: [
    "High platform percentage fees (8-12%)",
    "Limited branding options for the page",
    "No built-in course hosting features"
  ],
  tiers: [
    {
      name: "Pro",
      monthlyPrice: 0,
      transactionFeePercent: 8,
      features: ["Unlimited tiers", "Analytics", "Special Offers tool", "Workshops"],
      isPopular: true
    },
    {
      name: "Premium",
      monthlyPrice: 0,
      transactionFeePercent: 12,
      features: ["Dedicated Account Manager", "Merch for Membership", "Team Accounts"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Membership Tiers", categoryName: "Sales", hasFeature: true },
    { featureName: "Community Feed", categoryName: "Social", hasFeature: true },
    { featureName: "Merch Fulfillment", categoryName: "Operations", hasFeature: true },
    { featureName: "Mobile App", categoryName: "Access", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.patreon.com/pricing"
};
