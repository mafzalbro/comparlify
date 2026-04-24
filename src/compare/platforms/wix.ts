import { PlatformData } from "../types";

export const wix: PlatformData = {
  name: "Wix",
  website: "https://wix.com",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Wix.com_website_logo.svg/1200px-Wix.com_website_logo.svg.png",
  description: "Wix is the titan of the 'no-code' web, offering the most versatile and feature-rich website builder on the planet. Its true power lies in its 'absolute positioning' editor—giving you total drag-and-drop freedom to move any element anywhere on the page, something most grid-based builders can't match. Beyond simple sites, Wix has evolved into a complete business OS, with native tools for restaurant bookings, hotel reservations, e-commerce, and advanced SEO. With the introduction of Wix Studio for agencies and its deep AI-assisted design tools, it has successfully moved from being a 'beginner's tool' to a professional-grade platform that can power everything from personal portfolios to complex enterprise portals.",
  rating: 4.6,
  easeOfUse: 4.8,
  featuresRating: 4.7,
  support: 4.5,
  pros: [
    "True drag-and-drop freedom for designers",
    "Massive library of 900+ professional templates",
    "All-in-one business tools (Booking, Store, CRM)",
    "Strong built-in SEO and marketing features",
    "Reliable multi-cloud hosting infrastructure"
  ],
  cons: [
    "Templates cannot be switched once the site is built",
    "Can feel overwhelming due to the sheer number of options",
    "Performance can lag on very complex, asset-heavy sites"
  ],
  tiers: [
    {
      name: "Light",
      monthlyPrice: 17,
      features: ["Custom domain", "2 GB Storage", "2 Collaborators", "Light marketing"],
      isPopular: false
    },
    {
      name: "Core",
      monthlyPrice: 29,
      features: ["50 GB Storage", "Basic eCommerce", "Accept payments", "Site analytics"],
      isPopular: false
    },
    {
      name: "Business",
      monthlyPrice: 39,
      features: ["100 GB Storage", "Standard eCommerce", "10 Collaborators", "Developer platform"],
      isPopular: true
    },
    {
      name: "Business Elite",
      monthlyPrice: 159,
      features: ["Unlimited Storage", "Advanced eCommerce", "Priority support", "100 Collaborators"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Drag-and-Drop Editor", categoryName: "Design", hasFeature: true },
    { featureName: "App Market", categoryName: "Ecosystem", hasFeature: true },
    { featureName: "Wix Bookings", categoryName: "Business", hasFeature: true },
    { featureName: "AI Design Tools", categoryName: "AI", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://wix.com/upgrade/website"
};
