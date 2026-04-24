import { PlatformData } from "../types";

export const typeform: PlatformData = {
  name: "Typeform",
  website: "https://typeform.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Typeform_logo.svg",
  description: "Typeform invented the 'one question at a time' experience, turning boring data collection into a conversational journey. It remains the gold standard for high-end brands who want their surveys to feel like a premium extension of their website. With its smooth animations, 'Logic Jumps,' and deep personalization features, Typeform boasts some of the highest completion rates in the industry. It’s more than just a form builder—it’s a data-collection engine designed to build empathy with your audience and look beautiful on any device.",
  rating: 4.6,
  easeOfUse: 4.5,
  featuresRating: 4.8,
  support: 4.2,
  pros: [
    "Highest conversion and completion rates",
    "Beautiful, conversational UI/UX",
    "Extremely powerful logic and branching",
    "Massive library of native integrations",
    "Professional templates for every industry"
  ],
  cons: [
    "Very expensive compared to Tally",
    "Strict limits on responses in lower tiers",
    "Can feel 'heavy' or slow on older devices",
    "Minimal customization on the free tier"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["10 responses/mo", "Unlimited forms", "Basic logic", "Zapier integration"],
      isPopular: false
    },
    {
      name: "Basic",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 25,
      features: ["100 responses/mo", "Unlimited forms", "1 User", "Payments"],
      isPopular: false
    },
    {
      name: "Plus",
      monthlyPrice: 59,
      annualPriceMonthlyEquivalent: 50,
      features: ["1,000 responses/mo", "Remove branding", "Custom domains", "3 Users"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 83,
      features: ["10,000 responses/mo", "Drop-off analytics", "Priority support", "5 Users"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Logic Jumps", categoryName: "Forms", hasFeature: true },
    { featureName: "Conversational UI", categoryName: "Experience", hasFeature: true },
    { featureName: "Video Ask Integration", categoryName: "Integrations", hasFeature: true },
    { featureName: "Drop-off Analytics", categoryName: "Insights", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://typeform.com/pricing"
};
