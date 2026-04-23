import { PlatformData } from "../types";

export const medusa: PlatformData = {
  name: "Medusa",
  website: "https://medusajs.com",
  logoUrl: "https://medusajs.com/images/logo.png",
  description: "The world's most flexible open-source commerce platform. Medusa is built for developers who want full control over their commerce logic and infrastructure.",
  rating: 4.8,
  easeOfUse: 3.5,
  featuresRating: 4.9,
  support: 4.6,
  pros: [
    "Completely open-source and free to self-host",
    "Headless architecture for full frontend freedom",
    "Highly modular and extensible",
    "Excellent developer experience and documentation",
    "Growing ecosystem of plugins and integrations"
  ],
  cons: [
    "Requires technical expertise to set up and maintain",
    "Cloud hosting can get expensive as you scale",
    "Fewer out-of-the-box features than Shopify"
  ],
  tiers: [
    {
      name: "Develop",
      monthlyPrice: 29,
      features: ["Zero-config infra", "GitHub integration", "Medusa Cache", "Medusa Emails"],
      isPopular: false
    },
    {
      name: "Launch",
      monthlyPrice: 99,
      features: ["Autoscaling infra", "Custom domains", "Automatic backups", "Zero downtime"],
      isPopular: true
    },
    {
      name: "Scale",
      monthlyPrice: 299,
      features: ["Higher server capacity", "Background workers", "Priority support", "3 Cloud seats"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Headless Commerce", categoryName: "Architecture", hasFeature: true },
    { featureName: "Multi-currency", categoryName: "Sales", hasFeature: true },
    { featureName: "Plugin System", categoryName: "Ecosystem", hasFeature: true },
    { featureName: "RMA Flows", categoryName: "Operations", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://medusajs.com/pricing"
};
