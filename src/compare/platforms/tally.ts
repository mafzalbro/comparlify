import { PlatformData } from "../types";

export const tally: PlatformData = {
  name: "Tally",
  website: "https://tally.so",
  logoUrl: "https://tally.so/images/logo_v2.png",
  description: "The simplest way to create forms. Tally works like a document and lets you build any form in seconds, without code, and for free.",
  rating: 4.9,
  easeOfUse: 5.0,
  featuresRating: 4.6,
  support: 4.8,
  pros: [
    "Unlimited forms and submissions for free",
    "Intuitive Notion-like editor",
    "Advanced features like logic and calculations are free",
    "Clean, modern form designs",
    "GDPR compliant and privacy-focused"
  ],
  cons: [
    "Branding removal requires a paid plan",
    "Custom domains require a paid plan",
    "Fewer native integrations than Typeform",
    "No quiz-specific scoring features in free tier"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited forms", "Unlimited submissions", "Logic & calculations", "Payment collection"],
      isPopular: true
    },
    {
      name: "Pro",
      monthlyPrice: 24,
      annualPriceMonthlyEquivalent: 20,
      features: ["No Tally branding", "Custom domains", "Partial submissions", "Custom CSS"],
      isPopular: false
    },
    {
      name: "Business",
      monthlyPrice: 74,
      features: ["Verify emails", "Data retention controls", "Everything in Pro"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Conditional Logic", categoryName: "Forms", hasFeature: true },
    { featureName: "Payment Collection", categoryName: "Forms", hasFeature: true },
    { featureName: "Custom Domains", categoryName: "Branding", hasFeature: true },
    { featureName: "Airtable Integration", categoryName: "Integrations", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://tally.so/pricing"
};
