import { PlatformData } from "../types";

export const synthesia: PlatformData = {
  name: "Synthesia",
  website: "https://www.synthesia.io",
  logoUrl: "https://www.synthesia.io/favicon.ico",
  description: "Synthesia is the enterprise-grade AI video platform that turned 'text-to-video' into a reality for the world's biggest brands. While HeyGen focuses on marketing and sales, Synthesia is the king of L&D (Learning and Development) and corporate communications. It offers a massive library of 150+ diverse avatars and supports over 120 languages, making it the perfect tool for global companies to localize their training materials in minutes. With its robust API and focus on security (SOC2 compliant), Synthesia is built for scale, allowing organizations to maintain consistent brand messaging across thousands of videos without the cost of a traditional film crew.",
  rating: 4.7,
  easeOfUse: 4.6,
  featuresRating: 4.8,
  support: 4.4,
  pros: [
    "Widest selection of diverse AI avatars",
    "Best-in-class multi-language localization",
    "Enterprise-grade security and SOC2 compliance",
    "Powerful API for automated video generation",
    "Professional templates for training and corporate use"
  ],
  cons: [
    "Pricing can be high for high-volume users",
    "Lip-syncing can occasionally look 'uncanny'",
    "Less focus on 'personalized' video messaging than HeyGen",
    "Limited animation controls compared to traditional editors"
  ],
  tiers: [
    {
      name: "Starter",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 22,
      features: ["120 mins/year", "1 User", "70+ Avatars", "120+ Languages"],
      isPopular: false
    },
    {
      name: "Creator",
      monthlyPrice: 89,
      annualPriceMonthlyEquivalent: 67,
      features: ["360 mins/year", "1 User", "90+ Avatars", "Custom Avatars"],
      isPopular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 500,
      features: ["Unlimited mins", "SAML/SSO", "Dedicated support", "Brand kits"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Multi-language AI", categoryName: "Content", hasFeature: true },
    { featureName: "Enterprise Security", categoryName: "Compliance", hasFeature: true },
    { featureName: "API Access", categoryName: "Developer", hasFeature: true },
    { featureName: "Interactive Video", categoryName: "Experience", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.synthesia.io/pricing"
};
