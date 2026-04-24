import { PlatformData } from "../types";

export const podia: PlatformData = {
  name: "Podia",
  website: "https://podia.com",
  logoUrl: "https://podia.com/favicon.ico",
  description: "Podia is the 'all-in-one' platform for creators who prioritize simplicity and kindness. It was built to eliminate the 'tech stress' of selling digital products, offering courses, downloads, webinars, and a community under one roof. Podia’s standout feature is its beautiful, minimalist design and its commitment to 'zero transaction fees' on paid plans. It’s perfect for the solo creator who wants a professional-looking site and a seamless buying experience for their customers, without the steep learning curve or high price tag of Kajabi.",
  rating: 4.7,
  easeOfUse: 4.9,
  featuresRating: 4.4,
  support: 4.9,
  pros: [
    "Zero transaction fees (on paid plans)",
    "Incredibly simple and beautiful interface",
    "Consolidates courses, downloads, and community",
    "Free migrations from other platforms",
    "World-class customer support"
  ],
  cons: [
    "Limited advanced marketing automations",
    "Less design flexibility than dedicated site builders",
    "Community features are newer and simpler",
    "No mobile app for students"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Full website", "Community", "1 Download", "8% fee"],
      isPopular: false
    },
    {
      name: "Starter",
      monthlyPrice: 9,
      annualPriceMonthlyEquivalent: 4,
      features: ["Custom domain", "Chat support", "8% fee"],
      isPopular: false
    },
    {
      name: "Mover",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 33,
      features: ["Zero transaction fees", "Unlimited courses", "Unlimited downloads"],
      isPopular: true
    },
    {
      name: "Shaker",
      monthlyPrice: 89,
      annualPriceMonthlyEquivalent: 75,
      features: ["Affiliate marketing", "Embedded checkout", "White-labeling"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Digital Downloads", categoryName: "Sales", hasFeature: true },
    { featureName: "Course Hosting", categoryName: "Education", hasFeature: true },
    { featureName: "Email Marketing", categoryName: "Marketing", hasFeature: true },
    { featureName: "Community", categoryName: "Engagement", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://podia.com/pricing"
};
