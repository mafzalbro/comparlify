import { PlatformData } from "../types";

export const gumroad: PlatformData = {
  name: "Gumroad",
  website: "https://gumroad.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Gumroad_Logo.png",
  description: "A simple, yet powerful e-commerce platform for creators. Sell anything from digital products and subscriptions to physical goods with a focus on ease of setup.",
  rating: 4.5,
  easeOfUse: 4.8,
  featuresRating: 4.1,
  support: 3.8,
  pros: [
    "Simple one-page checkout functionality",
    "Built-in marketplace for discovery",
    "No monthly fees",
    "Handles VAT for digital products",
    "Integrated email marketing tools"
  ],
  cons: [
    "High flat fee of 10% on every sale",
    "Limited branding on the checkout page",
    "Lack of professional SaaS-focused features",
    "Recent fee changes have been controversial among large creators"
  ],
  tiers: [
    {
      name: "Flat Fee",
      monthlyPrice: 0,
      transactionFeePercent: 10,
      features: ["All features included", "No monthly fee", "VAT handling"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "VAT Collection", categoryName: "Compliance", hasFeature: true },
    { featureName: "Affiliate Support", categoryName: "Marketing", hasFeature: true },
    { featureName: "Memberships", categoryName: "Subscription", hasFeature: true },
    { featureName: "Mobile App", categoryName: "Access", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://gumroad.com/pricing"
};
