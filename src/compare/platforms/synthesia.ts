import { PlatformData } from "../types";

export const synthesia: PlatformData = {
  name: "Synthesia",
  website: "https://synthesia.io",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Synthesia_logo.svg/1200px-Synthesia_logo.svg.png",
  description: "The #1 AI video communications platform. Synthesia enables businesses to create professional videos in minutes with AI avatars, replacing expensive cameras and studios.",
  rating: 4.7,
  easeOfUse: 4.6,
  featuresRating: 4.8,
  support: 4.4,
  pros: [
    "Enterprise-grade security and SOC 2 compliance",
    "Massive library of 160+ AI avatars",
    "Automatic translation into 120+ languages",
    "Powerful collaboration features for teams",
    "Excellent for corporate training and internal comms"
  ],
  cons: [
    "High starting price for teams",
    "Personal plan has limits on video minutes",
    "Avatar movements can sometimes feel slightly robotic"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["10-min video/mo", "9 AI avatars", "1 editor seat"],
      isPopular: false
    },
    {
      name: "Starter",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 18,
      features: ["120-min video/yr", "125+ AI avatars", "AI Dubbing"],
      isPopular: true
    },
    {
      name: "Creator",
      monthlyPrice: 89,
      annualPriceMonthlyEquivalent: 64,
      features: ["360-min video/yr", "180+ AI avatars", "Custom fonts"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Enterprise Security", categoryName: "Security", hasFeature: true },
    { featureName: "AI Dubbing", categoryName: "Localization", hasFeature: true },
    { featureName: "SCORM Export", categoryName: "Education", hasFeature: true },
    { featureName: "Interactive Video", categoryName: "Engagement", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://synthesia.io/pricing"
};
