import { PlatformData } from "../types";

export const framer: PlatformData = {
  name: "Framer",
  website: "https://framer.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Framer_logo.svg/1200px-Framer_logo.svg.png",
  description: "The modern web builder for designers. Framer allows you to design and publish high-performance websites without writing code, with powerful animations and a relational CMS.",
  rating: 4.8,
  easeOfUse: 4.4,
  featuresRating: 4.9,
  support: 4.5,
  pros: [
    "Unmatched design flexibility and animation tools",
    "Figma-to-Web workflow is seamless",
    "Incredible performance and SEO out of the box",
    "Modern, intuitive interface",
    "Built-in AI tools for content and layout generation"
  ],
  cons: [
    "Steeper learning curve than simpler builders like Carrd",
    "CMS is powerful but can be complex to set up",
    "Limited native functionality for complex web applications (logic-heavy)",
    "Pricing is per-site, which can get expensive"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 15,
      annualPriceMonthlyEquivalent: 10,
      features: ["Personal sites", "Connect domain", "1,000 CMS items", "10GB Bandwidth"],
      isPopular: false
    },
    {
      name: "Pro",
      monthlyPrice: 45,
      annualPriceMonthlyEquivalent: 30,
      features: ["Commercial sites", "Staging environment", "10,000 CMS items", "100GB Bandwidth"],
      isPopular: true
    },
    {
      name: "Scale",
      monthlyPrice: 100,
      annualPriceMonthlyEquivalent: 100,
      features: ["High-traffic sites", "Advanced SEO", "Custom redirects", "200GB Bandwidth"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Visual Designer", categoryName: "Design", hasFeature: true },
    { featureName: "Advanced Animations", categoryName: "Design", hasFeature: true },
    { featureName: "Relational CMS", categoryName: "Content", hasFeature: true },
    { featureName: "Figma Integration", categoryName: "Workflow", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://framer.com/pricing"
};
