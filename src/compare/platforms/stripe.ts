import { PlatformData } from "../types";

export const stripe: PlatformData = {
  name: "Stripe",
  website: "https://stripe.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
  description: "Stripe is the 'Internet's Economy'—the incredibly powerful financial infrastructure that powers everything from tiny side projects to companies like Amazon and Google. It is the gold standard for developer-centric payments, offering unmatched flexibility and a suite of tools like Billing, Radar (fraud detection), and Tax. While it offers the lowest base transaction fees, the complexity of Stripe comes from the fact that *you* are the merchant of record, meaning you are responsible for filing taxes and managing compliance. It is the ultimate choice for teams with development resources who want total control over their checkout flow and financial logic.",
  rating: 4.9,
  easeOfUse: 4.0,
  featuresRating: 5.0,
  support: 4.2,
  pros: [
    "Most powerful and flexible API on the market",
    "Lowest standard transaction fees",
    "Instant payouts (in supported regions)",
    "Comprehensive financial reporting and analytics",
    "Integrates with virtually every software tool"
  ],
  cons: [
    "High technical knowledge required for custom setups",
    "You are responsible for global tax compliance",
    "Support can be difficult to reach for smaller accounts",
    "Account freezes can happen without warning"
  ],
  tiers: [
    {
      name: "Integrated",
      monthlyPrice: 0,
      features: ["2.9% + 30c per charge", "Global payments", "Real-time reporting", "24/7 Support"],
      isPopular: true
    },
    {
      name: "Custom",
      monthlyPrice: 0,
      features: ["Volume-based discounts", "Multi-product discounts", "Country-specific pricing"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Multi-currency Support", categoryName: "Payments", hasFeature: true },
    { featureName: "Fraud Prevention (Radar)", categoryName: "Security", hasFeature: true },
    { featureName: "Billing & Subscriptions", categoryName: "Finance", hasFeature: true },
    { featureName: "POS Integration", categoryName: "Retail", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://stripe.com/pricing"
};
