import { PlatformData } from "../types";

export const vscode: PlatformData = {
  name: "VS Code",
  website: "https://code.visualstudio.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg",
  description: "The most popular code editor in the world. Built by Microsoft, VS Code is a free, open-source editor that supports thousands of extensions and deep integration with Azure and GitHub Copilot.",
  rating: 4.8,
  easeOfUse: 4.5,
  featuresRating: 4.7,
  support: 4.2,
  pros: [
    "Completely free and open source",
    "Massive ecosystem of extensions",
    "Extremely stable and optimized performance",
    "Deep GitHub integration (Copilot, Pull Requests)",
    "Available as a browser-based IDE (vscode.dev)"
  ],
  cons: [
    "AI features are added via extensions (not native)",
    "Setting up complex AI workflows can be tedious",
    "Telemetry is enabled by default"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["All editor features", "Extension access", "Source control integration"],
      isPopular: true
    },
    {
      name: "GitHub Copilot (Add-on)",
      monthlyPrice: 10,
      features: ["AI Code Suggestions", "Chat Interface", "PR Summaries"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Extension Marketplace", categoryName: "Ecosystem", hasFeature: true },
    { featureName: "Integrated Terminal", categoryName: "Editor", hasFeature: true },
    { featureName: "Source Control", categoryName: "Collaboration", hasFeature: true },
    { featureName: "Remote Development", categoryName: "Environment", hasFeature: true }
  ],
  lastVerifiedAt: "2024-05-15T00:00:00Z",
  sourceUrl: "https://code.visualstudio.com"
};
