import { PlatformData } from "../types";

export const cursor: PlatformData = {
  name: "Cursor",
  website: "https://www.cursor.com",
  logoUrl: "https://www.cursor.com/assets/favicon.ico",
  description: "The AI-native code editor. Forked from VS Code, Cursor is designed from the ground up for collaborative AI programming with deep codebase indexing and agentic capabilities.",
  rating: 4.9,
  easeOfUse: 4.7,
  featuresRating: 4.9,
  support: 4.5,
  pros: [
    "Native codebase indexing (knows your entire project)",
    "Composer mode for multi-file edits",
    "Uses latest models (Claude 3.5 Sonnet, GPT-4o)",
    "Zero-config - works like VS Code",
    "Agentic workflows"
  ],
  cons: [
    "Paid subscription required for high-volume use",
    "Can be resource-intensive on older systems",
    "Privacy concerns for some enterprise users (requires Opt-Out)"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["2,000 completions", "50 slow premium requests", "10 Claude 3.5 Sonnet uses"],
      isPopular: false
    },
    {
      name: "Pro",
      monthlyPrice: 20,
      features: ["Unlimited completions", "500 fast premium requests", "Unlimited slow premium", "Composer access"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 40,
      features: ["Everything in Pro", "Centralized billing", "Admin dashboard", "Data privacy mode"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Codebase Indexing", categoryName: "AI", hasFeature: true },
    { featureName: "Composer (Multi-file)", categoryName: "AI", hasFeature: true },
    { featureName: "Terminal AI", categoryName: "AI", hasFeature: true },
    { featureName: "Context Awareness", categoryName: "AI", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.cursor.com/pricing"
};
