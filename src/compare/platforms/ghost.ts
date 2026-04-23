import { PlatformData } from "../types";

export const ghost: PlatformData = {
  name: "Ghost",
  website: "https://ghost.org",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ghost-Logo.svg/1200px-Ghost-Logo.svg.png",
  description: "The world's most popular open-source newsletter platform. Ghost is built for independent publishers who want to own their audience and build a sustainable business around their content.",
  rating: 4.8,
  easeOfUse: 4.7,
  featuresRating: 4.6,
  support: 4.5,
  pros: [
    "Zero transaction fees on paid subscriptions",
    "Complete control over design and branding",
    "Open-source and highly extensible",
    "Excellent SEO and site performance",
    "Clean, focused writing experience"
  ],
  cons: [
    "Self-hosting requires technical knowledge",
    "Managed hosting (Ghost(Pro)) is more expensive than some competitors",
    "Fewer built-in marketing automation tools than specialized platforms"
  ],
  tiers: [
    {
      name: "Starter",
      monthlyPrice: 18,
      annualPriceMonthlyEquivalent: 15,
      features: ["1,000 Members", "Newsletter", "Custom domain", "1 Staff user"],
      isPopular: false
    },
    {
      name: "Creator",
      monthlyPrice: 31,
      annualPriceMonthlyEquivalent: 25,
      features: ["1,000 Members", "Custom themes", "500+ Integrations", "2 Staff users"],
      isPopular: true
    },
    {
      name: "Team",
      monthlyPrice: 63,
      annualPriceMonthlyEquivalent: 50,
      features: ["1,000 Members", "Priority support", "Advanced analytics", "5 Staff users"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Paid Subscriptions", categoryName: "Monetization", hasFeature: true },
    { featureName: "Custom Themes", categoryName: "Branding", hasFeature: true },
    { featureName: "Newsletter Sends", categoryName: "Marketing", hasFeature: true },
    { featureName: "SEO Tools", categoryName: "Optimization", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://ghost.org/pricing"
};
