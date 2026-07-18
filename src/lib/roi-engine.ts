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

export interface WealthForecast {
  year: number;
  revenue: number;
  platformFees: number;
  gatewayFees: number;
  totalCost: number;
  cumulativeCost: number;
}

export interface ROICalculationResult {
  monthlyPlatformCost: number;
  monthlyGatewayFees: number;
  monthlyTotalCost: number;
  annualTotalCost: number;
  threeYearTotalCost: number;
  fiveYearWealthLoss: number; // Cumulative cost over 5 years with growth
  breakEvenSales: number;
  effectiveFeePercent: number;
  forecast: WealthForecast[];
}

/**
 * Industrial ROI Engine with Wealth Loss Forecasting
 * Simulates growth to show the long-term impact of platform fees.
 */
export function calculateROI(
  revenue: number,
  salesCount: number,
  tier: PricingTier,
  gateway: GatewayConfig,
  billingInterval: "monthly" | "annually" = "monthly",
  annualGrowthRate: number = 0.20 // Default 20% annual growth
): ROICalculationResult {
  const platformMonthlyPrice = billingInterval === "annually" && tier.annualPriceMonthlyEquivalent !== null
    ? tier.annualPriceMonthlyEquivalent
    : tier.monthlyPrice;

  // Monthly breakdown for Year 1
  const platformTransactionFees = (revenue * (tier.transactionFeePercent || 0)) / 100;
  const monthlyPlatformCost = platformMonthlyPrice + platformTransactionFees;
  const gatewayPercentFee = (revenue * gateway.percent) / 100;
  const gatewayFixedFeeTotal = salesCount * gateway.fixed;
  const monthlyGatewayFees = gatewayPercentFee + gatewayFixedFeeTotal;
  const monthlyTotalCost = monthlyPlatformCost + monthlyGatewayFees;

  // 5-Year Forecast Logic
  const forecast: WealthForecast[] = [];
  let cumulativeCost = 0;
  let currentRevenue = revenue * 12;
  let currentSales = salesCount * 12;

  for (let year = 1; year <= 5; year++) {
    const yearPlatformFees = (platformMonthlyPrice * 12) + (currentRevenue * (tier.transactionFeePercent || 0)) / 100;
    const yearGatewayFees = (currentRevenue * gateway.percent / 100) + (currentSales * gateway.fixed);
    const yearTotalCost = yearPlatformFees + yearGatewayFees;

    cumulativeCost += yearTotalCost;

    forecast.push({
      year,
      revenue: currentRevenue,
      platformFees: yearPlatformFees,
      gatewayFees: yearGatewayFees,
      totalCost: yearTotalCost,
      cumulativeCost
    });

    // Project growth for next year
    currentRevenue *= (1 + annualGrowthRate);
    currentSales *= (1 + annualGrowthRate);
  }

  const annualTotalCost = monthlyTotalCost * 12;
  const avgPricePerSale = salesCount > 0 ? revenue / salesCount : 0;
  const variableCostPerSale = (avgPricePerSale * (gateway.percent + (tier.transactionFeePercent || 0))) / 100 + gateway.fixed;
  const marginPerSale = avgPricePerSale - variableCostPerSale;
  const breakEvenSales = marginPerSale > 0 ? Math.ceil(platformMonthlyPrice / marginPerSale) : 0;
  const effectiveFeePercent = revenue > 0 ? (monthlyTotalCost / revenue) * 100 : 0;

  return {
    monthlyPlatformCost,
    monthlyGatewayFees,
    monthlyTotalCost,
    annualTotalCost,
    threeYearTotalCost: forecast[2].cumulativeCost,
    fiveYearWealthLoss: cumulativeCost,
    breakEvenSales,
    effectiveFeePercent,
    forecast
  };
}

export interface Recommendation {
  bestTier: PricingTier;
  bestPlatform: Platform;
  annualSavings: number;
  fiveYearSavings: number;
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
  let maxFiveYearSavings = 0;

  for (const platform of allPlatforms) {
    for (const tier of platform.tiers) {
      if (tier.id === currentTier.id) continue;
      
      const stats = calculateROI(currentRevenue, currentSalesCount, tier, gateway, billingInterval);
      const savings = currentStats.fiveYearWealthLoss - stats.fiveYearWealthLoss;
      
      if (savings > maxFiveYearSavings) {
        maxFiveYearSavings = savings;
        bestRec = {
          bestTier: tier,
          bestPlatform: platform,
          annualSavings: currentStats.annualTotalCost - stats.annualTotalCost,
          fiveYearSavings: savings,
          percentSavings: (savings / currentStats.fiveYearWealthLoss) * 100
        };
      }
    }
  }

  return bestRec;
}
