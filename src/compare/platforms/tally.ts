import { PlatformData } from "../types";

export const tally: PlatformData = {
  name: "Tally",
  website: "https://tally.so",
  logoUrl: "https://tally.so/images/tally-logo.png",
  description: "The simplest way to create forms. Tally works like a document—just type your questions and publish. It offers a generous free tier and integrates seamlessly with common workspace tools.",
  rating: 4.9,
  easeOfUse: 5.0,
  featuresRating: 4.8,
  support: 4.8,
  pros: [
    "Most generous free tier (unlimited forms/responses)",
    "Notion-like experience (type '/' for commands)",
    "No-code and easy to embed",
    "Clean, minimalistic design out of the box",
    "Payments integration included in free tier"
  ],
  cons: [
    "Fewer advanced conversational features than Typeform",
    "Limited animation control",
    "Smaller template library than legacy competitors"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited forms", "Unlimited responses", "Collect payments", "File uploads", "Logic jumps"],
      isPopular: true
    },
    {
      name: "Tally Pro",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 24,
      features: ["No Tally branding", "Custom domains", "Partial submissions", "Collaborative workspaces"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Payments Integration", categoryName: "Monetization", hasFeature: true },
    { featureName: "Conditional Logic", categoryName: "Functionality", hasFeature: true },
    { featureName: "Custom Domains", categoryName: "Branding", hasFeature: true },
    { featureName: "API & Webhooks", categoryName: "Developer", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://tally.so/pricing"
};
