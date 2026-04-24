import { PlatformData } from "../types";

export const webflow: PlatformData = {
  name: "Webflow",
  website: "https://webflow.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Webflow_logo.svg",
  description: "Webflow is the professional's choice for building custom, enterprise-grade websites without a developer. While it has a steeper learning curve than Framer, it offers unparalleled control over the box model, CSS properties, and database logic. Webflow's true strength lies in its scalability—powering everything from individual portfolios to massive marketing sites for companies like Zendesk and Dell. With its 'Logic' engine and robust CMS, it can handle complex membership sites and e-commerce with ease. It’s the platform you choose when you want the power of custom code but the speed of a visual interface, all backed by world-class hosting and security.",
  rating: 4.7,
  easeOfUse: 3.5,
  featuresRating: 5.0,
  support: 4.4,
  pros: [
    "Full control over HTML, CSS, and JS",
    "Enterprise-level security and scalability",
    "Extremely powerful and flexible CMS",
    "Integrated E-commerce and Membership tools",
    "Huge ecosystem of templates and experts"
  ],
  cons: [
    "Steepest learning curve of all visual builders",
    "Pricing can be confusing and expensive as you scale",
    "No offline editing or local hosting",
    "Interactions can be difficult to master"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 18,
      annualPriceMonthlyEquivalent: 14,
      features: ["Custom domain", "0 CMS items", "500 form submissions", "50GB Bandwidth"],
      isPopular: false
    },
    {
      name: "CMS",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 23,
      features: ["2,000 CMS items", "1,000 form submissions", "3 content editors", "200GB Bandwidth"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 49,
      annualPriceMonthlyEquivalent: 39,
      features: ["10,000 CMS items", "2,500 form submissions", "10 content editors", "400GB Bandwidth"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Box Model Control", categoryName: "Design", hasFeature: true },
    { featureName: "Enterprise Hosting", categoryName: "Infrastructure", hasFeature: true },
    { featureName: "Native CMS", categoryName: "Content", hasFeature: true },
    { featureName: "E-commerce", categoryName: "Sales", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://webflow.com/pricing"
};
