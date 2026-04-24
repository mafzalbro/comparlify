import { PlatformData } from "../types";

export const typeform: PlatformData = {
  name: "Typeform",
  website: "https://typeform.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Typeform_logo.svg/1200px-Typeform_logo.svg.png",
  description: "Create beautiful, conversational forms, surveys, and quizzes. Typeform makes data collection interactive and engaging for your audience.",
  rating: 4.7,
  easeOfUse: 4.6,
  featuresRating: 4.8,
  support: 4.4,
  pros: [
    "Best-in-class conversational UI",
    "Beautiful design templates and customization",
    "Advanced logic jumps and branching",
    "Massive library of native integrations",
    "Sophisticated analytics and reporting"
  ],
  cons: [
    "Expensive for low response volumes",
    "Free plan is very limited (10 responses/mo)",
    "Strict response limits on lower paid tiers",
    "Can feel overkill for simple forms"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 28,
      features: ["100 responses/mo", "Unlimited forms", "Unlimited questions", "1 User"],
      isPopular: false
    },
    {
      name: "Plus",
      monthlyPrice: 79,
      annualPriceMonthlyEquivalent: 56,
      features: ["1,000 responses/mo", "Remove branding", "Custom subdomain", "3 Users"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 129,
      annualPriceMonthlyEquivalent: 91,
      features: ["10,000 responses/mo", "Drop-off analysis", "Conversion tracking", "5 Users"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Logic Jumps", categoryName: "Forms", hasFeature: true },
    { featureName: "Conversational UI", categoryName: "UX", hasFeature: true },
    { featureName: "Video Ask", categoryName: "Forms", hasFeature: true },
    { featureName: "Advanced Analytics", categoryName: "Reporting", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://typeform.com/pricing"
};
