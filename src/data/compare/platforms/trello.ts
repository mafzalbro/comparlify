import { PlatformData } from "../types";

export const trello: PlatformData = {
  name: "Trello",
  website: "https://trello.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Trello-logo-blue.svg/512px-Trello-logo-blue.svg.png",
  description: `
# Trello: The Universal Visual Kanban System for Cross-Functional Teams (2026 Analysis)

Trello remains the quintessential visual collaboration tool, offering clean drag-and-drop lists, custom Butler automation rules, and expansive Power-Up integrations for modern non-technical teams.
`,
  rating: 4.5,
  easeOfUse: 4.8,
  featuresRating: 4.3,
  support: 4.4,
  pros: [
    "Zero learning curve with intuitive visual drag-and-drop boards",
    "Butler natural-language automation for repetitive workflows",
    "Extensive Power-Up library connecting to Slack, Google Drive, and Jira",
    "Generous free tier suitable for small teams and solopreneurs"
  ],
  cons: [
    "Lacks native developer features like cycle velocity or Git branch syncing",
    "Large complex projects become cluttered across wide boards",
    "Power-Up dependencies can increase subscription costs quickly"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      annualPriceMonthlyEquivalent: 0,
      features: ["Unlimited cards", "Up to 10 boards per Workspace", "Unlimited Power-Ups", "250 Workspace automation runs"],
      isPopular: true
    },
    {
      name: "Standard",
      monthlyPrice: 6,
      annualPriceMonthlyEquivalent: 5,
      features: ["Unlimited boards", "Advanced checklists", "Custom fields", "1,000 Workspace command runs"],
      isPopular: false
    },
    {
      name: "Premium",
      monthlyPrice: 12.5,
      annualPriceMonthlyEquivalent: 10,
      features: ["Dashboard, Timeline, Table, Calendar views", "Unlimited Workspace command runs", "Admin and security features"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Kanban Boards", categoryName: "Task Management", hasFeature: true },
    { featureName: "Butler Automation", categoryName: "Workflow", hasFeature: true },
    { featureName: "Power-Ups", categoryName: "Extensibility", hasFeature: true },
    { featureName: "Calendar View", categoryName: "Visualization", hasFeature: true }
  ],
  sourceUrl: "https://trello.com/pricing",
  affiliateLink: "https://trello.com",
  dealDescription: "Get started free on Trello's visual collaboration system.",
  videoHostingIncluded: false,
  lastVerifiedAt: "2026-03-01T00:00:00.000Z",
};
