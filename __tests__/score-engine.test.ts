import { describe, it, expect } from "vitest";
import { calculatePlatformScore } from "@/lib/score-engine";

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
  });
});
