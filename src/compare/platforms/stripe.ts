import { PlatformData } from "../types";

export const stripe: PlatformData = {
  name: "Stripe",
  website: "https://stripe.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
  description: "The financial infrastructure for the internet. Stripe provides the most robust set of APIs for businesses of all sizes to accept payments, send payouts, and manage their businesses online.",
  rating: 4.9,
  easeOfUse: 4.2,
  featuresRating: 5.0,
  support: 4.4,
  pros: [
    "Lowest transaction fees for direct users",
    "Infinite scalability and customizability",
    "Supports hundreds of payment methods and currencies",
    "Best-in-class developer documentation",
    "Powerful mobile dashboard"
  ],
  cons: [
    "You are responsible for global tax and VAT compliance",
    "Steeper learning curve for non-developers",
    "Risk of sudden account freezes without warning",
    "Requires custom engineering for advanced SaaS features"
  ],
  tiers: [
    {
      name: "Integrated",
      monthlyPrice: 0,
      transactionFeePercent: 2.9,
      features: ["Custom UI toolkit", "Consolidated reporting", "Hundreds of feature updates per year"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "API Access", categoryName: "Developer", hasFeature: true },
    { featureName: "Mobile SDKs", categoryName: "Developer", hasFeature: true },
    { featureName: "Stripe Tax", categoryName: "Compliance", hasFeature: true, details: "Additional Fee" },
    { featureName: "Radar Fraud Detection", categoryName: "Security", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://stripe.com/pricing"
};
