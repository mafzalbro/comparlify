import { PlatformData } from "../types";

export const thinkific: PlatformData = {
  name: "Thinkific",
  website: "https://thinkific.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Thinkific_logo.svg/1200px-Thinkific_logo.svg.png",
  description: "The power of Thinkific is in its scalability. Whether you're an individual creator or a large company, Thinkific provides the tools to build, market, and sell online courses.",
  rating: 4.7,
  easeOfUse: 4.4,
  featuresRating: 4.8,
  support: 4.6,
  pros: [
    "Highly scalable for large organizations",
    "Powerful app store for integrations",
    "Excellent student management and tracking",
    "Zero transaction fees on their native payments",
    "Strong emphasis on student success and outcomes"
  ],
  cons: [
    "Free trial is time-limited (30 days)",
    "Checkout experience can be more complex to customize",
    "Some marketing features require external tools"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 49,
      annualPriceMonthlyEquivalent: 36,
      features: ["Unlimited courses", "1 Community", "Custom domain", "Basic analytics"],
      isPopular: false
    },
    {
      name: "Start",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 74,
      features: ["Assignments", "Certificates", "Memberships", "2 Admin accounts"],
      isPopular: true
    },
    {
      name: "Grow",
      monthlyPrice: 199,
      annualPriceMonthlyEquivalent: 149,
      features: ["Remove branding", "3 Communities", "Phone support", "Bulk student imports"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Drip Content", categoryName: "Education", hasFeature: true },
    { featureName: "Student Analytics", categoryName: "Reporting", hasFeature: true },
    { featureName: "App Store", categoryName: "Integrations", hasFeature: true },
    { featureName: "Certificates", categoryName: "Education", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://thinkific.com/pricing"
};
