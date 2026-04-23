import { PlatformData } from "../types";

export const teachable: PlatformData = {
  name: "Teachable",
  website: "https://teachable.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Teachable_logo.png/1200px-Teachable_logo.png",
  description: "Create and sell online courses and coaching services. Teachable provides a simple interface for creators to build their brand and earn money from their expertise.",
  rating: 4.6,
  easeOfUse: 4.5,
  featuresRating: 4.4,
  support: 4.3,
  pros: [
    "Very easy to set up and use",
    "Comprehensive course building tools",
    "Handles VAT and taxes automatically",
    "Strong mobile app for students",
    "Built-in affiliate marketing"
  ],
  cons: [
    "High transaction fees on lower tiers",
    "Limited customization compared to self-hosted options",
    "Some features locked behind higher price points"
  ],
  tiers: [
    {
      name: "Starter",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 29,
      transactionFeePercent: 7.5,
      features: ["5 Products", "1 Admin User", "Course Builder", "Tax Handling"],
      isPopular: false
    },
    {
      name: "Builder",
      monthlyPrice: 89,
      annualPriceMonthlyEquivalent: 69,
      transactionFeePercent: 0,
      features: ["10 Products", "1 Admin User", "Custom Domain", "Remove Branding"],
      isPopular: true
    },
    {
      name: "Growth",
      monthlyPrice: 189,
      annualPriceMonthlyEquivalent: 139,
      transactionFeePercent: 0,
      features: ["50 Products", "5 Admin Users", "Advanced Reports", "Affiliate Program"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Course Builder", categoryName: "Education", hasFeature: true },
    { featureName: "Tax Handling", categoryName: "Compliance", hasFeature: true },
    { featureName: "Mobile App", categoryName: "Access", hasFeature: true },
    { featureName: "Affiliate System", categoryName: "Marketing", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://teachable.com/pricing"
};
