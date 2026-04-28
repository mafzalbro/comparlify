export interface PricingTierData {
  name: string;
  monthlyPrice: number;
  annualPriceMonthlyEquivalent?: number;
  transactionFeePercent?: number;
  isPopular?: boolean;
  features?: string[]; // Simplified for data definition
}

export interface PlatformFeatureData {
  featureName: string;
  categoryName: string;
  hasFeature: boolean;
  details?: string;
}

export interface PlatformData {
  name: string;
  website: string;
  logoUrl: string;
  description: string;
  rating: number;
  easeOfUse: number;
  featuresRating: number;
  support: number;
  pros: string[];
  cons: string[];
  affiliateLink?: string;
  dealDescription?: string;
  videoHostingIncluded?: boolean;
  tiers: PricingTierData[];
  features: PlatformFeatureData[];
  lastVerifiedAt: string; // ISO string
  sourceUrl: string;
}

export interface FactData {
  title: string;
  a: string;
  b: string;
}

export interface FaqData {
  question: string;
  answer: string;
}

export interface ComparisonData {
  title: string;
  slug: string;
  summary: string;
  platformA: string;
  platformB: string;
  category: string;
  introduction: string;
  content: string;
  conclusion: string;
  published: boolean;
  facts: FactData[];
  faqs?: FaqData[];
}
