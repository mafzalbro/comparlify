import { PlatformData } from "../types";

export const discord: PlatformData = {
  name: "Discord",
  website: "https://discord.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Discord_Logo_white.svg/1200px-Discord_Logo_white.svg.png",
  description: "The easiest way to talk over voice, video, and text. Talk, chat, hang out, and stay close with your friends and communities.",
  rating: 4.8,
  easeOfUse: 4.5,
  featuresRating: 4.9,
  support: 4.4,
  pros: [
    "Best-in-class real-time voice and video chat",
    "Highly flexible role and permission system",
    "Massive ecosystem of bots and integrations",
    "Completely free for most users",
    "Excellent mobile and desktop applications"
  ],
  cons: [
    "Steep learning curve for server administrators",
    "Can feel chaotic for large communities",
    "Limited built-in monetization compared to dedicated platforms"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited servers", "Voice & Video", "Standard file limits", "Basic roles"],
      isPopular: true
    },
    {
      name: "Nitro Basic",
      monthlyPrice: 2.99,
      features: ["Custom emojis", "50MB Uploads", "Nitro badges", "Custom backgrounds"],
      isPopular: false
    },
    {
      name: "Nitro",
      monthlyPrice: 9.99,
      features: ["500MB Uploads", "HD Streaming", "2 Server Boosts", "Custom profiles"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Voice Channels", categoryName: "Communication", hasFeature: true },
    { featureName: "Role System", categoryName: "Management", hasFeature: true },
    { featureName: "Screen Sharing", categoryName: "Collaboration", hasFeature: true },
    { featureName: "Bot API", categoryName: "Ecosystem", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://discord.com/nitro"
};
