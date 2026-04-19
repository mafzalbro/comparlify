import { PlatformData } from "../types";

export const heygen: PlatformData = {
  name: "HeyGen",
  website: "https://www.heygen.com",
  logoUrl: "https://heygen.com/favicon.ico",
  description: "The next generation of AI video creation. HeyGen allows you to create high-quality videos with talking avatars from text or photos, with industry-leading realism in lip-sync and motion.",
  rating: 4.9,
  easeOfUse: 4.8,
  featuresRating: 5.0,
  support: 4.5,
  pros: [
    "Most realistic AI avatars on the market",
    "Exceptional video translation and lip-sync",
    "Intuitive AI video editor interface",
    "Vast library of avatars and templates",
    "Allows for custom instant avatars"
  ],
  cons: [
    "Expensive credit-based pricing",
    "Processing time for high-quality videos can be significant",
    "Strict terms of service for deep-fake prevention"
  ],
  tiers: [
    {
      name: "Creator",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 24,
      features: ["15 credits/month", "Premium voices", "Auto-captions", "Avatar Lite"],
      isPopular: true
    },
    {
      name: "Team",
      monthlyPrice: 149,
      annualPriceMonthlyEquivalent: 120,
      features: ["30 credits/month", "4K resolution", "Brand kit", "Multi-user collaboration"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "AI Video Translation", categoryName: "Localization", hasFeature: true },
    { featureName: "Custom Instant Avatars", categoryName: "Personalization", hasFeature: true },
    { featureName: "Text-to-Speech", categoryName: "Audio", hasFeature: true },
    { featureName: "Talking Photos", categoryName: "Creative", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.heygen.com/pricing"
};
