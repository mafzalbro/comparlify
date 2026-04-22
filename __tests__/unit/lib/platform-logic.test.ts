import { describe, it, expect } from 'vitest'
import { calculateTopRecommendations, calculatePlatformRecommendation } from '@/lib/platformLogic'

describe('Platform Recommendation Logic', () => {
  it('calculates top recommendations based on user answers', () => {
    const answers = {
      budget: 'high',
      skill: 'advanced',
      goal: 'business',
      features: ['email marketing', 'funnel builder']
    }

    const results = calculateTopRecommendations(answers)

    // Kajabi should be the winner for high budget/advanced/business goal
    expect(results[0].platform.name).toBe('Kajabi')
    expect(results[0].score).toBeGreaterThan(90)
    expect(results[0].categoryScores.budget).toBe(30)
    expect(results[0].categoryScores.skill).toBe(25)
    expect(results[0].categoryScores.goal).toBe(35)
  })

  it('handles low budget beginner profile correctly', () => {
    const answers = {
      budget: 'low',
      skill: 'beginner',
      goal: 'simple',
      features: ['course']
    }

    const results = calculateTopRecommendations(answers)

    // Teachable matches low/beginner/simple
    expect(results[0].platform.id).toBe('teachable')
  })

  it('returns formatted recommendation result for UI', () => {
    const answers = {
      budget: 'low',
      skill: 'beginner',
      goal: 'simple',
      features: ['course']
    }

    const result = calculatePlatformRecommendation(answers)
    expect(result.winnerName).toBeDefined()
    expect(result.alternativeName).toBeDefined()
    expect(result.matchPercentage).toBeGreaterThan(0)
  })
})
