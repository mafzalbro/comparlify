import { PlatformData } from "../types";

export const linear: PlatformData = {
  name: "Linear",
  website: "https://linear.app",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Linear_logo.png",
  description: "The issue tracker for high-performance teams. Linear helps you streamline software projects, sprints, tasks, and bug tracking with a focus on speed and beautiful UI.",
  rating: 4.9,
  easeOfUse: 4.8,
  featuresRating: 4.7,
  support: 4.5,
  pros: [
    "Incredible speed and performance",
    "Best-in-class keyboard shortcuts and navigation",
    "Clean, intentional UI that gets out of the way",
    "Powerful integrations with GitHub, GitLab, and Slack",
    "Built-in support for cycles (sprints) and roadmaps"
  ],
  cons: [
    "Opinionated workflow (may not suit all teams)",
    "Fewer reporting features than Jira",
    "Can be expensive for very large organizations"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited members", "250 Issues", "2 Teams", "Basic integrations"],
      isPopular: false
    },
    {
      name: "Basic",
      monthlyPrice: 10,
      annualPriceMonthlyEquivalent: 8,
      features: ["Unlimited issues", "Unlimited teams", "Unlimited uploads", "Admin roles"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 16,
      annualPriceMonthlyEquivalent: 14,
      features: ["Private teams", "Linear Insights", "Linear Asks", "SLA tracking"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Keyboard First", categoryName: "UX", hasFeature: true },
    { featureName: "Cycles (Sprints)", categoryName: "Workflow", hasFeature: true },
    { featureName: "Roadmaps", categoryName: "Planning", hasFeature: true },
    { featureName: "Issue Triage", categoryName: "Workflow", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://linear.app/pricing"
};
