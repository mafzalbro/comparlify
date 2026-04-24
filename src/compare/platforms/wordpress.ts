import { PlatformData } from "../types";

export const wordpress: PlatformData = {
  name: "WordPress",
  website: "https://wordpress.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Wordpress_Blue_logo.png/1200px-Wordpress_Blue_logo.png",
  description: "WordPress is the undisputed king of the internet, powering over 40% of all websites globally. It has survived every 'killer' app and platform because of its radical open-source philosophy and its infinite extensibility. Through its massive ecosystem of over 60,000 plugins and thousands of themes, you can turn a WordPress site into literally anything—from a simple hobby blog to a global e-commerce empire (via WooCommerce) or a complex membership site. While it has a steeper learning curve than 'all-in-one' builders, WordPress offers the ultimate insurance policy: you own your data, your code, and your platform entirely. If you want a site that can grow with you for the next 20 years, WordPress is the foundation you build on.",
  rating: 4.5,
  easeOfUse: 3.8,
  featuresRating: 5.0,
  support: 4.4,
  pros: [
    "Unmatched flexibility through plugins and themes",
    "Excellent SEO out of the box",
    "Writers own their content completely",
    "Strong community support and documentation",
    "Scalable from simple blogs to complex stores"
  ],
  cons: [
    "Steeper learning curve than visual builders",
    "Requires maintenance (updates, security)",
    "Can become bloated with too many plugins"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited pages", "Unlimited posts", "Basic themes"],
      isPopular: false
    },
    {
      name: "Business",
      monthlyPrice: 40,
      annualPriceMonthlyEquivalent: 25,
      features: ["Install plugins", "Custom themes", "Daily backups", "Premium support"],
      isPopular: true
    },
    {
      name: "Commerce",
      monthlyPrice: 70,
      annualPriceMonthlyEquivalent: 45,
      features: ["Unlimited products", "Accept payments in 60+ countries", "Advanced shipping"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Plugin System", categoryName: "Ecosystem", hasFeature: true },
    { featureName: "SEO Tools", categoryName: "Optimization", hasFeature: true },
    { featureName: "Custom CSS", categoryName: "Branding", hasFeature: true },
    { featureName: "Post Revision History", categoryName: "Content", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://wordpress.com/pricing/"
};
