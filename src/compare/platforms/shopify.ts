import { PlatformData } from "../types";

export const shopify: PlatformData = {
  name: "Shopify",
  website: "https://www.shopify.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Shopify_logo.svg",
  description: "The commerce platform for everyone. Shopify powers millions of businesses worldwide with an all-in-one solution to start, sell, market, and manage an e-commerce business of any size.",
  rating: 4.9,
  easeOfUse: 4.8,
  featuresRating: 5.0,
  support: 4.7,
  pros: [
    "Most reliable and scalable e-commerce infrastructure",
    "Massive app ecosystem (thousands of integrations)",
    "Superior POS integration for physical retail",
    "Best-in-class checkout performance (Shop Pay)",
    "Robust built-in marketing and SEO tools"
  ],
  cons: [
    "Monthly costs add up with app subscriptions",
    "Transaction fees if not using Shopify Payments",
    "Customizing core checkout logic is limited (requires Shopify Plus)",
    "Liquid templating language has a learning curve for some designers"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 29,
      features: ["All core commerce tools", "2 staff accounts", "4 warehouse locations"],
      isPopular: true
    },
    {
      name: "Shopify",
      monthlyPrice: 105,
      annualPriceMonthlyEquivalent: 79,
      features: ["Professional reports", "5 staff accounts", "5 warehouse locations"],
      isPopular: false
    },
    {
      name: "Advanced",
      monthlyPrice: 399,
      annualPriceMonthlyEquivalent: 299,
      features: ["Custom report builder", "calculated shipping rates", "15 staff accounts"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Shop Pay Checkout", categoryName: "Performance", hasFeature: true },
    { featureName: "App Store", categoryName: "Ecosystem", hasFeature: true },
    { featureName: "Point of Sale", categoryName: "Retail", hasFeature: true },
    { featureName: "Abandoned Cart Recovery", categoryName: "Marketing", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.shopify.com/pricing"
};
