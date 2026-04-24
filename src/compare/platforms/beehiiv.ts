import { PlatformData } from "../types";

export const beehiiv: PlatformData = {
  name: "Beehiiv",
  website: "https://www.beehiiv.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Beehiiv_logo.png",
  description: "Beehiiv has rapidly emerged as the 'secret weapon' for high-growth newsletters, founded by the masterminds who scaled Morning Brew to millions. Unlike legacy providers that tax your success, Beehiiv offers a flat-rate model that lets you keep 100% of your subscription revenue. Its true power lies in its native growth engine—featuring a world-class referral program, a built-in ad network for instant monetization, and 'Boosts' that allow you to pay-for-performance to acquire new subscribers. If you're looking to turn a simple newsletter into a media empire with high-end analytics and seamless SEO, Beehiiv is the modern standard.",
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
      features: ["Up to 2,500 subscribers", "Unlimited sends", "Custom Website", "Custom Domains"],
      isPopular: false
    },
    {
      name: "Scale",
      monthlyPrice: 49,
      annualPriceMonthlyEquivalent: 43,
      features: ["Ad Network", "Boosts Network", "Automations", "Surveys & Polls"],
      isPopular: true
    },
    {
      name: "Max",
      monthlyPrice: 109,
      annualPriceMonthlyEquivalent: 96,
      features: ["Remove beehiiv Branding", "Priority Support", "Unlimited Teams", "Dynamic Content"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Referral Program", categoryName: "Growth", hasFeature: true },
    { featureName: "Ad Network", categoryName: "Monetization", hasFeature: true },
    { featureName: "Custom Domains", categoryName: "Branding", hasFeature: true },
    { featureName: "A/B Testing", categoryName: "Optimization", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.beehiiv.com/pricing"
};
