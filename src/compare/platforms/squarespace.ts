import { PlatformData } from "../types";

export const squarespace: PlatformData = {
  name: "Squarespace",
  website: "https://squarespace.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Squarespace_logo.svg/1200px-Squarespace_logo.svg.png",
  description: "Squarespace is the gold standard for 'aesthetic' web design—the builder that essentially forced the rest of the industry to care about typography and whitespace. It is the choice for photographers, designers, and luxury brands who want their website to look like a high-end magazine out of the box. While Wix offers total freedom, Squarespace provides 'guarded' design, ensuring that even a non-designer can't easily break the layout. With its 'Fluid Engine' editor, powerful built-in e-commerce, and native 'Acuity Scheduling' integration, Squarespace has evolved into a sophisticated, all-in-one business platform that prioritizes polish, stability, and premium brand perception above all else.",
  rating: 4.7,
  easeOfUse: 4.5,
  featuresRating: 4.4,
  support: 4.6,
  pros: [
    "Unrivaled aesthetic design and typography",
    "Best-in-class commerce and scheduling integrations",
    "Extremely stable and secure managed platform",
    "Intuitive 'Fluid Engine' for flexible layouts",
    "Excellent built-in marketing and social tools"
  ],
  cons: [
    "Higher entry price than some competitors",
    "Not as much third-party app flexibility as Shopify",
    "Customization is more rigid than Wix's free-form editor"
  ],
  tiers: [
    {
      name: "Personal",
      monthlyPrice: 25,
      annualPriceMonthlyEquivalent: 16,
      features: ["Unlimited bandwidth", "Free custom domain", "Basic metrics", "2 Contributors"],
      isPopular: false
    },
    {
      name: "Business",
      monthlyPrice: 36,
      annualPriceMonthlyEquivalent: 23,
      features: ["Professional email from Google", "Advanced analytics", "Fully integrated eCommerce", "Unlimited contributors"],
      isPopular: true
    },
    {
      name: "Commerce Basic",
      monthlyPrice: 40,
      annualPriceMonthlyEquivalent: 28,
      features: ["0% transaction fees", "Customer accounts", "Point of sale", "Powerful selling tools"],
      isPopular: false
    },
    {
      name: "Commerce Advanced",
      monthlyPrice: 72,
      annualPriceMonthlyEquivalent: 52,
      features: ["Abandoned cart recovery", "Sell subscriptions", "Advanced shipping", "Discount automation"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Award-winning Templates", categoryName: "Design", hasFeature: true },
    { featureName: "Acuity Scheduling", categoryName: "Business", hasFeature: true },
    { featureName: "Email Campaigns", categoryName: "Marketing", hasFeature: true },
    { featureName: "E-commerce Engine", categoryName: "Sales", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://squarespace.com/pricing"
};
