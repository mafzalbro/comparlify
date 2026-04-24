import { PlatformData } from "../types";

export const mightynetworks: PlatformData = {
  name: "Mighty Networks",
  website: "https://mightynetworks.com",
  logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1481144047/p96jnxq8yqj7q2v2q8zq.png",
  description: "The platform for building community-powered businesses. Mighty Networks combines community, courses, and commerce in one place, under your own brand.",
  rating: 4.7,
  easeOfUse: 4.3,
  featuresRating: 4.8,
  support: 4.5,
  pros: [
    "Best-in-class community and engagement tools",
    "Sophisticated mobile app experience (and white-label options)",
    "Powerful AI co-host for community management",
    "Unlimited spaces and members on all plans",
    "Deeply integrated courses and events"
  ],
  cons: [
    "Higher transaction fees on lower tiers",
    "Site builder is not as flexible as dedicated web builders",
    "Learning curve for complex community structures"
  ],
  tiers: [
    {
      name: "Launch",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 79,
      transactionFeePercent: 2,
      features: ["Unlimited members", "Courses", "Events", "Livestreaming (20h/mo)"],
      isPopular: false
    },
    {
      name: "Scale",
      monthlyPrice: 219,
      annualPriceMonthlyEquivalent: 179,
      transactionFeePercent: 1,
      features: ["Kit integration", "Advanced analytics", "Migration support", "API access"],
      isPopular: true
    },
    {
      name: "Growth",
      monthlyPrice: 429,
      annualPriceMonthlyEquivalent: 354,
      transactionFeePercent: 0.5,
      features: ["Enhanced gamification", "Advanced automations", "White-label email", "Growth workshops"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Community Feed", categoryName: "Social", hasFeature: true },
    { featureName: "AI Co-host", categoryName: "AI", hasFeature: true },
    { featureName: "Livestreaming", categoryName: "Media", hasFeature: true },
    { featureName: "White-label Apps", categoryName: "Access", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://mightynetworks.com/pricing"
};
