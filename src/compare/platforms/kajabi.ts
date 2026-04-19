import { PlatformData } from "../types";

export const kajabi: PlatformData = {
  name: "Kajabi",
  website: "https://kajabi.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/46/Kajabi_Vertical_Logo_Transparent.png",
  description: "The premium all-in-one business platform for knowledge entrepreneurs. Kajabi provides everything from website building and email marketing to courses and coaching programs.",
  rating: 4.7,
  easeOfUse: 4.3,
  featuresRating: 4.9,
  support: 4.8,
  pros: [
    "Most comprehensive all-in-one feature set",
    "Sophisticated email marketing and pipelines (funnels)",
    "High-quality mobile app for courses",
    "Strong affiliate management system",
    "Excellent customer support and training resources"
  ],
  cons: [
    "Highest price point in the market",
    "Can be overwhelming for beginners",
    "Community features feel slightly dated compared to Skool/Circle",
    "Strict limits on the number of products/funnels in lower tiers"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 149,
      annualPriceMonthlyEquivalent: 119,
      features: ["3 Products", "3 Funnels", "Unlimited Emails", "10,000 Contacts"],
      isPopular: false
    },
    {
      name: "Growth",
      monthlyPrice: 199,
      annualPriceMonthlyEquivalent: 159,
      features: ["15 Products", "15 Funnels", "Affiliate Program", "25,000 Contacts"],
      isPopular: true
    },
    {
      name: "Pro",
      monthlyPrice: 399,
      annualPriceMonthlyEquivalent: 319,
      features: ["100 Products", "100 Funnels", "Code Editor access", "100,000 Contacts"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Email Automation", categoryName: "Marketing", hasFeature: true },
    { featureName: "Landing Page Builder", categoryName: "Marketing", hasFeature: true },
    { featureName: "Mobile App", categoryName: "Access", hasFeature: true },
    { featureName: "CRM", categoryName: "Business", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://kajabi.com/pricing"
};
