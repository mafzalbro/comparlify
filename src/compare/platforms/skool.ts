import { PlatformData } from "../types";

export const skool: PlatformData = {
  name: "Skool",
  website: "https://www.skool.com",
  logoUrl: "https://www.skool.com/assets/favicon.ico",
  description: "The simplest community-first platform for creators. Skool combines community, courses, and gamification into a single, high-engagement interface.",
  rating: 4.8,
  easeOfUse: 5.0,
  featuresRating: 4.5,
  support: 4.7,
  pros: [
    "Unbeatable simplicity for both creators and members",
    "High engagement through points and leaderboards",
    "Clean, zero-distraction UX",
    "Fast and responsive mobile experience",
    "Single price for all features"
  ],
  cons: [
    "Limited custom branding (no custom fonts/colors)",
    "Checkout capabilities are limited compared to Kajabi",
    "No built-in email marketing automation",
    "Fewer advanced course delivery features (quizzes, etc.)"
  ],
  tiers: [
    {
      name: "All-in-One",
      monthlyPrice: 99,
      features: ["Unlimited members", "Unlimited courses", "Community", "Calendar", "Leaderboards"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "Community Feed", categoryName: "Social", hasFeature: true },
    { featureName: "Course Hosting", categoryName: "Education", hasFeature: true },
    { featureName: "Leaderboards", categoryName: "Gamification", hasFeature: true },
    { featureName: "Group Calendar", categoryName: "Events", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.skool.com/pricing"
};
