import { PlatformData } from "../types";

export const stripe: PlatformData = {
  name: "Stripe",
  website: "https://stripe.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png",
  description: "The infrastructure for the internet economy. Stripe's suite of APIs and products powers payments for businesses of all sizes, from startups to global enterprises.",
  rating: 4.9,
  easeOfUse: 4.2,
  featuresRating: 5.0,
  support: 4.5,
  pros: [
    "Industry-standard for reliability and security",
    "Most comprehensive payment API in the world",
    "Support for 135+ currencies and 100+ payment methods",
    "Excellent developer documentation and tools",
    "Robust subscription management with Stripe Billing"
  ],
  cons: [
    "Steeper learning curve for non-developers",
    "Not a Merchant of Record by default (unless using Managed Payments)",
    "Manual tax compliance setup (unless using Stripe Tax)",
    "Fees can add up with multiple add-on services"
  ],
  tiers: [
    {
      name: "Standard",
      monthlyPrice: 0,
      transactionFeePercent: 2.9,
      features: ["Global Payments", "Fraud Protection (Radar)", "Checkout & Payment Links", "Reporting"],
      isPopular: true
    },
    {
      name: "Managed Payments",
      monthlyPrice: 0,
      transactionFeePercent: 6.4,
      features: ["Merchant of Record", "Tax Compliance", "Dispute Management", "Global Payouts"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Global Tax (Stripe Tax)", categoryName: "Compliance", hasFeature: true },
    { featureName: "Subscription Billing", categoryName: "Billing", hasFeature: true },
    { featureName: "Mobile SDKs", categoryName: "Access", hasFeature: true },
    { featureName: "Fraud Prevention", categoryName: "Security", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://stripe.com/pricing"
};
