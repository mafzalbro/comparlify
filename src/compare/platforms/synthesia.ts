import { PlatformData } from "../types";

export const synthesia: PlatformData = {
  name: "Synthesia",
  website: "https://www.synthesia.io",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Synthesia_logo_dark.svg",
  description: "The enterprise AI video platform. Synthesia focuses on corporate training and internal communications, offering stable performance and secure, collaboration-first video production.",
  rating: 4.8,
  easeOfUse: 4.6,
  featuresRating: 4.8,
  support: 4.7,
  pros: [
    "Enterprise-grade security and SOC2 compliance",
    "Predictive subscription pricing (no credit surprises)",
    "Excellent collaboration tools for large teams",
    "Robust API for automated video generation",
    "Huge library of diverse avatars"
  ],
  cons: [
    "Avatars can sometimes feel slightly more 'robotic' than HeyGens",
    "Personal avatar creation is a more complex/expensive process",
    "Lacks some of the creative flexibility of newer AI video tools"
  ],
  tiers: [
    {
      name: "Starter",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 22,
      features: ["1 Editor", "3 Guests", "120 mins of video/year", "AI Video Assistant"],
      isPopular: true
    },
    {
      name: "Creator",
      monthlyPrice: 89,
      annualPriceMonthlyEquivalent: 67,
      features: ["1 Editor", "5 Guests", "360 mins of video/year", "Branded player"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "AI Video Assistant", categoryName: "Workflow", hasFeature: true },
    { featureName: "120+ Languages", categoryName: "Localization", hasFeature: true },
    { featureName: "Enterprise Security", categoryName: "Security", hasFeature: true },
    { featureName: "SCORM Export", categoryName: "Integrations", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.synthesia.io/pricing"
};
