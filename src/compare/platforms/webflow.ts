import { PlatformData } from "../types";

export const webflow: PlatformData = {
  name: "Webflow",
  website: "https://webflow.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Webflow_logo.svg/1200px-Webflow_logo.svg.png",
  description: "The leading visual development platform. Webflow gives designers the power of code (HTML, CSS, JS) in a visual interface, allowing for the creation of complex, custom websites.",
  rating: 4.7,
  easeOfUse: 3.8,
  featuresRating: 5.0,
  support: 4.6,
  pros: [
    "Complete control over HTML, CSS, and interactions",
    "Highly scalable and secure hosting",
    "Powerful CMS with flexible data structures",
    "Massive ecosystem of templates and experts",
    "Excellent for agencies and complex marketing sites"
  ],
  cons: [
    "Steepest learning curve of any visual builder",
    "Complex pricing structure (Site vs Workspace plans)",
    "Can be overkill for simple websites",
    "Native logic and app building features are still evolving"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 18,
      annualPriceMonthlyEquivalent: 14,
      features: ["Custom domain", "150 static pages", "Unlimited form submits", "Webflow AI"],
      isPopular: false
    },
    {
      name: "CMS",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 23,
      features: ["2,000 CMS items", "3 Editor seats", "Site search", "Unlimited form submits"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 49,
      annualPriceMonthlyEquivalent: 39,
      features: ["10,000 CMS items", "10 Editor seats", "Form file uploads", "Surge protection"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Visual Box Model", categoryName: "Design", hasFeature: true },
    { featureName: "Interactions (GSAP)", categoryName: "Design", hasFeature: true },
    { featureName: "Logic (Automations)", categoryName: "Functionality", hasFeature: true },
    { featureName: "Localization", categoryName: "Content", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://webflow.com/pricing"
};
