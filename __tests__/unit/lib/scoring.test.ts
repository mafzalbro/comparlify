import { describe, it, expect } from 'vitest'
import { calculatePlatformScore, calculateComparisonAverageScore } from '@/lib/scoring'

describe('Scoring Logic', () => {
  it('calculates platform score by averaging non-zero metrics', () => {
    const platform = {
      rating: 4.5,
      featuresRating: 4.0,
      easeOfUse: 0, // Ignored
      support: null, // Ignored
    }
    expect(calculatePlatformScore(platform)).toBe('4.3')
  })

  it('returns 0.0 if no metrics are available', () => {
    expect(calculatePlatformScore({})).toBe('0.0')
    expect(calculatePlatformScore({ rating: 0, support: null })).toBe('0.0')
  })

  it('calculates average score for comparison', () => {
    const pA = { rating: 4.0 }
    const pB = { rating: 5.0 }
    expect(calculateComparisonAverageScore(pA, pB)).toBe('4.5')
  })

  it('handles cases where one platform has no score', () => {
    const pA = { rating: 4.0 }
    const pB = {}
    expect(calculateComparisonAverageScore(pA, pB)).toBe('4.0')
  })
})
