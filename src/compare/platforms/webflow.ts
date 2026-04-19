import { PlatformData } from "../types";

export const webflow: PlatformData = {
  name: "Webflow",
  website: "https://webflow.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Webflow_logo.svg",
  description: "The visual development platform. Webflow allows you to build completely custom, complex websites without writing code, offering total control over HTML, CSS, and JavaScript.",
  rating: 4.7,
  easeOfUse: 4.1,
  featuresRating: 5.0,
  support: 4.5,
  pros: [
    "Most powerful visual CSS/HTML control",
    "Sophisticated CMS and E-commerce native capability",
    "Clean code export for developers",
    "Advanced interactions and scrolling effects",
    "Enterprise-grade security and hosting"
  ],
  cons: [
    "Steepest learning curve of all no-code builders",
    "Pricing can get confusing (site plans vs workspace plans)",
    "Limited multi-user collaboration in lower tiers",
    "CMS limits can be restrictive for very large sites"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 18,
      annualPriceMonthlyEquivalent: 14,
      features: ["Custom domain", "Unlimited bandwidth", "500 form submissions"],
      isPopular: false
    },
    {
      name: "CMS",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 23,
      features: ["2,000 CMS items", "3 Content Editors", "Site-wide search"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 49,
      annualPriceMonthlyEquivalent: 39,
      features: ["10,000 CMS items", "10 Content Editors", "Form file uploads"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Visual Designer", categoryName: "Design", hasFeature: true },
    { featureName: "API & Webhooks", categoryName: "Developer", hasFeature: true },
    { featureName: "Hosting", categoryName: "Environment", hasFeature: true },
    { featureName: "Logic (Automations)", categoryName: "Business", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://webflow.com/pricing"
};
