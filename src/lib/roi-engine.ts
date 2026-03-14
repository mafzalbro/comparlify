export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPriceMonthlyEquivalent: number | null;
  transactionFeePercent: number | null;
}

export interface Platform {
  id: string;
  name: string;
  tiers: PricingTier[];
}

export interface GatewayConfig {
  name: string;
  percent: number;
  fixed: number;
}

export const GATEWAYS: Record<string, GatewayConfig> = {
  stripe: { name: "Stripe", percent: 2.9, fixed: 0.30 },
  paypal: { name: "PayPal", percent: 3.49, fixed: 0.49 },
  none: { name: "No Fees / Custom", percent: 0, fixed: 0 },
};

export interface ROICalculationResult {
  monthlyPlatformCost: number;
  monthlyGatewayFees: number;
  monthlyTotalCost: number;
  annualTotalCost: number;
  threeYearTotalCost: number;
  breakEvenSales: number; // how many sales at avg price to cover total cost
  effectiveFeePercent: number; // total cost / revenue
}

export function calculateROI(
  revenue: number,
  salesCount: number,
  tier: PricingTier,
  gateway: GatewayConfig,
  billingInterval: "monthly" | "annually" = "monthly"
): ROICalculationResult {
  const platformMonthlyPrice = billingInterval === "annually" && tier.annualPriceMonthlyEquivalent !== null
    ? tier.annualPriceMonthlyEquivalent
    : tier.monthlyPrice;

  // Platform transaction fees
  const platformTransactionFees = (revenue * (tier.transactionFeePercent || 0)) / 100;
  
  const monthlyPlatformCost = platformMonthlyPrice + platformTransactionFees;

  // Gateway fees
  const gatewayPercentFee = (revenue * gateway.percent) / 100;
  const gatewayFixedFeeTotal = salesCount * gateway.fixed;
  const monthlyGatewayFees = gatewayPercentFee + gatewayFixedFeeTotal;

  const monthlyTotalCost = monthlyPlatformCost + monthlyGatewayFees;
  const annualTotalCost = monthlyTotalCost * 12;
  const threeYearTotalCost = annualTotalCost * 3;

  const avgPricePerSale = salesCount > 0 ? revenue / salesCount : 0;
  
  // Break even: Cost = Sales * (Price - GatewayVariable - PlatformVariable) - (GatewayFixed - PlatformFixed?)
  // Simplified: SalesNeeded = PlatformFixedCost / (Price - GatewayPercent - PlatformPercent - GatewayFixed)
  const variableCostPerSale = (avgPricePerSale * (gateway.percent + (tier.transactionFeePercent || 0))) / 100 + gateway.fixed;
  const marginPerSale = avgPricePerSale - variableCostPerSale;
  
  const breakEvenSales = marginPerSale > 0 ? Math.ceil(platformMonthlyPrice / marginPerSale) : 0;

  const effectiveFeePercent = revenue > 0 ? (monthlyTotalCost / revenue) * 100 : 0;

  return {
    monthlyPlatformCost,
    monthlyGatewayFees,
    monthlyTotalCost,
    annualTotalCost,
    threeYearTotalCost,
    breakEvenSales,
    effectiveFeePercent,
  };
}

export interface Recommendation {
  bestTier: PricingTier;
  bestPlatform: Platform;
  annualSavings: number;
  monthlySavings: number;
  percentSavings: number;
}

export function findBestDeal(
  currentRevenue: number,
  currentSalesCount: number,
  currentTier: PricingTier,
  allPlatforms: Platform[],
  gateway: GatewayConfig,
  billingInterval: "monthly" | "annually" = "monthly"
): Recommendation | null {
  const currentStats = calculateROI(currentRevenue, currentSalesCount, currentTier, gateway, billingInterval);
  
  let bestRec: Recommendation | null = null;
  let maxSavings = 0;

  for (const platform of allPlatforms) {
    for (const tier of platform.tiers) {
      if (tier.id === currentTier.id) continue;
      
      const stats = calculateROI(currentRevenue, currentSalesCount, tier, gateway, billingInterval);
      const savings = currentStats.annualTotalCost - stats.annualTotalCost;
      
      if (savings > maxSavings) {
        maxSavings = savings;
        bestRec = {
          bestTier: tier,
          bestPlatform: platform,
          annualSavings: savings,
          monthlySavings: savings / 12,
          percentSavings: (savings / currentStats.annualTotalCost) * 100
        };
      }
    }
  }

  return bestRec;
}
