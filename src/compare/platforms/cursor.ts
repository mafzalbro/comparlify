import { PlatformData } from "../types";

export const cursor: PlatformData = {
  name: "Cursor",
  website: "https://cursor.com",
  logoUrl: "https://mintlify.s3-us-west-1.amazonaws.com/cursor/logo/light.svg",
  description: "The AI Code Editor. Built on top of VS Code, Cursor is designed for pair-programming with AI. It includes powerful features like codebase indexing, chat, and 'composer' for multi-file edits.",
  rating: 4.9,
  easeOfUse: 4.7,
  featuresRating: 4.9,
  support: 4.5,
  pros: [
    "Deep codebase integration for accurate AI suggestions",
    "Seamless transition from VS Code (supports all extensions)",
    "Powerful multi-file editing with 'Composer'",
    "Fast and responsive interface",
    "Regularly updated with the latest AI models"
  ],
  cons: [
    "Subscription cost for Pro features",
    "Privacy concerns for some sensitive projects (though they offer Privacy Mode)",
    "Requires an internet connection for most AI features"
  ],
  tiers: [
    {
      name: "Hobby",
      monthlyPrice: 0,
      features: ["2000 Completions/mo", "50 Premium Chat requests", "Unlimited basic models"],
      isPopular: false
    },
    {
      name: "Pro",
      monthlyPrice: 20,
      features: ["Unlimited Completions", "500 Premium Chat requests", "Unlimited Composer", "Frontier models"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 40,
      features: ["Centralized billing", "Admin dashboard", "SAML/SSO", "Privacy Mode by default"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Codebase Indexing", categoryName: "AI", hasFeature: true },
    { featureName: "Multi-file Edits", categoryName: "AI", hasFeature: true },
    { featureName: "VS Code Extensions", categoryName: "Editor", hasFeature: true },
    { featureName: "Privacy Mode", categoryName: "Security", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://cursor.com/pricing"
};
