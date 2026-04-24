import { PlatformData } from "../types";

export const linear: PlatformData = {
  name: "Linear",
  website: "https://linear.app",
  logoUrl: "https://linear.app/static/images/logos/linear-logo-white.png",
  description: "Linear is the project management tool that developers actually love. It was built with a singular focus: speed. In an industry cluttered with slow, bloated enterprise software, Linear stands out with its 'keyboard-first' philosophy and near-instant performance. It’s designed for high-performance product teams who want to spend less time managing tasks and more time building software. With its beautiful UI, automated workflows, and powerful Git integrations, Linear has become the gold standard for modern startups that value craft and efficiency over bureaucratic process.",
  rating: 4.9,
  easeOfUse: 4.8,
  featuresRating: 4.7,
  support: 4.6,
  pros: [
    "The fastest project management interface available",
    "Comprehensive keyboard shortcuts for everything",
    "Built-in cycles and automated project tracking",
    "Deep GitHub, GitLab, and Sentry integrations",
    "Works flawlessly offline"
  ],
  cons: [
    "Opinionated workflow (harder to customize than Jira)",
    "Limited 'business' features like budgeting or HR",
    "Pricing can scale quickly for large teams",
    "No native time-tracking (requires integrations)"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited members", "250 active issues", "Import/Export", "Integrations"],
      isPopular: false
    },
    {
      name: "Standard",
      monthlyPrice: 10,
      annualPriceMonthlyEquivalent: 8,
      features: ["Unlimited issues", "Unlimited file uploads", "Private teams", "Guest accounts"],
      isPopular: true
    },
    {
      name: "Plus",
      monthlyPrice: 18,
      annualPriceMonthlyEquivalent: 14,
      features: ["SLA support", "Advanced auth (SAML/SSO)", "Data exports", "Admin tools"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Keyboard Shortcuts", categoryName: "UX", hasFeature: true },
    { featureName: "Auto-Cycles", categoryName: "Workflow", hasFeature: true },
    { featureName: "GitHub Sync", categoryName: "Integrations", hasFeature: true },
    { featureName: "Offline Mode", categoryName: "UX", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://linear.app/pricing"
};
