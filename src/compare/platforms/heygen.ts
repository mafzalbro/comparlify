import { PlatformData } from "../types";

export const heygen: PlatformData = {
  name: "HeyGen",
  website: "https://heygen.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/HeyGen_logo.svg/1200px-HeyGen_logo.svg.png",
  description: "Leading AI video generation platform. HeyGen allows you to create professional videos with realistic AI avatars and voices, perfect for marketing, sales, and training.",
  rating: 4.8,
  easeOfUse: 4.7,
  featuresRating: 4.9,
  support: 4.5,
  pros: [
    "Incredibly realistic AI avatars and lip-syncing",
    "Wide range of voices and languages supported",
    "Easy-to-use video editor with templates",
    "High-quality video exports (up to 4K)",
    "Strong API for automated video creation"
  ],
  cons: [
    "Can be expensive for high-volume video production",
    "Credits based system can be confusing",
    "Occasional rendering times during peak hours"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["3 videos/mo", "1-min duration", "Standard processing", "720p export"],
      isPopular: false
    },
    {
      name: "Creator",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 24,
      features: ["30-min duration/mo", "Watermark removal", "1080p export", "Voice cloning"],
      isPopular: true
    },
    {
      name: "Pro",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 72,
      features: ["90-min duration/mo", "4K export", "Fast processing", "Personal avatars"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "AI Avatars", categoryName: "Media", hasFeature: true },
    { featureName: "Voice Cloning", categoryName: "Media", hasFeature: true },
    { featureName: "Video Translation", categoryName: "Localization", hasFeature: true },
    { featureName: "Talking Photos", categoryName: "Media", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://heygen.com/pricing"
};
