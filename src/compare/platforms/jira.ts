import { PlatformData } from "../types";

export const jira: PlatformData = {
  name: "Jira",
  website: "https://www.atlassian.com/software/jira",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Jira_Logo.svg",
  description: "Jira is the titan of the enterprise world—the most flexible and scalable project management platform ever built. While it is often criticized for its complexity, Jira's power lies in its infinite customizability. It can be tailored to fit any workflow, from a three-person startup to a 10,000-person global corporation. With its deep reporting capabilities, advanced roadmapping, and the massive Atlassian ecosystem (Confluence, Bitbucket, Trello), Jira remains the default choice for organizations that need rigorous process control, complex permission structures, and a single source of truth for all software development activities.",
  rating: 4.2,
  easeOfUse: 2.5,
  featuresRating: 5.0,
  support: 4.0,
  pros: [
    "Most powerful custom workflow engine",
    "Comprehensive enterprise-grade reporting",
    "Deepest integration with the Atlassian ecosystem",
    "Supports Agile, Scrum, Kanban, and Waterfall",
    "Infinite scalability for large organizations"
  ],
  cons: [
    "Notoriously slow and complex UI",
    "Steep learning curve for admins and users",
    "Overwhelming amount of configuration options",
    "Can feel bureaucratic for small, fast teams"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Up to 10 users", "Scrum & Kanban boards", "Basic roadmaps", "2GB storage"],
      isPopular: false
    },
    {
      name: "Standard",
      monthlyPrice: 8.15,
      annualPriceMonthlyEquivalent: 7.75,
      features: ["Up to 35,000 users", "Audit logs", "Data residency", "250GB storage"],
      isPopular: true
    },
    {
      name: "Premium",
      monthlyPrice: 16,
      annualPriceMonthlyEquivalent: 15.25,
      features: ["Advanced roadmaps", "Sandbox & release tracks", "IP allowing", "Unlimited storage"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Custom Workflows", categoryName: "Logic", hasFeature: true },
    { featureName: "Advanced Roadmaps", categoryName: "Planning", hasFeature: true },
    { featureName: "Agile Reporting", categoryName: "Analytics", hasFeature: true },
    { featureName: "SSO & Security", categoryName: "Enterprise", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://www.atlassian.com/software/jira/pricing"
};
