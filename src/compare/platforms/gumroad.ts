import { PlatformData } from "../types";

export const gumroad: PlatformData = {
  name: "Gumroad",
  website: "https://gumroad.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Gumroad_logo.png",
  description: "Gumroad is the 'OG' platform for creators who want to sell something in sixty seconds. Built on the philosophy of radical simplicity, Gumroad eliminates the barriers between an idea and a sale. It is particularly beloved by artists, writers, and designers who want a 'shopfront' without the overhead of a full e-commerce store. While its 10% flat fee is higher than some competitors, it covers everything from hosting to basic email marketing. Gumroad's 'Discover' marketplace also provides a unique opportunity for creators to get their products in front of a massive existing audience, making it a great starting point for anyone's first digital dollar.",
  rating: 4.4,
  easeOfUse: 5.0,
  featuresRating: 3.8,
  support: 3.5,
  pros: [
    "Easiest setup in the industry",
    "No monthly subscription fees",
    "Built-in 'Discover' marketplace for exposure",
    "Supports physical and digital products",
    "Clean, minimalist checkout experience"
  ],
  cons: [
    "High 10% flat transaction fee",
    "Very limited email automation",
    "Basic design customization",
    "Lack of advanced LMS/course features"
  ],
  tiers: [
    {
      name: "Standard",
      monthlyPrice: 0,
      features: ["10% Flat fee", "Unlimited products", "Email marketing", "Analytics"],
      isPopular: true
    }
  ],
  features: [
    { featureName: "Digital Downloads", categoryName: "Sales", hasFeature: true },
    { featureName: "Memberships", categoryName: "Sales", hasFeature: true },
    { featureName: "Affiliate Center", categoryName: "Growth", hasFeature: true },
    { featureName: "Discovery Marketplace", categoryName: "Growth", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://gumroad.com/pricing"
};
