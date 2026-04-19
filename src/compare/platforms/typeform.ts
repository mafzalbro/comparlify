import { PlatformData } from "../types";

export const typeform: PlatformData = {
  name: "Typeform",
  website: "https://www.typeform.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Typeform_logo.svg",
  description: "The gold standard in conversational forms. Typeform focuses on design and empathy, making forms feel like a conversation to drive higher completion rates.",
  rating: 4.7,
  easeOfUse: 4.8,
  featuresRating: 4.9,
  support: 4.4,
  pros: [
    "World-class design and aesthetics",
    "High conversion rates due to conversational UX",
    "Extensive template library",
    "Deep integrations with enterprise stacks (Salesforce, etc.)",
    "Advanced branching and logic capabilities"
  ],
  cons: [
    "Expensive pricing tiers",
    "Limited free plan (10 responses/month)",
    "Can be slower than minimalist builders like Tally",
    "Steep jump in price for small feature additions"
  ],
  tiers: [
    {
      name: "Basic",
      monthlyPrice: 29,
      annualPriceMonthlyEquivalent: 25,
      features: ["100 responses/month", "Unlimited forms", "100MB file storage"],
      isPopular: false
    },
    {
      name: "Plus",
      monthlyPrice: 59,
      annualPriceMonthlyEquivalent: 50,
      features: ["1,000 responses/month", "No Typeform branding", "Custom domain"],
      isPopular: true
    },
    {
      name: "Business",
      monthlyPrice: 99,
      annualPriceMonthlyEquivalent: 83,
      features: ["10,000 responses/month", "Priority support", "Conversion tracking", "Salesforce integration"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Conversational UX", categoryName: "Design", hasFeature: true },
    { featureName: "Enterprise Integrations", categoryName: "Integrations", hasFeature: true },
    { featureName: "Video Ask Support", categoryName: "Engagement", hasFeature: true },
    { featureName: "Hidden Fields", categoryName: "Logic", hasFeature: true }
  ],
  lastVerifiedAt: "2024-04-17T00:00:00Z",
  sourceUrl: "https://www.typeform.com/pricing"
};
