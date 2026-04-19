import { PlatformData } from "../types";

export const beehiiv: PlatformData = {
  name: "Beehiiv",
  website: "https://www.beehiiv.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Beehiiv_logo.png",
  description: "The newsletter platform built for growth. Founded by the team behind Morning Brew, Beehiiv focuses on scale with built-in referral systems, ad networks, and advanced segmentation.",
  rating: 4.8,
  easeOfUse: 4.5,
  featuresRating: 4.9,
  support: 4.7,
  pros: [
    "Zero revenue share on subscriptions",
    "Advanced referral program tracking",
    "Built-in ad network for monetization",
    "Robust SEO and custom domain support",
    "Excellent analytics dashboard"
  ],
  cons: [
    "Learning curve for advanced features",
    "Higher monthly cost than Substacks free tier",
    "Limited offline editing tools"
  ],
  affiliateLink: "https://www.beehiiv.com/?via=comparlify",
  tiers: [
    {
      name: "Launch",
      monthlyPrice: 0,
      features: ["Up to 2,500 subscribers", "Unlimited sends", "Basic analytics"],
      isPopular: false
    },
    {
      name: "Scale",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 33,
      features: ["Referral program", "Ad Network", "Premium subscriptions", "Custom domains"],
      isPopular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 84,
      features: ["Multiple publications", "Priority support", "Advanced API access"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Referral Program", categoryName: "Growth", hasFeature: true },
    { featureName: "Ad Network", categoryName: "Monetization", hasFeature: true },
    { featureName: "Custom Domains", categoryName: "Branding", hasFeature: true },
    { featureName: "A/B Testing", categoryName: "Optimization", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.beehiiv.com/pricing"
};
