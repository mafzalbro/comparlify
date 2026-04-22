import { describe, it, expect } from 'vitest'
import { calculatePlatformMatch, type MatchDimensions } from '@/lib/match-engine'

describe('Match Engine Logic', () => {
  const mockProfile: MatchDimensions = {
    revenue: 5000,
    studentCount: 100,
    technicalSkill: 3,
    requiredFeatures: ['f1', 'f2'],
    monthlyBudget: 200,
  }

  const mockPlatform = {
    id: 'p1',
    easeOfUse: 4,
    tiers: [
      { name: 'Basic', monthlyPrice: 99 },
      { name: 'Pro', monthlyPrice: 199 }
    ],
    features: [
      { featureId: 'f1' },
      { featureId: 'f2' },
      { featureId: 'f3' }
    ]
  }

  it('calculates total score correctly', () => {
    const result = calculatePlatformMatch(mockProfile, mockPlatform)

    // Financial: 99/200 = 0.495 <= 1 -> 100. (Score * 0.3 = 30)
    // Features: 2/2 matched = 100%. (Score * 0.4 = 40)
    // Operational: 4/5 = 80. (Score * 0.2 = 16)
    // Migration: 100. (Score * 0.1 = 10)
    // Total = 30 + 40 + 16 + 10 = 96

    expect(result.totalScore).toBe(96)
    expect(result.vectorScores.financial).toBe(100)
    expect(result.vectorScores.features).toBe(100)
    expect(result.vectorScores.operational).toBe(80)
  })

  it('penalizes if cost exceeds budget', () => {
    const expensiveProfile = { ...mockProfile, monthlyBudget: 50 }
    const result = calculatePlatformMatch(expensiveProfile, mockPlatform)

    // Financial: 99/50 = 1.98. 100 - (1.98 - 1) * 100 = 100 - 98 = 2
    expect(result.vectorScores.financial).toBe(2)
    expect(result.totalScore).toBeLessThan(96)
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
