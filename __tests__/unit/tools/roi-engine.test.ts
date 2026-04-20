import { describe, it, expect } from 'vitest'
import { calculateROI, findBestDeal, type PricingTier, type Platform, GATEWAYS } from '@/lib/roi-engine'

describe('ROI Engine Logic', () => {
  const mockTier: PricingTier = {
    id: 't1',
    name: 'Basic',
    monthlyPrice: 99,
    annualPriceMonthlyEquivalent: 79,
    transactionFeePercent: 2,
  }

  const stripe = GATEWAYS.stripe // 2.9% + 0.30

  describe('calculateROI', () => {
    it('calculates monthly costs correctly for monthly billing', () => {
      const revenue = 1000
      const salesCount = 10
      const result = calculateROI(revenue, salesCount, mockTier, stripe, 'monthly')

      // Platform: 99 + (1000 * 0.02) = 119
      // Gateway: (1000 * 0.029) + (10 * 0.30) = 29 + 3 = 32
      // Total: 119 + 32 = 151
      expect(result.monthlyPlatformCost).toBe(119)
      expect(result.monthlyGatewayFees).toBe(32)
      expect(result.monthlyTotalCost).toBe(151)
      expect(result.annualTotalCost).toBe(151 * 12)
    })

    it('calculates costs correctly for annual billing', () => {
      const revenue = 1000
      const salesCount = 10
      const result = calculateROI(revenue, salesCount, mockTier, stripe, 'annually')

      // Platform: 79 + (1000 * 0.02) = 99
      // Gateway: 32
      // Total: 131
      expect(result.monthlyPlatformCost).toBe(99)
      expect(result.monthlyTotalCost).toBe(131)
    })

    it('calculates break even sales correctly', () => {
      const revenue = 1000
      const salesCount = 10
      const result = calculateROI(revenue, salesCount, mockTier, stripe, 'monthly')

      // Price = 100
      // Variable cost per sale: (100 * (0.029 + 0.02)) + 0.30 = 4.9 + 0.3 = 5.2
      // Margin = 94.8
      // Break even = 99 / 94.8 = 1.04 -> 2
      expect(result.breakEvenSales).toBe(2)
    })
  })

  describe('findBestDeal', () => {
    it('finds the best platform from a list', () => {
      const platforms: Platform[] = [
        {
          id: 'p2',
          name: 'Cheaper Platform',
          tiers: [{ id: 't2', name: 'Cheap', monthlyPrice: 50, annualPriceMonthlyEquivalent: 40, transactionFeePercent: 0 }]
        }
      ]

      const revenue = 5000
      const salesCount = 50

      const recommendation = findBestDeal(revenue, salesCount, mockTier, platforms, stripe, 'monthly')

      expect(recommendation).not.toBeNull()
      expect(recommendation?.bestPlatform.name).toBe('Cheaper Platform')
      expect(recommendation?.annualSavings).toBeGreaterThan(0)
    })
  })
})
