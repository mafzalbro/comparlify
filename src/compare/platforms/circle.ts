import { PlatformData } from "../types";

export const circle: PlatformData = {
  name: "Circle",
  website: "https://circle.so",
  logoUrl: "https://circle.so/wp-content/uploads/2021/01/Circle-Logo-Purple.png",
  description: "Circle is the premier platform for building 'white-label' communities that feel like your own brand, not a rented social network. It strikes the perfect balance between the structured organization of a forum and the real-time energy of a chat app. Circle is the choice for creators and brands who want to host workshops, manage memberships, and foster deep discussions in a clean, professional environment. With deep integrations into tools like Kajabi and Teachable, it allows you to add a world-class community layer to your existing business without forcing members to create yet another login.",
  rating: 4.8,
  easeOfUse: 4.7,
  featuresRating: 4.8,
  support: 4.7,
  pros: [
    "Most beautiful and professional UI",
    "Superior white-labeling and branding",
    "Excellent live streaming and event hosting",
    "Robust API and integration ecosystem",
    "Clean, threaded discussions"
  ],
  cons: [
    "Higher entry price than some alternatives",
    "Less 'native' gamification than Skool",
    "Mobile app is good, but white-labeling it is expensive",
    "Course features are newer and less mature than Kajabi"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 49,
      annualPriceMonthlyEquivalent: 39,
      features: ["Engaging discussions", "Member directory", "Mobile app", "Unlimited members"],
      isPopular: false
    },
    {
      name: "Professional",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 89,
      features: ["Courses", "Live streaming", "Detailed analytics", "Custom domain"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 219,
      annualPriceMonthlyEquivalent: 199,
      features: ["Workflows", "Custom profile fields", "Priority support", "Single Sign-On (SSO)"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Live Streaming", categoryName: "Events", hasFeature: true },
    { featureName: "Threaded Chat", categoryName: "Community", hasFeature: true },
    { featureName: "White-labeling", categoryName: "Branding", hasFeature: true },
    { featureName: "SSO", categoryName: "Access", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://circle.so/pricing"
};
