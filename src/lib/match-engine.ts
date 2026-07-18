// Pure deterministic logic for Industrial Audit and Platform Matching

export interface AuditDimensions {
    revenue: number;
    studentCount: number;
    technicalSkill: 1 | 2 | 3 | 4 | 5; // 1: Beginner, 5: Engineer
    requiredFeatures: string[];
    monthlyBudget: number;
    currentPlatformId?: string;
    teamSize?: number;
}

export interface TechDebtAudit {
    inefficiencyScore: number; // 0-100 (100 is highly inefficient)
    sovereigntyRisk: number; // 0-100 (100 is high risk of platform lock-in)
    operationalDrag: number; // 0-100 (100 is high manual effort)
    annualWaste: number; // Estimated dollar value of inefficiency
    bottlenecks: string[];
}

export interface PlatformMatchResult {
    platformId: string;
    matchScore: number;
    efficiencyGain: number; // Projected improvement over current
    sovereigntyScore: number; // How much this platform protects creator assets
    monthlyCost: number;
    tierName: string;
    verdict: string;
    vectorScores: {
        financial: number;
        features: number;
        operational: number;
        migration: number;
    };
}

/**
 * Industrial Tech Debt Auditor
 * Evaluates the current state of a creator's technology stack.
 */
export function auditTechDebt(profile: AuditDimensions, currentPlatform: any): TechDebtAudit {
    let inefficiencyScore = 0;
    let sovereigntyRisk = 0;
    let operationalDrag = 0;
    const bottlenecks: string[] = [];

    // 1. Inefficiency: Pricing Model Mismatch
    const bestTier = currentPlatform.tiers.sort((a: any, b: any) => a.monthlyPrice - b.monthlyPrice)[0];
    const txFee = (bestTier.transactionFeePercent || 0) / 100;
    const monthlyTxFees = profile.revenue * txFee;

    if (txFee > 0.05) {
        inefficiencyScore += 40;
        bottlenecks.push("High Transaction Fee Tax");
    } else if (txFee > 0) {
        inefficiencyScore += 20;
    }

    // 2. Sovereignty Risk: Data Lock-in
    // If platform doesn't support easy export or custom domains
    if (currentPlatform.sovereigntyScore < 60) {
        sovereigntyRisk = 100 - currentPlatform.sovereigntyScore;
        bottlenecks.push("High Platform Dependency (Data Lock-in)");
    }

    // 3. Operational Drag: Skill vs Complexity
    // If a high-skill user is on a low-feature platform, or vice versa
    const skillGap = Math.abs(profile.technicalSkill - (currentPlatform.easeOfUse || 3));
    operationalDrag = (skillGap / 5) * 100;

    if (operationalDrag > 50) {
        bottlenecks.push("Operational Skill Mismatch");
    }

    const annualWaste = (monthlyTxFees * 12) + (profile.revenue * 0.05); // 5% flat "friction" estimate

    return {
        inefficiencyScore: Math.min(inefficiencyScore, 100),
        sovereigntyRisk: Math.min(sovereigntyRisk, 100),
        operationalDrag: Math.min(operationalDrag, 100),
        annualWaste,
        bottlenecks,
    };
}

/**
 * Industrial Platform Matching Algorithm (V2)
 */
export function calculatePlatformMatch(
    profile: AuditDimensions,
    platform: any,
): PlatformMatchResult {
    // 1. Financial Score
    const bestTier = platform.tiers.sort((a: any, b: any) => a.monthlyPrice - b.monthlyPrice)[0];
    const costRatio = bestTier.monthlyPrice / profile.monthlyBudget;
    let financialScore = costRatio <= 1 ? 100 : Math.max(0, 100 - (costRatio - 1) * 100);

    // 2. Feature Score
    const platformFeatures = platform.features?.map((f: any) => f.featureId || f.featureName) || [];
    const matchedCount = profile.requiredFeatures.filter(f => platformFeatures.includes(f)).length;
    const featureScore = profile.requiredFeatures.length > 0 
        ? (matchedCount / profile.requiredFeatures.length) * 100 
        : 100;

    // 3. Operational Score
    const operationalScore = (platform.easeOfUse / 5) * 100;

    // 4. Migration Score (Migration Friction)
    // Placeholder logic: Distance between current and target
    const migrationScore = 80;

    const totalScore = (
        (financialScore * 0.3) +
        (featureScore * 0.4) +
        (operationalScore * 0.2) +
        (migrationScore * 0.1)
    );

    const sovereigntyScore = platform.sovereigntyScore || 70;

    return {
        platformId: platform.id,
        matchScore: Math.round(totalScore),
        efficiencyGain: Math.max(0, 100 - (platform.transactionFeePercent || 0) * 10),
        sovereigntyScore,
        monthlyCost: bestTier.monthlyPrice,
        tierName: bestTier.name,
        verdict: totalScore > 85 ? "Strategic Alpha" : "Viable Alternative",
        vectorScores: {
            financial: Math.round(financialScore),
            features: Math.round(featureScore),
            operational: Math.round(operationalScore),
            migration: Math.round(migrationScore),
        }
    };
}
