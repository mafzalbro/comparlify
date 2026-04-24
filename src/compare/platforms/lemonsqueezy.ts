import { PlatformData } from "../types";

export const lemonsqueezy: PlatformData = {
  name: "Lemon Squeezy",
  website: "https://www.lemonsqueezy.com",
  logoUrl: "https://www.lemonsqueezy.com/images/logo.png",
  description: "Lemon Squeezy is the Merchant of Record (MoR) that developers and SaaS founders actually enjoy using. It solves the most painful part of selling digital products globally: sales tax, VAT, and international compliance. By acting as the seller of record, Lemon Squeezy takes the legal and tax liability off your shoulders, allowing you to focus on building code. With a gorgeous checkout experience, native subscription management, and an affiliate system that 'just works,' it has quickly become the preferred alternative to Stripe for those who want to launch global products without a team of tax lawyers.",
  rating: 4.8,
  easeOfUse: 4.9,
  featuresRating: 4.6,
  support: 4.5,
  pros: [
    "Handles all global tax and VAT compliance",
    "Beautiful, high-converting checkout flows",
    "Native affiliate marketing management",
    "Easy subscription and license key management",
    "Developer-first API and webhooks"
  ],
  cons: [
    "Higher transaction fees than pure processors",
    "Payouts are scheduled, not instant",
    "Stricter 'acceptable use' policies for certain niches"
  ],
  tiers: [
    {
      name: "Standard",
      monthlyPrice: 0,
      features: ["5% + 50c per transaction", "Global tax compliance", "Subscription management", "Affiliate platform"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "Merchant of Record", categoryName: "Compliance", hasFeature: true },
    { featureName: "Subscription Management", categoryName: "Payments", hasFeature: true },
    { featureName: "Affiliate Center", categoryName: "Growth", hasFeature: true },
    { featureName: "API Access", categoryName: "Developer", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.lemonsqueezy.com/pricing"
};
