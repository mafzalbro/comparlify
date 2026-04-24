import { PlatformData } from "../types";

export const discord: PlatformData = {
  name: "Discord",
  website: "https://discord.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/73/Discord_Color_Text_Logo_2022.svg",
  description: "Discord has evolved from a gaming chat app into the world's most dynamic 'real-time community' engine. For creators, it offers an unparalleled level of energy and direct access to their audience through voice, video, and text channels. Unlike static forums or Facebook groups, Discord is 'always-on,' fostering a sense of belonging and subculture that other platforms struggle to replicate. With its robust API, bot ecosystem (like Midjourney or MEE6), and native 'Server Subscriptions' for monetization, Discord allows you to build a complex, automated, and highly engaging digital home that feels like a private club for your most dedicated fans.",
  rating: 4.6,
  easeOfUse: 4.0,
  featuresRating: 5.0,
  support: 3.5,
  pros: [
    "Highest level of real-time community engagement",
    "Infinite customizability via bots and API",
    "Seamless voice and video chat integrated",
    "Native 'Server Subscriptions' for monetization",
    "Completely free to start and host"
  ],
  cons: [
    "High 'noise' level and steep learning curve for new users",
    "Minimal control over design and branding",
    "Poor SEO—content is hidden behind a login",
    "Lack of structured course/LMS features"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited members", "Unlimited channels", "Voice & Video", "Standard bots"],
      isPopular: true
    },
    {
      name: "Server Boosted",
      monthlyPrice: 0,
      features: ["Paid for by members", "Better audio quality", "Custom emojis", "Banner images"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Real-time Chat", categoryName: "Community", hasFeature: true },
    { featureName: "Voice & Video Channels", categoryName: "Communication", hasFeature: true },
    { featureName: "Bot API", categoryName: "Extensibility", hasFeature: true },
    { featureName: "Role-based Permissions", categoryName: "Management", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://discord.com/servers"
};
