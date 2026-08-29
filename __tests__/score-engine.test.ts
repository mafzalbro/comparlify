import { describe, it, expect } from "vitest";
import { calculatePlatformScore, calculatePersonalMatchScore } from "@/lib/score-engine";

describe("Platform Scorecard Engine", () => {
  it("calculates weighted overall score correctly", () => {
    const mockPlatform = {
      name: "Ghost",
      rating: 4.8,
      easeOfUse: 4.2,
      featuresRating: 4.7,
      support: 4.5,
      valueRating: 4.9,
      sovereigntyRating: 5.0,
      integrationsRating: 4.6,
    };

    const scorecard = calculatePlatformScore(mockPlatform);

    // 4.7 * 0.30 + 4.9 * 0.25 + 5.0 * 0.15 + 4.2 * 0.15 + 4.6 * 0.15 = 1.41 + 1.225 + 0.75 + 0.63 + 0.69 = 4.705 -> * 20 = 94.1 -> round = 94
    expect(scorecard.overallScore).toBe(94);
    expect(scorecard.grade).toBe("A+");
    expect(scorecard.pillars.length).toBe(5);
  });

  it("handles fallback scores gracefully when specific ratings are missing", () => {
    const mockPlatform = {
      name: "Generic Tool",
      rating: 4.0,
      easeOfUse: 4.0,
    };

    const scorecard = calculatePlatformScore(mockPlatform);

    expect(scorecard.overallScore).toBeGreaterThan(0);
    expect(scorecard.overallScore).toBeLessThanOrEqual(100);
    expect(scorecard.pillars).toHaveLength(5);
    expect(scorecard.creatorFits).toHaveLength(5);
  });

  it("calculates personalized match score based on user slider weights", () => {
    const mockPlatform = {
      name: "Ghost",
      rating: 4.8,
      easeOfUse: 4.2,
      featuresRating: 4.7,
      support: 4.5,
      valueRating: 4.9,
      sovereigntyRating: 5.0,
      integrationsRating: 4.6,
    };

    // Creator prioritizes sovereignty and value heavily
    const userWeights = {
      featuresWeight: 10,
      valueWeight: 100,
      sovereigntyWeight: 100,
      uxWeight: 20,
      integrationsWeight: 20,
    };

    const personalScore = calculatePersonalMatchScore(mockPlatform, userWeights);
    expect(personalScore).toBeGreaterThanOrEqual(90);
  });

  it("verifies 5-pillar weighting sum invariant equals exactly 100%", () => {
    const mockPlatform = { name: "Test Platform", rating: 4.0 };
    const scorecard = calculatePlatformScore(mockPlatform);

    const sumWeights = scorecard.pillars.reduce((acc, p) => acc + p.weight, 0);
    expect(Number(sumWeights.toFixed(2))).toBe(1.00); // 1.00 = 100%
  });

  it("calculates deterministic confidence levels based on freshness and evidence", () => {
    const freshPlatform = {
      name: "Fresh Platform",
      rating: 4.8,
      lastVerifiedAt: new Date().toISOString(),
      features: [{ featureName: "F1", categoryName: "C", hasFeature: true }, { featureName: "F2", categoryName: "C", hasFeature: true }, { featureName: "F3", categoryName: "C", hasFeature: true }, { featureName: "F4", categoryName: "C", hasFeature: true }],
      tiers: [{ name: "T1", monthlyPrice: 10 }],
      changeLogs: [{ date: new Date().toISOString(), title: "Update", description: "Desc", type: "FEATURE" }],
      sourceUrl: "https://example.com"
    };

    const scorecard = calculatePlatformScore(freshPlatform as any);
    expect(scorecard.confidence).toBe("HIGH");
    expect(scorecard.evidenceDetails.lastVerifiedDaysAgo).toBeLessThan(90);
  });
});
