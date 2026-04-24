import { PlatformData } from "../types";

export const teachable: PlatformData = {
  name: "Teachable",
  website: "https://teachable.com",
  logoUrl: "https://teachable.com/favicon.ico",
  description: "Teachable is the 'friendly' course platform that has helped over 100,000 creators share their knowledge with the world. It is designed to be as simple as possible, allowing you to upload your videos, create a curriculum, and start selling in an afternoon. While it doesn't have the complex marketing pipelines of Kajabi, it excels at the 'student experience'—providing a clean, distraction-free environment for learning. With its built-in tax handling (via Teachable:pay) and solid affiliate management, it's a great choice for creators who want to own their data and brand without the high overhead of more complex systems.",
  rating: 4.6,
  easeOfUse: 4.8,
  featuresRating: 4.3,
  support: 4.2,
  pros: [
    "Extremely easy and fast to set up",
    "Handles global sales tax and VAT (with Teachable:pay)",
    "Excellent student experience and interface",
    "Strong affiliate marketing tools",
    "Great free tier to get started"
  ],
  cons: [
    "Transaction fees on lower tiers",
    "Limited design and branding flexibility",
    "No native community features (requires integrations)",
    "Email marketing is basic"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["1 Course", "Unlimited students", "$1 + 10% fee", "Basic quizzes"],
      isPopular: false
    },
    {
      name: "Basic",
      monthlyPrice: 59,
      annualPriceMonthlyEquivalent: 39,
      features: ["5% fee", "5 Courses", "Custom domain", "Email marketing"],
      isPopular: true
    },
    {
      name: "Pro",
      monthlyPrice: 159,
      annualPriceMonthlyEquivalent: 119,
      features: ["0% fee", "Unlimited courses", "Affiliate marketing", "Live chat support"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Course Builder", categoryName: "Education", hasFeature: true },
    { featureName: "Tax Handling", categoryName: "Business", hasFeature: true },
    { featureName: "Student Analytics", categoryName: "Education", hasFeature: true },
    { featureName: "Affiliate Center", categoryName: "Growth", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://teachable.com/pricing"
};
