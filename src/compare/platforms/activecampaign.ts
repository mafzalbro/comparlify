import { PlatformData } from "../types";

export const activecampaign: PlatformData = {
  name: "ActiveCampaign",
  website: "https://activecampaign.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/ActiveCampaign_logo.svg/1200px-ActiveCampaign_logo.svg.png",
  description: "ActiveCampaign is the 'brain' behind the world's most successful marketing operations. It pioneered the concept of 'Customer Experience Automation' (CXA), moving beyond simple email blasts to create intelligent, automated journeys that adapt to customer behavior in real-time. With its incredibly powerful visual automation builder, built-in Sales CRM, and multi-channel messaging (SMS, WhatsApp, Web), ActiveCampaign is the tool you graduate to when you’ve outgrown basic providers like MailerLite or Kit. It is the choice for businesses that want to use data and AI to deliver hyper-personalized experiences that turn cold leads into loyal advocates at scale.",
  rating: 4.7,
  easeOfUse: 4.1,
  featuresRating: 4.9,
  support: 4.5,
  pros: [
    "Industry-leading visual automation builder",
    "Sophisticated CRM with sales automation",
    "High-fidelity predictive sending and win probability",
    "Extensive library of 950+ automation recipes",
    "Excellent multi-channel support (SMS, WhatsApp, Web)"
  ],
  cons: [
    "Higher price point than entry-level tools",
    "Steeper learning curve due to advanced features",
    "Reporting can be complex to navigate initially"
  ],
  tiers: [
    {
      name: "Starter",
      monthlyPrice: 15,
      features: ["Marketing automation", "Email marketing", "1 User", "10x contact sends"],
      isPopular: false
    },
    {
      name: "Plus",
      monthlyPrice: 49,
      features: ["Active Intelligence", "Landing pages", "1 User", "Standard segmentation"],
      isPopular: false
    },
    {
      name: "Pro",
      monthlyPrice: 149,
      features: ["Advanced segmentation", "Predictive content", "3 Users", "Attribution tracking"],
      isPopular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 259,
      features: ["Custom objects", "SSO", "5 Users", "Dedicated account team"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Visual Automations", categoryName: "Marketing", hasFeature: true },
    { featureName: "Sales CRM", categoryName: "Sales", hasFeature: true },
    { featureName: "Predictive AI", categoryName: "Intelligence", hasFeature: true },
    { featureName: "Omnichannel Support", categoryName: "Marketing", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://activecampaign.com/pricing"
};
