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

export interface AnalystAudit {
  auditorName: string;
  auditorRole: string;
  auditNotes: string;
  trustScore: number; // 0-100
  sovereigntyScore: number; // 0-100
  verificationLevel: "BASIC" | "VERIFIED" | "INDUSTRIAL";
}

export interface PlatformChangeLogData {
  id?: string;
  date: string; // ISO string or Date string like "2026-02-15"
  title: string;
  description: string;
  type: "PRICING" | "FEATURE" | "FEE_UPDATE" | "SECURITY" | "INTEGRATION";
  sourceUrl?: string;
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

  // Phase 3 Creator Intelligence 5-Pillar Scores (0-5 scale)
  valueRating?: number;
  sovereigntyRating?: number;
  integrationsRating?: number;
  category?: string;

  // Change History Log
  changeLogs?: PlatformChangeLogData[];

  // Industrial Trust Layer
  audit?: AnalystAudit;
  sovereigntyScore?: number; // Redundant but useful for quick access
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
  platformA: string;
  platformB: string;
  category: string;
  introduction: string;
  content: string;
  conclusion: string;
  published: boolean;
  facts: FactData[];
  faqs?: FaqData[];

  // Industrial Metadata
  authorName?: string;
  authorRole?: string;
  authorBio?: string;
  authorCredentials?: string[];
  metaTitle?: string;
  metaDescription?: string;
  sovereigntyScoreA?: number;
  sovereigntyScoreB?: number;
}
