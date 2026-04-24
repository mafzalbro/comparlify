import { PlatformData } from "../types";

export const framer: PlatformData = {
  name: "Framer",
  website: "https://framer.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Framer_logo.svg/1200px-Framer_logo.svg.png",
  description: "Framer has effectively killed the gap between 'design' and 'development.' It is the only web builder that feels as fluid as Figma but outputs production-ready, lightning-fast code. For designers and marketing teams, Framer is a superpower—enabling the creation of world-class landing pages with complex scroll animations, 3D effects, and custom transitions without ever touching a line of CSS. Its CMS is surprisingly robust, and with the 'Figma to HTML' plugin, you can literally copy-paste your designs directly onto the live web. If your goal is to build a site that looks like it cost $50,000 in development time, Framer is your best friend.",
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
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://framer.com/pricing"
};
