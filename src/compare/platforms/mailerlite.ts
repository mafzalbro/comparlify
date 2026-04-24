import { PlatformData } from "../types";

export const mailerlite: PlatformData = {
  name: "MailerLite",
  website: "https://mailerlite.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/MailerLite_Logo.svg/1200px-MailerLite_Logo.svg.png",
  description: "MailerLite is the world's most approachable email marketing platform, proving that 'advanced' doesn't have to mean 'complicated.' It is the go-to choice for solo creators, bloggers, and small businesses who need professional features like automation, landing pages, and a website builder, but don't want the technical overhead or enterprise price tag of tools like ActiveCampaign. MailerLite’s 'Lite' philosophy shines in its clean, intuitive drag-and-drop editor and its generous free tier. For those who value speed and simplicity without sacrificing the power of a modern marketing suite, MailerLite is the smartest starting point on the market.",
  rating: 4.8,
  easeOfUse: 5.0,
  featuresRating: 4.5,
  support: 4.7,
  pros: [
    "Easiest user interface in the email marketing space",
    "Generous free tier (up to 1,000 subscribers)",
    "Includes website and landing page builders",
    "Highly reliable deliverability and performance",
    "Affordable scaling as your list grows"
  ],
  cons: [
    "Fewer advanced CRM features than ActiveCampaign",
    "Strict approval process for new accounts",
    "Limited template variety compared to some competitors"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["1,000 subscribers", "12,000 monthly emails", "1 User", "Landing pages"],
      isPopular: false
    },
    {
      name: "Growing Business",
      monthlyPrice: 10,
      annualPriceMonthlyEquivalent: 9,
      features: ["Unlimited emails", "3 Users", "Sell digital products", "Unsubscribe builder"],
      isPopular: true
    },
    {
      name: "Advanced",
      monthlyPrice: 20,
      annualPriceMonthlyEquivalent: 18,
      features: ["Unlimited users", "Custom HTML editor", "Promotion pop-ups", "Smart sending"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Email Automation", categoryName: "Marketing", hasFeature: true },
    { featureName: "Website Builder", categoryName: "Web", hasFeature: true },
    { featureName: "A/B Testing", categoryName: "Optimization", hasFeature: true },
    { featureName: "E-commerce Integration", categoryName: "Sales", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://mailerlite.com/pricing"
};
