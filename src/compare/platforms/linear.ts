import { PlatformData } from "../types";

export const linear: PlatformData = {
  name: "Linear",
  website: "https://linear.app",
  logoUrl: "https://linear.app/static/favicon.ico",
  description: "The issue tracker for high-performance teams. Linear streamlines your software projects, sprints, and product roadmaps with a focus on speed and developer experience.",
  rating: 4.9,
  easeOfUse: 4.8,
  featuresRating: 4.7,
  support: 4.6,
  pros: [
    "Unbelievably fast and responsive UI",
    "Keyboard-first navigation",
    "Opinionated, clean workflow that reduces clutter",
    "Excellent GitHub/GitLab integrations",
    "Offline support"
  ],
  cons: [
    "Limited custom fields in lower tiers",
    "Not suited for non-technical teams (marketing, sales, etc.)",
    "Fewer complex reporting features than Jira",
    "No built-in documentation/wiki (uses external integrations)"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited members", "250 active issues", "Basic integrations"],
      isPopular: false
    },
    {
      name: "Standard",
      monthlyPrice: 10,
      annualPriceMonthlyEquivalent: 8,
      features: ["Unlimited issues", "Unlimited uploads", "Guest accounts", "Private teams"],
      isPopular: true
    },
    {
      name: "Plus",
      monthlyPrice: 15,
      annualPriceMonthlyEquivalent: 12,
      features: ["Advanced roadmap", "SLAs", "Priority support", "Customer data vault"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Keyboard Shortcuts", categoryName: "UX", hasFeature: true },
    { featureName: "Cycles (Sprints)", categoryName: "Workflow", hasFeature: true },
    { featureName: "Roadmaps", categoryName: "Planning", hasFeature: true },
    { featureName: "Git Integration", categoryName: "Developer", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://linear.app/pricing"
};
