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
      name: "Starter",
      monthlyPrice: 89,
      annualPriceMonthlyEquivalent: 71,
      features: ["1 Product", "250 Contacts", "1 Website", "1 Community", "Unlimited Emails"],
      isPopular: false
    },
    {
      name: "Basic",
      monthlyPrice: 179,
      annualPriceMonthlyEquivalent: 143,
      features: ["5 Products", "2,500 Contacts", "1 Website", "1 Community", "Unlimited Emails"],
      isPopular: false
    },
    {
      name: "Growth",
      monthlyPrice: 249,
      annualPriceMonthlyEquivalent: 199,
      features: ["50 Products", "25,000 Contacts", "1 Website", "1 Community", "Affiliate Program"],
      isPopular: true
    },
    {
      name: "Pro",
      monthlyPrice: 499,
      annualPriceMonthlyEquivalent: 399,
      features: ["Unlimited Products", "100,000 Contacts", "3 Websites", "3 Communities", "Code Editor"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Email Automation", categoryName: "Marketing", hasFeature: true },
    { featureName: "Landing Page Builder", categoryName: "Marketing", hasFeature: true },
    { featureName: "Mobile App", categoryName: "Access", hasFeature: true },
    { featureName: "CRM", categoryName: "Business", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://kajabi.com/pricing"
};
