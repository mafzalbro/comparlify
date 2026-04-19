import { PlatformData } from "../types";

export const lemonsqueezy: PlatformData = {
  name: "Lemon Squeezy",
  website: "https://www.lemonsqueezy.com",
  logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/eeyc9bzkixmzz9x0j9jz",
  description: "The all-in-one platform for running your SaaS business. As a Merchant of Record, Lemon Squeezy handles global tax, compliance, and fraud so you can focus on building.",
  rating: 4.9,
  easeOfUse: 4.8,
  featuresRating: 4.7,
  support: 4.6,
  pros: [
    "Merchant of Record (Automatic tax/VAT handling)",
    "Built for SaaS with integrated licensing",
    "Beautiful, high-converting checkout overlays",
    "Abandoned cart recovery included",
    "No monthly fees"
  ],
  cons: [
    "Slightly higher transaction fees than raw Stripe",
    "Limited customization of checkout pages compared to self-hosted",
    "Payouts have a holding period"
  ],
  tiers: [
    {
      name: "Standard",
      monthlyPrice: 0,
      transactionFeePercent: 5,
      features: ["Global Tax Compliance", "Fraud Prevention", "Unlimited Products", "Checkout Overlays"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "Tax/VAT Handling", categoryName: "Compliance", hasFeature: true },
    { featureName: "Subscription Billing", categoryName: "Billing", hasFeature: true },
    { featureName: "Affiliate Center", categoryName: "Marketing", hasFeature: true },
    { featureName: "SaaS Licensing", categoryName: "SaaS", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.lemonsqueezy.com/pricing"
};
