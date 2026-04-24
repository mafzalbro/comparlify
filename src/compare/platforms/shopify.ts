import { PlatformData } from "../types";

export const shopify: PlatformData = {
  name: "Shopify",
  website: "https://shopify.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/1200px-Shopify_logo_2018.svg.png",
  description: "The global commerce platform. Shopify powers millions of businesses worldwide with everything they need to sell online, in-store, and everywhere in between.",
  rating: 4.8,
  easeOfUse: 4.6,
  featuresRating: 5.0,
  support: 4.8,
  pros: [
    "Most comprehensive ecommerce ecosystem and app store",
    "World-class checkout experience optimized for conversion",
    "Seamless multi-channel selling (Social, POS, Web)",
    "Highly reliable and scalable infrastructure",
    "Excellent 24/7 support"
  ],
  cons: [
    "Transaction fees if not using Shopify Payments",
    "Monthly costs can increase quickly with apps",
    "Limited customization of core checkout on lower tiers",
    "Liquid template language has a learning curve for developers"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 29,
      features: ["Online Store", "Unlimited Products", "2 Staff accounts", "Basic Analytics"],
      isPopular: true
    },
    {
      name: "Shopify (Grow)",
      monthlyPrice: 105,
      annualPriceMonthlyEquivalent: 79,
      features: ["Professional Reports", "5 Staff accounts", "Lower credit card rates"],
      isPopular: false
    },
    {
      name: "Advanced",
      monthlyPrice: 399,
      annualPriceMonthlyEquivalent: 299,
      features: ["Custom report builder", "15 Staff accounts", "Duty and import taxes"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Shopify Checkout", categoryName: "Sales", hasFeature: true },
    { featureName: "App Store", categoryName: "Ecosystem", hasFeature: true },
    { featureName: "Shopify POS", categoryName: "Sales", hasFeature: true },
    { featureName: "Abandoned Cart Recovery", categoryName: "Marketing", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://shopify.com/pricing"
};
