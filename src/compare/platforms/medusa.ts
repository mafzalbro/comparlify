import { PlatformData } from "../types";

export const medusa: PlatformData = {
  name: "Medusa",
  website: "https://medusajs.com",
  logoUrl: "https://medusajs.com/favicon.ico",
  description: "Medusa is the open-source 'Shopify Alternative' built for developers who demand total control. It is a headless commerce engine that gives you the building blocks to create unique, high-performance shopping experiences without the constraints of traditional platforms. Medusa's 'modular' architecture means you can swap out your payment processor, CMS, or fulfillment logic with ease. For brands that have outgrown the rigid structures of Shopify and need a custom checkout flow, multi-currency support, or complex inventory management, Medusa provides the flexibility of a custom-built solution with the speed of a ready-made framework.",
  rating: 4.8,
  easeOfUse: 3.0,
  featuresRating: 5.0,
  support: 4.5,
  pros: [
    "Complete architectural freedom (Headless)",
    "No monthly subscription or transaction fees",
    "Modern tech stack (Node.js, React, PostgreSQL)",
    "Thriving developer community and plugin ecosystem",
    "Infinite scalability for complex business models"
  ],
  cons: [
    "Requires significant engineering resources",
    "No hosted version (you manage the infrastructure)",
    "No built-in 'theme store' like Shopify",
    "Admin dashboard is powerful but basic in design"
  ],
  tiers: [
    {
      name: "Open Source",
      monthlyPrice: 0,
      features: ["Full source code", "Self-hosted", "Community support", "Custom modules"],
      isPopular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 2000,
      features: ["SLA support", "Dedicated account manager", "Training & onboarding"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Headless Engine", categoryName: "Architecture", hasFeature: true },
    { featureName: "Multi-currency", categoryName: "Sales", hasFeature: true },
    { featureName: "Plugin Ecosystem", categoryName: "Extensibility", hasFeature: true },
    { featureName: "Custom Checkout", categoryName: "Sales", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://medusajs.com"
};
