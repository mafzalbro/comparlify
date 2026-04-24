import { PlatformData } from "../types";

export const shopify: PlatformData = {
  name: "Shopify",
  website: "https://www.shopify.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Shopify_logo_2018.svg",
  description: "Shopify is the global engine of e-commerce—a platform so powerful and ubiquitous that it handles billions of dollars in transactions every year. It is the ultimate 'all-in-one' for retail, offering everything from a drag-and-drop store builder to enterprise-grade POS systems and fulfillment logistics. Shopify's greatest strength is its massive App Store, which allows you to extend your store's functionality with thousands of third-party tools. Whether you're selling a single t-shirt or running a multi-billion dollar brand like SKIMS, Shopify provides the reliability, security, and checkout speed (Shop Pay) that set the industry benchmark.",
  rating: 4.8,
  easeOfUse: 4.5,
  featuresRating: 5.0,
  support: 4.7,
  pros: [
    "World's best checkout experience (Shop Pay)",
    "Massive ecosystem of apps and themes",
    "Flawless stability and security",
    "Seamless omnichannel selling (Social, Web, POS)",
    "Excellent built-in marketing and SEO tools"
  ],
  cons: [
    "Transaction fees if not using Shopify Payments",
    "Monthly costs can skyrocket with app subscriptions",
    "Liquid templating language can be restrictive for devs",
    "Limited control over the checkout process (unless on Plus)"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 29,
      features: ["Unlimited products", "2 Staff accounts", "24/7 Support", "Basic reports"],
      isPopular: false
    },
    {
      name: "Shopify",
      monthlyPrice: 105,
      annualPriceMonthlyEquivalent: 79,
      features: ["Professional reports", "5 Staff accounts", "Lower transaction fees"],
      isPopular: true
    },
    {
      name: "Advanced",
      monthlyPrice: 399,
      annualPriceMonthlyEquivalent: 299,
      features: ["Custom report builder", "15 Staff accounts", "Duties & import taxes"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Shop Pay Checkout", categoryName: "Sales", hasFeature: true },
    { featureName: "App Store", categoryName: "Extensibility", hasFeature: true },
    { featureName: "Omnichannel Selling", categoryName: "Marketing", hasFeature: true },
    { featureName: "POS Integration", categoryName: "Retail", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.shopify.com/pricing"
};
