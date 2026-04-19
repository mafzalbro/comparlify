import { PlatformData } from "../types";

export const circle: PlatformData = {
  name: "Circle",
  website: "https://circle.so",
  logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/p5n7l0y5oy7j9a0z2y7v",
  description: "The modern community platform for creators. Circle brings together your discussions, courses, members, and events in one place, integrated with your own brand and website.",
  rating: 4.7,
  easeOfUse: 4.6,
  featuresRating: 4.8,
  support: 4.5,
  pros: [
    "Perfect balance between community and course hosting",
    "Highly customizable branding and white-label options",
    "Excellent live stream integration",
    "Strong CRM and member management tools",
    "Robust API and third-party integrations"
  ],
  cons: [
    "Steeper price than Skool",
    "Can take longer to set up correctly",
    "Revenue share on lower tiers if not using own processor",
    "Some features can feel fragmented across different spaces"
  ],
  tiers: [
    {
      name: "Professional",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 89,
      features: ["Unlimited members", "Courses", "Live streaming", "Chat", "Full CSS customization"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 219,
      annualPriceMonthlyEquivalent: 199,
      features: ["Workflows", "Advanced analytics", "Priority support", "Email removal"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Live Streaming", categoryName: "Engagement", hasFeature: true },
    { featureName: "Workflows (Automation)", categoryName: "Business", hasFeature: true },
    { featureName: "Custom CSS", categoryName: "Branding", hasFeature: true },
    { featureName: "Directory & Profiles", categoryName: "Community", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://circle.so/pricing"
};
