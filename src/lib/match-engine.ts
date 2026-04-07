// Pure deterministic logic - supports server and client execution

export interface MatchDimensions {
    revenue: number;
    studentCount: number;
    technicalSkill: 1 | 2 | 3 | 4 | 5; // 1: Beginner, 5: Engineer
    requiredFeatures: string[];
    monthlyBudget: number;
}

export interface PlatformScore {
    platformId: string;
    totalScore: number;
    monthlyCost: number;
    tierName: string;
    vectorScores: {
        financial: number;
        features: number;
        operational: number;
        migration: number;
    };
}

/**
 * Deterministic Platform Matching Algorithm
 * Vector 1: Financial Fit (Budget vs Cost)
 * Vector 2: Feature Parity (Required vs Support)
 * Vector 3: Operational Ease (Skill vs Platform Complexity)
 * Vector 4: Migration Distance (Current vs Target)
 */
export function calculatePlatformMatch(
    profile: MatchDimensions,
    platform: any, // Platform with tiers and features
): PlatformScore {
    // 1. Financial Score (Lower cost relative to budget is better)
    // Weight: 0.3
    const bestTier = platform.tiers.sort((a: any, b: any) => a.monthlyPrice - b.monthlyPrice)[0];
    const costRatio = bestTier.monthlyPrice / profile.monthlyBudget;
    let financialScore = costRatio <= 1 ? 100 : Math.max(0, 100 - (costRatio - 1) * 100);

    // 2. Feature Score (Percentage of required features found)
    // Weight: 0.4
    const platformFeatures = platform.features?.map((f: any) => f.featureId) || [];
    const matchedCount = profile.requiredFeatures.filter(f => platformFeatures.includes(f)).length;
    const featureScore = profile.requiredFeatures.length > 0 
        ? (matchedCount / profile.requiredFeatures.length) * 100 
        : 100;

    // 3. Operational Score (Skill match to ease of use)
    // Weight: 0.2
    // If user skill is 1 and platform ease is 5 -> Good
    // If user skill is 1 and platform ease is 1 -> Bad
    const operationalScore = (platform.easeOfUse / 5) * 100;

    // 4. Migration Score (Placeholder for now, simplified)
    // Weight: 0.1
    const migrationScore = 100; 

    const totalScore = (
        (financialScore * 0.3) +
        (featureScore * 0.4) +
        (operationalScore * 0.2) +
        (migrationScore * 0.1)
    );

    return {
        platformId: platform.id,
        totalScore: Math.round(totalScore),
        monthlyCost: bestTier.monthlyPrice,
        tierName: bestTier.name,
        vectorScores: {
            financial: Math.round(financialScore),
            features: Math.round(featureScore),
            operational: Math.round(operationalScore),
            migration: Math.round(migrationScore),
        }
    };
}
