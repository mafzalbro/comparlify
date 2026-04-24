import { PlatformData } from "../types";

export const substack: PlatformData = {
  name: "Substack",
  website: "https://substack.com",
  logoUrl: "https://substackcdn.com/image/fetch/w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ed4175a-b5c9-4f7c-ba30-c75955934447_1200x675.png",
  description: "Substack is the cultural home of the independent writer and creator. It simplified the path to monetization by offering a 'free-to-start' model where they only take a cut when you get paid. Substack's greatest asset isn't just the publishing tool—it's the massive internal network of readers. Through its 'Notes' feed and recommendation engine, Substack acts as a discovery platform, driving new subscribers to your work from other writers. It’s perfect for those who want to focus purely on writing and community without the 'tech headache' of managing servers, domains, or complex funnels.",
  rating: 4.5,
  easeOfUse: 4.9,
  featuresRating: 4.2,
  support: 4.0,
  pros: [
    "No upfront costs; free to host for free lists",
    "Massive built-in recommendation network",
    "Extremely easy to set up and start writing",
    "Integrated podcasting and video features",
    "High trust factor with readers"
  ],
  cons: [
    "10% revenue share on paid subscriptions",
    "Limited design customization",
    "Weak SEO control compared to Beehiiv",
    "Minimal automation and segmenting features"
  ],
  tiers: [
    {
      name: "Free",
      monthlyPrice: 0,
      features: ["Unlimited subscribers", "Unlimited posts", "Podcasting", "Community features"],
      isPopular: true
    },
    {
      name: "Paid",
      monthlyPrice: 0,
      features: ["10% Revenue share", "Paid subscriptions", "Group discounts", "Custom domains ($50 one-time)"],
      isPopular: false
    }
  ],
  features: [
    { featureName: "Recommendations", categoryName: "Growth", hasFeature: true },
    { featureName: "Notes (Social Feed)", categoryName: "Engagement", hasFeature: true },
    { featureName: "Mobile App", categoryName: "Access", hasFeature: true },
    { featureName: "Podcasting", categoryName: "Content", hasFeature: true }
  ],
  lastVerifiedAt: "2026-04-24T00:00:00Z",
  sourceUrl: "https://substack.com/going-paid"
};
