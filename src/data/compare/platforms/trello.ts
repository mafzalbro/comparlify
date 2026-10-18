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
  affiliateLink: "https://trello.com",
  dealDescription: "Get started free on Trello's visual collaboration system.",
  videoHostingIncluded: false,
  lastVerifiedAt: "2026-03-01T00:00:00.000Z",
};
