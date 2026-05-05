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
  platformAValue: string;
  platformBValue: string;
}

export interface FaqData {
  question: string;
  answer: string;
}

export interface ComparisonData {
  title: string;
  slug: string;
  summary: string;
  introduction: string;
  content?: string;
  conclusion: string;
  platformAName: string;
  platformBName: string;
  categoryName: string;
  facts: FactData[];
  faqs: FaqData[];
  published?: boolean;
}

