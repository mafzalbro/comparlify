import { PlatformData } from "../types";

export const cursor: PlatformData = {
  name: "Cursor",
  website: "https://cursor.sh",
  logoUrl: "https://mintlify.s3-us-west-1.amazonaws.com/cursor/logo/light.svg",
  description: "Cursor is the AI-native code editor that has redefined the developer experience. Built as a fork of VS Code, it maintains total compatibility with your favorite extensions while embedding world-class AI models directly into the core editing loop. Cursor doesn't just 'autocomplete'; it understands your entire codebase, allows you to chat with your files, and can perform complex refactors across multiple directories with a single prompt. For developers who want to stay in the 'flow state' and leverage AI as a pair programmer rather than a copy-paste tool, Cursor is currently the undisputed leader.",
  rating: 4.9,
  easeOfUse: 4.8,
  featuresRating: 5.0,
  support: 4.6,
  pros: [
    "Deep codebase awareness (Indexing)",
    "Seamless 'Composer' for multi-file edits",
    "VS Code extension compatibility",
    "Privacy-focused 'Local Mode' available",
    "Extremely fast UI/UX"
  ],
  cons: [
    "Subscription required for top-tier models",
    "Can be resource-intensive on large projects",
    "Learning curve to master AI prompts",
    "Requires constant internet for cloud-AI features"
  ],
  tiers: [
    {
      name: "Hobby",
      monthlyPrice: 0,
      features: ["2000 Completions", "50 Premium Chats", "Public Repos"],
      isPopular: false
    },
    {
      name: "Pro",
      monthlyPrice: 20,
      features: ["Unlimited Completions", "500 Premium Chats", "Codebase Indexing", "Composer"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 40,
      features: ["Centralized Billing", "Admin Dashboard", "Privacy Mode", "Priority Support"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Codebase Indexing", categoryName: "AI", hasFeature: true },
    { featureName: "Composer (Multi-file)", categoryName: "AI", hasFeature: true },
    { featureName: "VS Code Extensions", categoryName: "Editor", hasFeature: true },
    { featureName: "Git Integration", categoryName: "Workflow", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://cursor.sh/pricing"
};
