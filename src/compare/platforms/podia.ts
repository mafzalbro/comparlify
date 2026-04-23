import { PlatformData } from "../types";

export const podia: PlatformData = {
  name: "Podia",
  website: "https://podia.com",
  logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1491295904/p96jnxq8yqj7q2v2q8zq.png",
  description: "The all-in-one creator platform for websites, email marketing, and digital products. Podia replaces multiple tools with a single, easy-to-use interface.",
  rating: 4.7,
  easeOfUse: 4.9,
  featuresRating: 4.5,
  support: 4.8,
  pros: [
    "Incredibly user-friendly and clean interface",
    "Unlimited products and hosting on all paid plans",
    "Integrated email marketing and community",
    "No transaction fees on most plans",
    "Free migration from other platforms"
  ],
  cons: [
    "Email marketing features are less advanced than dedicated tools",
    "Limited customization of site design",
    "Community features are basic compared to specialized platforms"
  ],
  tiers: [
    {
      name: "Mover",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 33,
      transactionFeePercent: 5,
      features: ["Unlimited products", "Full website", "Email marketing", "7-day support"],
      isPopular: true
    },
    {
      name: "Shaker",
      monthlyPrice: 89,
      annualPriceMonthlyEquivalent: 75,
      transactionFeePercent: 0,
      features: ["Affiliate marketing", "Third-party code", "Remove branding", "Unlimited members"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Email Marketing", categoryName: "Marketing", hasFeature: true },
    { featureName: "Digital Downloads", categoryName: "Sales", hasFeature: true },
    { featureName: "Webinars", categoryName: "Media", hasFeature: true },
    { featureName: "Custom Domain", categoryName: "Branding", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://podia.com/pricing"
};
