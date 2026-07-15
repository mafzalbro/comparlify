import { describe, it, expect } from 'vitest'
import { calculatePlatformMatch, type AuditDimensions } from '@/lib/match-engine'

describe('Match Engine Logic', () => {
  const mockProfile: AuditDimensions = {
    revenue: 5000,
    studentCount: 100,
    technicalSkill: 3,
    requiredFeatures: ['f1', 'f2'],
    monthlyBudget: 200,
    teamSize: 1
  }

  const mockPlatform = {
    id: 'p1',
    easeOfUse: 4,
    sovereigntyScore: 90,
    tiers: [
      { name: 'Basic', monthlyPrice: 99, transactionFeePercent: 0 },
      { name: 'Pro', monthlyPrice: 199, transactionFeePercent: 0 }
    ],
    features: [
      { featureId: 'f1' },
      { featureId: 'f2' },
      { featureId: 'f3' }
    ]
  }

  it('calculates total match score correctly', () => {
    const result = calculatePlatformMatch(mockProfile, mockPlatform)

    // Financial: 99/200 = 0.495 <= 1 -> 100. (Weight 0.3 -> 30)
    // Features: 2/2 matched = 100%. (Weight 0.4 -> 40)
    // Operational: 4/5 = 80%. (Weight 0.2 -> 16)
    // Migration: 80% (Fixed in V2 for now). (Weight 0.1 -> 8)
    // Total = 30 + 40 + 16 + 8 = 94

    expect(result.matchScore).toBe(94)
    expect(result.vectorScores.financial).toBe(100)
    expect(result.vectorScores.features).toBe(100)
    expect(result.vectorScores.operational).toBe(80)
  })

  it('penalizes if cost exceeds budget', () => {
    const expensiveProfile = { ...mockProfile, monthlyBudget: 50 }
    const result = calculatePlatformMatch(expensiveProfile, mockPlatform)

    // Financial: 99/50 = 1.98. 100 - (1.98 - 1) * 100 = 100 - 98 = 2
    expect(result.vectorScores.financial).toBe(2)
    expect(result.matchScore).toBeLessThan(94)
  })

  it('calculates feature score based on matching features', () => {
    const featureProfile = { ...mockProfile, requiredFeatures: ['f1', 'f4'] }
    const result = calculatePlatformMatch(featureProfile, mockPlatform)

    // 1 out of 2 matched -> 50%
    expect(result.vectorScores.features).toBe(50)
  })

  it('handles platforms with no features gracefully', () => {
    const barePlatform = { ...mockPlatform, features: [] }
    const result = calculatePlatformMatch(mockProfile, barePlatform)

    expect(result.vectorScores.features).toBe(0)
  })
})
