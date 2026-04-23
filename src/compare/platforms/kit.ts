import { PlatformData } from "../types";

export const kit: PlatformData = {
  name: "Kit",
  website: "https://kit.com",
  logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1438865611/q3m2y5q3x6z8u2l3y3y2.png",
  description: "Formerly ConvertKit, Kit is the marketing platform for creators. It combines powerful email automation with landing pages and commerce tools designed specifically for digital entrepreneurs.",
  rating: 4.8,
  easeOfUse: 4.6,
  featuresRating: 4.9,
  support: 4.7,
  pros: [
    "Most intuitive visual automation builder",
    "Strong focus on deliverability and audience growth",
    "Excellent for building sales funnels",
    "Growing network of creator recommendations",
    "Includes basic commerce tools for digital products"
  ],
  cons: [
    "Pricing scales quickly with subscriber count",
    "Design options for emails are intentionally minimal (text-focused)",
    "Can be complex to set up for absolute beginners"
  ],
  tiers: [
    {
      name: "Newsletter",
      monthlyPrice: 0,
      features: ["Up to 10,000 subs", "Unlimited broadcasts", "Unlimited landing pages", "Recommendations"],
      isPopular: false
    },
    {
      name: "Creator",
      monthlyPrice: 33,
      annualPriceMonthlyEquivalent: 33, // This depends on subs, using base for 1k
      features: ["Unlimited Visual Automations", "Unlimited sequences", "Remove branding", "RSS campaigns"],
      isPopular: true
    },
    {
      name: "Pro",
      monthlyPrice: 66,
      annualPriceMonthlyEquivalent: 66,
      features: ["Unlimited users", "Insights dashboard", "Deliverability reports", "Referral system"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Visual Automations", categoryName: "Marketing", hasFeature: true },
    { featureName: "Landing Page Builder", categoryName: "Marketing", hasFeature: true },
    { featureName: "Creator Network", categoryName: "Growth", hasFeature: true },
    { featureName: "Subscriber Tagging", categoryName: "Segmentation", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://kit.com/pricing"
};
