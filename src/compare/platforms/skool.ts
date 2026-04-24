import { PlatformData } from "../types";

export const skool: PlatformData = {
  name: "Skool",
  website: "https://www.skool.com",
  logoUrl: "https://assets-global.website-files.com/6267768560010996886e08c0/6267768560010906236e08d6_skool-logo-white.svg",
  description: "Skool is the pioneer of 'gamified community'—a platform that merges courses, discussions, and events into a single, addictive interface. Designed by Sam Ovens to solve the engagement crisis in online learning, Skool replaces clunky LMS systems with a sleek, social-media-style feed. Its genius lies in the leaderboard and points system, which incentivizes members to contribute and learn, effectively turning your customers into your most active brand ambassadors. It’s the platform of choice for creators who believe that community is the product, not just an add-on to a course.",
  rating: 4.8,
  easeOfUse: 4.9,
  featuresRating: 4.5,
  support: 4.7,
  pros: [
    "Highest engagement rates via gamification",
    "Extremely simple, clean user interface",
    "Unified calendar for community events",
    "Native iOS and Android apps included",
    "Auto-generation of lead magnets"
  ],
  cons: [
    "One-size-fits-all pricing ($99/mo)",
    "Limited course player customization",
    "No native email marketing (requires Zapier)",
    "Less control over branding than Circle"
  ],
  affiliateLink: "https://www.skool.com/refer?ref=comparlify",
  tiers: [
    {
      name: "All-in-One",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 99,
      features: ["One group", "Unlimited courses", "Unlimited members", "Gamification", "Calendar"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "Leaderboards", categoryName: "Gamification", hasFeature: true },
    { featureName: "Event Calendar", categoryName: "Community", hasFeature: true },
    { featureName: "LMS", categoryName: "Education", hasFeature: true },
    { featureName: "Native App", categoryName: "Access", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.skool.com/pricing"
};
