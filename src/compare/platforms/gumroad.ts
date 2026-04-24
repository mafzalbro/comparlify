import { PlatformData } from "../types";

export const gumroad: PlatformData = {
  name: "Gumroad",
  website: "https://gumroad.com",
  logoUrl: "https://assets.gumroad.com/assets/logo-g-9ae0790a0136b136f1979c9759d2a04c051cde5f7caf59231750793e387245ca.svg",
  description: "The most powerful platform for creators to sell digital products, memberships, and more directly to their audience. Simple, transparent pricing with no monthly fees.",
  rating: 4.5,
  easeOfUse: 4.8,
  featuresRating: 4.2,
  support: 4.0,
  pros: [
    "Extremely simple setup and easy to use",
    "No monthly subscription fees",
    "Acts as Merchant of Record (handles global taxes)",
    "Built-in affiliate system",
    "Discover marketplace for extra reach"
  ],
  cons: [
    "High flat 10% transaction fee",
    "Limited customization of checkout pages",
    "Customer support can be slow",
    "Discover marketplace takes a 30% cut"
  ],
  tiers: [
    {
      name: "Standard",
      monthlyPrice: 0,
      transactionFeePercent: 10,
      features: ["Unlimited products", "Unlimited posts", "Unlimited members", "Global tax handling"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "Tax/VAT Handling", categoryName: "Compliance", hasFeature: true },
    { featureName: "Email Marketing", categoryName: "Marketing", hasFeature: true },
    { featureName: "Digital Downloads", categoryName: "Sales", hasFeature: true },
    { featureName: "Memberships", categoryName: "Sales", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://gumroad.com/pricing"
};
