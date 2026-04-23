import { PlatformData } from "../types";

export const jira: PlatformData = {
  name: "Jira",
  website: "https://www.atlassian.com/software/jira",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Jira_logo_Logo.svg/1200px-Jira_logo_Logo.svg.png",
  description: "The #1 software development tool used by agile teams. Jira provides a highly customizable platform for bug tracking, issue tracking, and project management.",
  rating: 4.5,
  easeOfUse: 3.5,
  featuresRating: 5.0,
  support: 4.3,
  pros: [
    "Most powerful and flexible issue tracking system",
    "Extensive reporting and advanced analytics",
    "Highly customizable workflows and fields",
    "Seamless integration with Confluence and Bitbucket",
    "Massive marketplace for add-ons and extensions"
  ],
  cons: [
    "Steep learning curve and complex configuration",
    "UI can feel slow and cluttered",
    "Can be overkill for small teams"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Up to 10 users", "Scrum & Kanban boards", "Basic reporting"],
      isPopular: false
    },
    {
      name: "Standard",
      monthlyPrice: 8.15,
      features: ["Project roles", "Advanced permissions", "250GB Storage"],
      isPopular: true
    },
    {
      name: "Premium",
      monthlyPrice: 16,
      features: ["Advanced roadmaps", "Project archiving", "Unlimited storage", "99.9% Uptime SLA"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Advanced Reporting", categoryName: "Analytics", hasFeature: true },
    { featureName: "Custom Workflows", categoryName: "Workflow", hasFeature: true },
    { featureName: "Agile Boards", categoryName: "Workflow", hasFeature: true },
    { featureName: "Automation", categoryName: "Workflow", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://www.atlassian.com/software/jira/pricing"
};
