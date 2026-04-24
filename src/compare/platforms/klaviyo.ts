import { PlatformData } from "../types";

export const klaviyo: PlatformData = {
  name: "Klaviyo",
  website: "https://klaviyo.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Klaviyo_logo.svg/1200px-Klaviyo_logo.svg.png",
  description: "Klaviyo is the 'intelligence engine' that powers the world's most successful e-commerce brands. While other platforms simply send emails, Klaviyo treats every customer interaction—from a website click to a past purchase—as a data point to fuel hyper-personalized marketing. It is legendary for its deep, native integrations with Shopify, BigCommerce, and Magento, allowing you to trigger complex automation flows based on real-time behavior. With its built-in predictive analytics (calculating churn risk and lifetime value) and sophisticated SMS orchestration, Klaviyo is the definitive choice for commerce businesses that want to turn their customer data into measurable, bottom-line ROI.",
  rating: 4.8,
  easeOfUse: 4.4,
  featuresRating: 5.0,
  support: 4.6,
  pros: [
    "Deepest e-commerce data integration in the market",
    "Powerful predictive analytics and ROI tracking",
    "Highly granular segmentation based on behavior",
    "Best-in-class automation flows for commerce",
    "Excellent omnichannel support (Email, SMS, Mobile Push)"
  ],
  cons: [
    "Expensive as your subscriber list grows",
    "Steep learning curve for advanced features",
    "Primary value is locked to e-commerce businesses"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Up to 250 profiles", "500 emails/mo", "150 SMS credits", "Email support"],
      isPopular: false
    },
    {
      name: "Email",
      monthlyPrice: 20,
      features: ["Unlimited email sends", "500+ contacts", "Automation flows", "Predictive analytics"],
      isPopular: true
    },
    {
      name: "Email and SMS",
      monthlyPrice: 35,
      features: ["Everything in Email", "1,250 SMS credits/mo", "Omnichannel orchestration", "Priority support"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "E-commerce Integration", categoryName: "Commerce", hasFeature: true },
    { featureName: "Predictive Analytics", categoryName: "Intelligence", hasFeature: true },
    { featureName: "Behavioral Segmentation", categoryName: "Marketing", hasFeature: true },
    { featureName: "Automation Flows", categoryName: "Marketing", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://klaviyo.com/pricing"
};
