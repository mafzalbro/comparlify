import { PlatformData } from "../types";

export const kit: PlatformData = {
  name: "Kit",
  website: "https://kit.com",
  logoUrl: "https://kit.com/favicon.ico",
  description: "Kit (formerly ConvertKit) is the undisputed leader in email marketing for professional creators. It was built by creators, for creators, with a focus on helping you build an audience and earn a living. Kit’s power lies in its 'Visual Automations'—allowing you to create complex, personalized customer journeys that run on autopilot. With the introduction of the Creator Network and the 'Kit' rebrand, it has evolved into a full-scale growth engine that helps creators recommend each other and grow their lists exponentially. If you are serious about email being the backbone of your business, Kit is the standard.",
  rating: 4.8,
  easeOfUse: 4.6,
  featuresRating: 4.9,
  support: 4.8,
  pros: [
    "Most powerful and intuitive visual automations",
    "Creator Network for explosive subscriber growth",
    "Clean, text-focused emails that land in inboxes",
    "Robust tagging and segmentation system",
    "Excellent deliverability rates"
  ],
  cons: [
    "More expensive than MailerLite or Beehiiv",
    "Limited design flexibility for 'pretty' emails",
    "Learning curve for complex automation logic",
    "Free tier is quite limited"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Up to 1,000 subscribers", "Unlimited landing pages", "Unlimited forms", "Audience tagging"],
      isPopular: false
    },
    {
      name: "Creator",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 25,
      features: ["Visual Automations", "Sequences", "Third-party integrations", "One additional team member"],
      isPopular: true
    },
    {
      name: "Creator Pro",
      monthlyPrice: 59,
      annualPriceMonthlyEquivalent: 50,
      features: ["Newsletter referral system", "Subscriber scoring", "Advanced reporting", "Unlimited team members"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Visual Automations", categoryName: "Marketing", hasFeature: true },
    { featureName: "Creator Network", categoryName: "Growth", hasFeature: true },
    { featureName: "Landing Pages", categoryName: "Marketing", hasFeature: true },
    { featureName: "Subscriber Scoring", categoryName: "Analytics", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://kit.com/pricing"
};
