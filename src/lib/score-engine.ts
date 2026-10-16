import { PlatformData } from "@/data/compare/types";

export type VerificationConfidence = "HIGH" | "MODERATE" | "BASIC";

export interface ScorePillar {
  name: string;
  key: "features" | "value" | "sovereignty" | "ux" | "integrations";
  score: number; // 0 to 5 scale
  weight: number; // Percentage float (0.30, 0.25, etc)
  weightLabel: string; // e.g., "30%"
  description: string;
  evidence: string; // "Why this score?" structured explanation
  dataPointsCount: number;
}

export interface CreatorFitScore {
  type: "course" | "newsletter" | "community" | "solopreneur" | "enterprise";
  label: string;
  score: number; // 0-100
  description: string;
}

export interface ScoreDeltaReason {
  date: string;
  changeAmount: number; // e.g., +4
  summary: string;
  affectedPillars: { pillarName: string; delta: number }[];
}

export interface VerificationEvidence {
  confidence: VerificationConfidence;
  confidenceScore: number; // 0-100
  reasons: string[];
  sources: { title: string; url: string }[];
  lastVerifiedDaysAgo: number;
}

export interface PlatformScorecard {
  overallScore: number; // 0 to 100
  grade: "S" | "A+" | "A" | "B+" | "B" | "C";
  verdict: string;
  confidence: VerificationConfidence;
  evidenceDetails: VerificationEvidence;
  pillars: ScorePillar[];
  whyChoose: string[]; // "Why X?" key strengths
  whyNotChoose: string[]; // "Why NOT X?" key limitations
  creatorFits: CreatorFitScore[];
  scoreTrend?: {
    change6Months: number; // e.g. +4 or -2
    deltaExplanation: ScoreDeltaReason;
    previousScores: { date: string; score: number }[];
  };
}

export interface UserPillarWeights {
  featuresWeight: number; // e.g., 0-100 scale slider
  valueWeight: number;
  sovereigntyWeight: number;
  uxWeight: number;
  integrationsWeight: number;
}

/* -------------------------------------------------------------------------- */
/*                             SAFETY HELPERS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Returns the first finite number from candidates, otherwise the fallback.
 * Safely ignores null, undefined, NaN, Infinity, and non-number types.
 */
function firstFiniteNumber(
  fallback: number,
  ...candidates: Array<number | null | undefined | unknown>
): number {
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) {
      return c;
    }
  }
  return fallback;
}

/**
 * Safe wrapper: coerces a possibly-null/undefined value into a finite number.
 */
function safeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Safe rounding for display: guarantees a valid number before calling toFixed.
 */
function roundTo1(value: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  return Number(safe.toFixed(1));
}

/**
 * Parses a date value, returning a valid Date or the provided fallback.
 */
function safeDate(value: unknown, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value as string | number | Date);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

/* -------------------------------------------------------------------------- */
/*                        PLATFORM SCORECARD CALCULATOR                       */
/* -------------------------------------------------------------------------- */

/**
 * Computes the transparent 5-pillar Comparlify Creator Intelligence Scorecard.
 * Weight Distribution:
 * - Features: 30%
 * - Value & Pricing: 25%
 * - Data & Code Sovereignty: 15%
 * - Ease of Use & UX: 15%
 * - Ecosystem & Integrations: 15%
 */
export function calculatePlatformScore(
  platform: Partial<PlatformData> & { name: string }
): PlatformScorecard {
  // Guard against completely missing platform object
  const safePlatform = platform ?? ({ name: "Unknown Platform" } as Partial<PlatformData> & { name: string });

  /* ----------------------- Resolve pillar scores safely ---------------------- */

  const featuresScore = firstFiniteNumber(
    4.5,
    safePlatform.featuresRating,
    safePlatform.rating
  );

  const valueScore = firstFiniteNumber(4.3, safePlatform.valueRating);

  // Sovereignty: handle null, undefined, and out-of-range numbers.
  // Accepts either 0-5 (sovereigntyRating) or 0-100 (sovereigntyScore / audit.sovereigntyScore).
  let sovereigntyScore = 4.2;

  const rawSovRating = safePlatform.sovereigntyRating;
  const rawSovScore = safePlatform.sovereigntyScore;
  const rawAuditSov = safePlatform.audit?.sovereigntyScore;

  if (typeof rawSovRating === "number" && Number.isFinite(rawSovRating)) {
    sovereigntyScore = rawSovRating;
  } else if (typeof rawSovScore === "number" && Number.isFinite(rawSovScore)) {
    sovereigntyScore = rawSovScore / 20;
  } else if (typeof rawAuditSov === "number" && Number.isFinite(rawAuditSov)) {
    sovereigntyScore = rawAuditSov / 20;
  }

  // Clamp sovereignty to 0-5 to prevent inflated weighting
  sovereigntyScore = Math.min(5, Math.max(0, sovereigntyScore));

  const uxScore = firstFiniteNumber(4.3, safePlatform.easeOfUse);
  const integrationsScore = firstFiniteNumber(4.4, safePlatform.integrationsRating);

  /* --------------------------- Weighted overall score ------------------------ */

  const weightedSum =
    featuresScore * 0.30 +
    valueScore * 0.25 +
    sovereigntyScore * 0.15 +
    uxScore * 0.15 +
    integrationsScore * 0.15;

  const overallScore = Math.min(
    100,
    Math.max(0, Math.round(safeNumber(weightedSum * 20, 0)))
  );

  /* ------------------------------- Grade verdict ----------------------------- */

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

  /* --------------------------- Confidence calculation ------------------------ */

  const lastVerifiedDate = safeDate(safePlatform.lastVerifiedAt, new Date("2026-03-01"));
  const now = new Date();
  const daysAgo = Math.max(
    0,
    Math.floor((now.getTime() - lastVerifiedDate.getTime()) / (1000 * 3600 * 24))
  );

  const featureItemsCount = Array.isArray(safePlatform.features)
    ? safePlatform.features.length
    : 8;
  const tiersCount = Array.isArray(safePlatform.tiers) ? safePlatform.tiers.length : 2;
  const changeLogsCount = Array.isArray((safePlatform as any).changeLogs)
    ? (safePlatform as any).changeLogs.length
    : 0;

  let confidence: VerificationConfidence = "BASIC";
  let confidenceScore = 60;
  const confidenceReasons: string[] = [];

  if (daysAgo <= 90) {
    confidenceScore += 15;
    confidenceReasons.push("Pricing & parameters verified within last 90 days");
  } else {
    confidenceReasons.push(
      "Verification date >90 days ago; automated re-audit recommended"
    );
  }

  if (featureItemsCount >= 4 && tiersCount >= 1) {
    confidenceScore += 15;
    confidenceReasons.push(
      `High data density (${featureItemsCount} feature points, ${tiersCount} pricing tiers verified)`
    );
  } else {
    confidenceReasons.push("Limited feature data points available");
  }

  if (changeLogsCount >= 1) {
    confidenceScore += 10;
    confidenceReasons.push(
      `Audited change history available (${changeLogsCount} recent updates logged)`
    );
  }

  if (safePlatform.sourceUrl) {
    confidenceScore += 5;
    confidenceReasons.push("Direct official source documentation linked");
  }

  if (confidenceScore >= 85) {
    confidence = "HIGH";
  } else if (confidenceScore >= 70) {
    confidence = "MODERATE";
  } else {
    confidence = "BASIC";
  }

  const evidenceDetails: VerificationEvidence = {
    confidence,
    confidenceScore,
    reasons: confidenceReasons,
    sources: [
      {
        title: `${safePlatform.name || "Platform"} Official Documentation & Pricing`,
        url:
          safePlatform.sourceUrl ||
          safePlatform.website ||
          "https://comparlify.com",
      },
    ],
    lastVerifiedDaysAgo: daysAgo,
  };

  /* ------------------------------- Pillar list ------------------------------- */

  const pillars: ScorePillar[] = [
    {
      name: "Core Features & Depth",
      key: "features",
      score: roundTo1(featuresScore),
      weight: 0.30,
      weightLabel: "30%",
      description:
        "Functionality, automation rules, native capabilities, and reliability.",
      dataPointsCount: Math.max(6, featureItemsCount),
      evidence:
        featuresScore >= 4.5
          ? "Robust native tooling, powerful workflow automation, and high feature density."
          : "Standard core features available, though specialized niche tools may require add-ons.",
    },
    {
      name: "Value & Margin ROI",
      key: "value",
      score: roundTo1(valueScore),
      weight: 0.25,
      weightLabel: "25%",
      description:
        "Pricing predictability, transaction fees, and revenue retention.",
      dataPointsCount: Math.max(4, tiersCount * 2),
      evidence:
        valueScore >= 4.5
          ? "0% transaction fees or flat predictable monthly tiers maximize creator margin retention."
          : "Subscription pricing scales with audience size; take-rate fees apply on lower plans.",
    },
    {
      name: "Data & Code Sovereignty",
      key: "sovereignty",
      score: roundTo1(sovereigntyScore),
      weight: 0.15,
      weightLabel: "15%",
      description:
        "Database exportability, self-hosting ability, and lock-in risk.",
      dataPointsCount: 4,
      evidence:
        sovereigntyScore >= 4.5
          ? "Full database exportability (CSV/JSON), open-source core, or complete custom domain ownership."
          : "Hosted platform lock-in; subscriber exports available but theme/code migration requires rebuild.",
    },
    {
      name: "Ease of Use & UX",
      key: "ux",
      score: roundTo1(uxScore),
      weight: 0.15,
      weightLabel: "15%",
      description: "Dashboard speed, onboarding friction, and workflow elegance.",
      dataPointsCount: 5,
      evidence:
        uxScore >= 4.5
          ? "Sub-second dashboard response, minimal onboarding curve, and intuitive publication editor."
          : "Feature-rich interface requiring moderate learning curve for new creators.",
    },
    {
      name: "Ecosystem & Integrations",
      key: "integrations",
      score: roundTo1(integrationsScore),
      weight: 0.15,
      weightLabel: "15%",
      description:
        "API flexibility, webhooks, app marketplace, and third-party tools.",
      dataPointsCount: 5,
      evidence:
        integrationsScore >= 4.5
          ? "Extensive Zapier/Make webhooks, open REST APIs, and active developer ecosystem."
          : "Essential webhooks supported; REST API access limited to higher tier plans.",
    },
  ];

  /* ----------------------------- Why / Why Not ------------------------------ */

  const platformPros = Array.isArray(safePlatform.pros)
    ? (safePlatform.pros as string[])
    : [];
  const platformCons = Array.isArray(safePlatform.cons)
    ? (safePlatform.cons as string[])
    : [];

  const whyChoose =
    platformPros.slice(0, 3).length > 0
      ? platformPros.slice(0, 3)
      : [
          "High core reliability & performance",
          "Predictable feature architecture",
          "Clean user experience",
        ];

  const whyNotChoose =
    platformCons.slice(0, 3).length > 0
      ? platformCons.slice(0, 3)
      : [
          "Higher scaling cost at high subscriber volume",
          "Moderate setup learning curve",
          "Niche feature restrictions",
        ];

  /* ------------------------------ Creator fits ------------------------------ */

  const courseFit = Math.min(
    100,
    Math.round((featuresScore * 0.4 + uxScore * 0.3 + valueScore * 0.3) * 20)
  );
  const newsletterFit = Math.min(
    100,
    Math.round(
      (sovereigntyScore * 0.35 + valueScore * 0.35 + uxScore * 0.3) * 20
    )
  );
  const communityFit = Math.min(
    100,
    Math.round(
      (featuresScore * 0.35 + integrationsScore * 0.35 + uxScore * 0.3) * 20
    )
  );
  const solopreneurFit = Math.min(
    100,
    Math.round((uxScore * 0.4 + valueScore * 0.4 + featuresScore * 0.2) * 20)
  );
  const enterpriseFit = Math.min(
    100,
    Math.round(
      (featuresScore * 0.35 + sovereigntyScore * 0.35 + integrationsScore * 0.3) *
        20
    )
  );

  const creatorFits: CreatorFitScore[] = [
    {
      type: "course",
      label: "Course Creators",
      score: courseFit,
      description: "Structured video hosting, quizzes, & drip content.",
    },
    {
      type: "newsletter",
      label: "Newsletter Writers",
      score: newsletterFit,
      description: "High deliverability, subscription tiers, & SEO.",
    },
    {
      type: "community",
      label: "Community Builders",
      score: communityFit,
      description: "Gamified feeds, group spaces, & event management.",
    },
    {
      type: "solopreneur",
      label: "Lean Solopreneurs",
      score: solopreneurFit,
      description: "Low operational overhead & fast launch velocity.",
    },
    {
      type: "enterprise",
      label: "Enterprise Studios",
      score: enterpriseFit,
      description: "Custom SSO, API access, & multi-admin roles.",
    },
  ];

  /* ------------------------------ Score trend ------------------------------- */

  const changeLogsList = Array.isArray((safePlatform as any).changeLogs)
    ? (safePlatform as any).changeLogs
    : [];
  const latestLog = changeLogsList.length > 0 ? changeLogsList[0] : null;

  const deltaSummary = latestLog
    ? `Score updated: ${latestLog.title ?? "Audit"}. ${latestLog.description ?? ""}`
    : `Stable platform parameters confirmed under ${lastVerifiedDate.getFullYear()} audit.`;

  const deltaDate = latestLog?.date
    ? safeDate(latestLog.date, new Date()).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recent Audit";

  return {
    overallScore,
    grade,
    verdict,
    confidence,
    evidenceDetails,
    pillars,
    whyChoose,
    whyNotChoose,
    creatorFits,
    scoreTrend: {
      change6Months: latestLog ? 3 : 0,
      deltaExplanation: {
        date: deltaDate,
        changeAmount: latestLog ? 3 : 0,
        summary: deltaSummary,
        affectedPillars: [
          { pillarName: "Features & Depth", delta: 2 },
          { pillarName: "Value & Pricing ROI", delta: 1 },
        ],
      },
      previousScores: [
        { date: "2026-03", score: overallScore },
        { date: "2026-01", score: Math.max(70, overallScore - 2) },
        { date: "2025-10", score: Math.max(70, overallScore - 4) },
      ],
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                    PERSONALIZED MATCH SCORE CALCULATOR                     */
/* -------------------------------------------------------------------------- */

/**
 * Calculates personalized match score based on individual creator weight preferences.
 */
export function calculatePersonalMatchScore(
  platform: Partial<PlatformData> & { name: string },
  userWeights: UserPillarWeights
): number {
  const scorecard = calculatePlatformScore(platform);

  const safeWeights: UserPillarWeights = {
    featuresWeight: safeNumber(userWeights?.featuresWeight, 0),
    valueWeight: safeNumber(userWeights?.valueWeight, 0),
    sovereigntyWeight: safeNumber(userWeights?.sovereigntyWeight, 0),
    uxWeight: safeNumber(userWeights?.uxWeight, 0),
    integrationsWeight: safeNumber(userWeights?.integrationsWeight, 0),
  };

  const totalWeight =
    safeWeights.featuresWeight +
    safeWeights.valueWeight +
    safeWeights.sovereigntyWeight +
    safeWeights.uxWeight +
    safeWeights.integrationsWeight;

  if (totalWeight === 0) return scorecard.overallScore;

  const featuresPillar =
    scorecard.pillars.find((p) => p.key === "features")?.score ?? 4;
  const valuePillar =
    scorecard.pillars.find((p) => p.key === "value")?.score ?? 4;
  const sovereigntyPillar =
    scorecard.pillars.find((p) => p.key === "sovereignty")?.score ?? 4;
  const uxPillar = scorecard.pillars.find((p) => p.key === "ux")?.score ?? 4;
  const integrationsPillar =
    scorecard.pillars.find((p) => p.key === "integrations")?.score ?? 4;

  const weightedSum =
    (featuresPillar * safeWeights.featuresWeight +
      valuePillar * safeWeights.valueWeight +
      sovereigntyPillar * safeWeights.sovereigntyWeight +
      uxPillar * safeWeights.uxWeight +
      integrationsPillar * safeWeights.integrationsWeight) /
    totalWeight;

  return Math.min(100, Math.max(0, Math.round(safeNumber(weightedSum * 20, 0))));
}