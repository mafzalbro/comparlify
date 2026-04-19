import { PlatformData } from "../types";

export const medusa: PlatformData = {
  name: "Medusa",
  website: "https://medusajs.com",
  logoUrl: "https://medusajs.com/images/logo.png",
  description: "The open-source alternative to Shopify. Medusa provides a headless commerce engine for developers who need to build custom, high-scale digital commerce experiences.",
  rating: 4.8,
  easeOfUse: 3.2,
  featuresRating: 4.9,
  support: 4.3,
  pros: [
    "Full ownership of source code and data",
    "Highly extensible and developer-friendly",
    "Native headless architecture (use any frontend)",
    "Strong support for multi-currency and multi-region",
    "Active open-source community"
  ],
  cons: [
    "Requires technical expertise to set up and manage",
    "You are responsible for hosting and security",
    "Fewer out-of-the-box integrations than Shopify",
    "No official marketplace for simple one-click apps"
  ],
  tiers: [
    {
      name: "Open Source",
      monthlyPrice: 0,
      features: ["All core features", "Self-hosted", "Unlimited admin users", "Unlimited products"],
      isPopular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 2000,
      features: ["Priority support", "Governance tools", "Custom SLAs", "Dedicated success manager"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Headless Core", categoryName: "Architecture", hasFeature: true },
    { featureName: "Multi-Region Support", categoryName: "Commerce", hasFeature: true },
    { featureName: "Plug-and-play Admin", categoryName: "Workflow", hasFeature: true },
    { featureName: "Source Control", categoryName: "Developer", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://medusajs.com"
};
