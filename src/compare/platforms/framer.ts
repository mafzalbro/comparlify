import { PlatformData } from "../types";

export const framer: PlatformData = {
  name: "Framer",
  website: "https://www.framer.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/Framer_Logo.svg",
  description: "The visual builder for professional sites. Framer feels like a design tool but outputs lightning-fast production code, making it the choice for designers who want to build high-end marketing sites.",
  rating: 4.8,
  easeOfUse: 4.7,
  featuresRating: 4.6,
  support: 4.5,
  pros: [
    "Figma-like design experience",
    "Best-in-class site performance and SEO",
    "Stunning built-in animations and effects",
    "Powerful CMS for blog and collection management",
    "Real-time collaboration"
  ],
  cons: [
    "Steep pricing for custom domains",
    "Scaling complex web apps is limited (better for static/marketing)",
    "Limited custom code control compared to Webflow",
    "No e-commerce native solution"
  ],
  tiers: [
    {
      name: "Mini",
      monthlyPrice: 10,
      annualPriceMonthlyEquivalent: 5,
      features: ["Custom domain", "Home page + 404", "1,000 visitors"],
      isPopular: false
    },
    {
      name: "Basic",
      monthlyPrice: 20,
      annualPriceMonthlyEquivalent: 15,
      features: ["Unlimited pages", "1 CMS collection", "10,000 visitors"],
      isPopular: true
    },
    {
      name: "Pro",
      monthlyPrice: 40,
      annualPriceMonthlyEquivalent: 30,
      features: ["Advanced CMS", "Analytics", "Staging environment", "200,000 visitors"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Design-to-Code", categoryName: "Workflow", hasFeature: true },
    { featureName: "Scroll Animations", categoryName: "Design", hasFeature: true },
    { featureName: "Visual CMS", categoryName: "Content", hasFeature: true },
    { featureName: "Figma Import", categoryName: "Integrations", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.framer.com/pricing"
};
