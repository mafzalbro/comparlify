export interface ScorablePlatform {
  rating?: number | null;
  featuresRating?: number | null;
  easeOfUse?: number | null;
  support?: number | null;
}

/**
 * Calculates a dynamic Signal Score for a platform
 * by averaging its available quality metrics.
 */
export function calculatePlatformScore(platform: ScorablePlatform): string {
  const vals = [
    platform.rating,
    platform.featuresRating,
    platform.easeOfUse,
    platform.support,
  ].filter((v): v is number => typeof v === "number" && v > 0);

  if (vals.length === 0) return "0.0";
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

/**
 * Calculates the combined average score between two platforms.
 */
export function calculateComparisonAverageScore(
  platformA: ScorablePlatform,
  platformB: ScorablePlatform,
): string {
  const scoreA = parseFloat(calculatePlatformScore(platformA));
  const scoreB = parseFloat(calculatePlatformScore(platformB));

  if (scoreA === 0 && scoreB === 0) return "0.0";
  if (scoreA === 0) return scoreB.toFixed(1);
  if (scoreB === 0) return scoreA.toFixed(1);

  return ((scoreA + scoreB) / 2).toFixed(1);
}
