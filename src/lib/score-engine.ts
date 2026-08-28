import { PlatformData } from "@/data/compare/types";

export interface ScorePillar {
  name: string;
  key: "features" | "value" | "sovereignty" | "ux" | "integrations";
  score: number; // 0 to 5 scale
  weight: number; // Percentage float (0.30, 0.25, etc)
  weightLabel: string; // e.g., "30%"
  description: string;
}

export interface PlatformScorecard {
  overallScore: number; // 0 to 100
  grade: "S" | "A+" | "A" | "B+" | "B" | "C";
  verdict: string;
  pillars: ScorePillar[];
}

/**
 * Computes the transparent 5-pillar Comparlify Creator Intelligence Scorecard.
 * Weight Distribution:
 * - Features: 30%
 * - Value & Pricing: 25%
 * - Data & Code Sovereignty: 15%
 * - Ease of Use & UX: 15%
 * - Ecosystem & Integrations: 15%
 */
export function calculatePlatformScore(platform: Partial<PlatformData> & { name: string }): PlatformScorecard {
  const featuresScore = platform.featuresRating ?? platform.rating ?? 4.5;
  const valueScore = platform.valueRating ?? 4.3;

  // Convert sovereignty score from 0-100 or 0-5
  let sovereigntyScore = 4.2;
  if (platform.sovereigntyRating !== undefined) {
    sovereigntyScore = platform.sovereigntyRating;
  } else if (platform.sovereigntyScore !== undefined) {
    sovereigntyScore = platform.sovereigntyScore / 20;
  } else if (platform.audit?.sovereigntyScore !== undefined) {
    sovereigntyScore = platform.audit.sovereigntyScore / 20;
  }

  const uxScore = platform.easeOfUse ?? 4.3;
  const integrationsScore = platform.integrationsRating ?? 4.4;

  const weightedSum =
    featuresScore * 0.30 +
    valueScore * 0.25 +
    sovereigntyScore * 0.15 +
    uxScore * 0.15 +
    integrationsScore * 0.15;

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedSum * 20)));

  let grade: PlatformScorecard["grade"] = "B";
  let verdict = "Solid choice with standard features and baseline value.";

  if (overallScore >= 95) {
    grade = "S";
    verdict = "Industry-defining platform excellence. Top score across sovereignty, features, and scale value.";
  } else if (overallScore >= 90) {
    grade = "A+";
    verdict = "Tier-1 enterprise infrastructure. Outstanding value, performance, and creator sovereignty.";
  } else if (overallScore >= 84) {
    grade = "A";
    verdict = "High-performance platform with strong core capabilities and competitive pricing.";
  } else if (overallScore >= 78) {
    grade = "B+";
    verdict = "Good option for standard workloads, though minor trade-offs exist in fees or lock-in.";
  }

  const pillars: ScorePillar[] = [
    {
      name: "Core Features & Depth",
      key: "features",
      score: Number(featuresScore.toFixed(1)),
      weight: 0.30,
      weightLabel: "30%",
      description: "Functionality, automation rules, native capabilities, and reliability."
    },
    {
      name: "Value & Margin ROI",
      key: "value",
      score: Number(valueScore.toFixed(1)),
      weight: 0.25,
      weightLabel: "25%",
      description: "Pricing predictability, transaction fees, and revenue retention."
    },
    {
      name: "Data & Code Sovereignty",
      key: "sovereignty",
      score: Number(sovereigntyScore.toFixed(1)),
      weight: 0.15,
      weightLabel: "15%",
      description: "Database exportability, self-hosting ability, and lock-in risk."
    },
    {
      name: "Ease of Use & UX",
      key: "ux",
      score: Number(uxScore.toFixed(1)),
      weight: 0.15,
      weightLabel: "15%",
      description: "Dashboard speed, onboarding friction, and workflow elegance."
    },
    {
      name: "Ecosystem & Integrations",
      key: "integrations",
      score: Number(integrationsScore.toFixed(1)),
      weight: 0.15,
      weightLabel: "15%",
      description: "API flexibility, webhooks, app marketplace, and third-party tools."
    }
  ];

  return {
    overallScore,
    grade,
    verdict,
    pillars
  };
}
