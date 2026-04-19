import { PlatformData } from "../types";

export const jira: PlatformData = {
  name: "Jira",
  website: "https://www.atlassian.com/software/jira",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Jira_Logo.svg",
  description: "The #1 software development tool used by agile teams. Jira provides a highly customizable environment for project management, tracking bugs, and managing content for enterprise-scale teams.",
  rating: 4.6,
  easeOfUse: 3.5,
  featuresRating: 5.0,
  support: 4.4,
  pros: [
    "Most powerful and customizable issue tracker",
    "Industry standard for Agile and Scrum methodologies",
    "Deep ecosystem (Confluence, Bitbucket, etc.)",
    "Excellent reporting and data visualization",
    "Advanced automation and workflow designer"
  ],
  cons: [
    "Notoriously slow and complex UI",
    "Can be overkill for small teams",
    "Steep learning curve and configuration overhead",
    "Pricing can get expensive at scale with many add-ons"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Up to 10 users", "Unlimited project boards", "2GB storage"],
      isPopular: false
    },
    {
      name: "Standard",
      monthlyPrice: 8.15,
      features: ["Up to 35,000 users", "Audit logs", "Data residency", "250GB storage"],
      isPopular: true
    },
    {
      name: "Premium",
      monthlyPrice: 16,
      features: ["Global automation", "Advanced roadmaps", "99.9% uptime SLA", "Unlimited storage"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Agile Boards", categoryName: "Agile", hasFeature: true },
    { featureName: "Workflow Customization", categoryName: "Workflow", hasFeature: true },
    { featureName: "Advanced Roadmaps", categoryName: "Planning", hasFeature: true },
    { featureName: "Compliance & Security", categoryName: "Enterprise", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.atlassian.com/software/jira/pricing"
};
