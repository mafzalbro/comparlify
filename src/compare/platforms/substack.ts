import { PlatformData } from "../types";

export const substack: PlatformData = {
  name: "Substack",
  website: "https://substack.com",
  logoUrl: "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ed3aa40-8f77-440f-90ca-47d3d7119e83_512x512.png",
  description: "The platform where great writing is valuable. Substack provides a simple interface for writers to start a newsletter for free and monetize through paid subscriptions with a reader-first discovery network.",
  rating: 4.6,
  easeOfUse: 4.9,
  featuresRating: 4.2,
  support: 4.0,
  pros: [
    "Zero upfront cost",
    "Extreme simplicity and focus on writing",
    "Strong network effect and discoverability via Substack Notes",
    "Free podcast and video hosting included",
    "Built-in community features (chat, comments)"
  ],
  cons: [
    "10% revenue share on paid subscriptions",
    "Limited branding and SEO customization",
    "No built-in referral system for the free tier",
    "Limited analytics compared to competitors"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited subscribers", "Unlimited posts", "Community features", "Podcast hosting"],
      isPopular: true
    },
    {
      name: "Pro (Revenue Share)",
      monthlyPrice: 0,
      transactionFeePercent: 10,
      features: ["Paid subscriptions", "Custom domains (one-time fee)", "Advanced stats"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Discovery Network", categoryName: "Growth", hasFeature: true },
    { featureName: "Podcast Hosting", categoryName: "Content", hasFeature: true },
    { featureName: "Community Chat", categoryName: "Community", hasFeature: true },
    { featureName: "Custom Domains", categoryName: "Branding", hasFeature: true, details: "$50 one-time setup fee" }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://substack.com/going-paid"
};
