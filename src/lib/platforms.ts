import { PricingTier } from "./roi-engine";

export interface PlatformMetadata {
  id: string;
  name: string;
  color: string;
  tier: PricingTier;
}

export const PLATFORM_DEFAULTS: Record<string, PlatformMetadata> = {
  teachable: {
    id: "teachable",
    name: "Teachable",
    color: "text-blue-500",
    tier: {
      id: "t-basic",
      name: "Basic",
      monthlyPrice: 59,
      annualPriceMonthlyEquivalent: 39,
      transactionFeePercent: 5,
    }
  },
  kajabi: {
    id: "kajabi",
    name: "Kajabi",
    color: "text-blue-600",
    tier: {
      id: "k-basic",
      name: "Basic",
      monthlyPrice: 199,
      annualPriceMonthlyEquivalent: 149,
      transactionFeePercent: 0,
    }
  },
  podia: {
    id: "podia",
    name: "Podia",
    color: "text-purple-500",
    tier: {
      id: "p-mover",
      name: "Mover",
      monthlyPrice: 39,
      annualPriceMonthlyEquivalent: 33,
      transactionFeePercent: 5,
    }
  },
  thinkific: {
    id: "thinkific",
    name: "Thinkific",
    color: "text-sky-500",
    tier: {
      id: "th-basic",
      name: "Basic",
      monthlyPrice: 49,
      annualPriceMonthlyEquivalent: 36,
      transactionFeePercent: 0,
    }
  }
};
