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
