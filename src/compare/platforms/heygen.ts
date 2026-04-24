import { PlatformData } from "../types";

export const heygen: PlatformData = {
  name: "HeyGen",
  website: "https://www.heygen.com",
  logoUrl: "https://www.heygen.com/favicon.ico",
  description: "HeyGen is the undisputed leader in AI video generation, specializing in hyper-realistic digital avatars that look and speak just like real humans. It has revolutionized corporate training, marketing, and personalized sales by allowing users to create high-quality video content from a simple text script. With its 'Instant Avatar' feature, you can clone yourself in minutes, enabling you to produce hundreds of personalized videos without ever stepping in front of a camera again. For teams looking to scale their video production while maintaining a 'human' touch, HeyGen is the gold standard.",
  rating: 4.8,
  easeOfUse: 4.7,
  featuresRating: 4.9,
  support: 4.5,
  pros: [
    "Most realistic AI avatars on the market",
    "Seamless 'Instant Avatar' cloning technology",
    "Support for 40+ languages and accents",
    "Personalized video messaging at scale",
    "Intuitive, drag-and-drop video editor"
  ],
  cons: [
    "Expensive credit-based pricing",
    "Rendering times can be slow for long videos",
    "Strict content moderation policies",
    "Lower tiers have limited avatar choices"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["1 Credit", "1 Instant Avatar", "Standard voices", "HeyGen watermark"],
      isPopular: false
    },
    {
      name: "Creator",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 24,
      features: ["15 Credits/mo", "Premium voices", "No watermark", "Fast rendering"],
      isPopular: true
    },
    {
      name: "Team",
      monthlyPrice: 149,
      annualPriceMonthlyEquivalent: 120,
      features: ["30 Credits/mo", "4K resolution", "Brand kit", "Multi-user access"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Instant Avatar", categoryName: "AI", hasFeature: true },
    { featureName: "Voice Cloning", categoryName: "AI", hasFeature: true },
    { featureName: "Multi-language Support", categoryName: "Content", hasFeature: true },
    { featureName: "Video API", categoryName: "Developer", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.heygen.com/pricing"
};
