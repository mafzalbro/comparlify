import { PlatformData } from "../types";

export const mightynetworks: PlatformData = {
  name: "Mighty Networks",
  website: "https://www.mightynetworks.com",
  logoUrl: "https://www.mightynetworks.com/favicon.ico",
  description: "Mighty Networks is the 'powerhouse' of community platforms, designed for creators who want to build a whole new world for their audience. It is unique in its ability to combine community, courses, and commerce into a single, cohesive brand experience under your own domain and mobile app. Mighty's standout feature is its 'Mighty Co-Host' AI, which helps generate community content and icebreakers. For large organizations or creators with massive followings who want a 'walled garden' social network with a focus on deep connection and high-ticket memberships, Mighty Networks is the enterprise-grade solution.",
  rating: 4.7,
  easeOfUse: 4.2,
  featuresRating: 4.9,
  support: 4.6,
  pros: [
    "Unified community, courses, and live events",
    "Superior mobile app experience (branded app available)",
    "Powerful 'Mighty Co-Host' AI features",
    "Deep customization and white-labeling",
    "Excellent analytics and member insights"
  ],
  cons: [
    "Steeper learning curve for admins",
    "More expensive than Skool or Circle",
    "Can feel 'heavy' for small communities",
    "Branded app (Mighty Pro) is a significant investment"
  ],
  tiers: [
    {
      name: "Community",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 33,
      features: ["Native livestreaming", "Chat & messaging", "Events & Zoom integration"],
      isPopular: false
    },
    {
      name: "Courses",
      monthlyPrice: 119,
      annualPriceMonthlyEquivalent: 99,
      features: ["Unlimited courses", "AI features", "Detailed analytics"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 219,
      annualPriceMonthlyEquivalent: 179,
      features: ["Advanced analytics", "20+ Space templates", "Priority support"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Branded Mobile App", categoryName: "Access", hasFeature: true },
    { featureName: "AI Co-Host", categoryName: "Engagement", hasFeature: true },
    { featureName: "LMS & Courses", categoryName: "Education", hasFeature: true },
    { featureName: "Native Livestreaming", categoryName: "Events", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.mightynetworks.com/pricing"
};
