export type AnswerValue = string | string[];

export interface Platform {
  id: string;
  name: string;
  budget: "low" | "medium" | "high";
  skill: "beginner" | "intermediate" | "advanced";
  goal: "simple" | "membership" | "business";
  features: string[];
  affiliateUrl?: string;
}

export type Answers = Record<string, string | string[]>;

export interface Question {
  id: string;
  text: string;
  category?: "budget" | "skill" | "goal" | "features";
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
}

export const platformQuestions: Question[] = [
  {
    id: "budget",
    text: "What is your monthly technology budget?",
    category: "budget",
    options: [
      { value: "low", label: "Seed ($0 - $50)", description: "Starting lean, prioritizing absolute value." },
      { value: "medium", label: "Growth ($50 - $200)", description: "Willing to invest for better automation and tools." },
      { value: "high", label: "Scale ($200+)", description: "Premium infrastructure for high-volume creator businesses." }
    ]
  },
  {
    id: "skill",
    text: "How would you rate your technical confidence?",
    category: "skill",
    options: [
      { value: "beginner", label: "Zero-Code", description: "I want a turnkey solution that 'just works'." },
      { value: "intermediate", label: "Power User", description: "Comfortable with integrations and some complexity." },
      { value: "advanced", label: "Architect", description: "I want deep customization and advanced workflows." }
    ]
  },
  {
    id: "goal",
    text: "What is your primary business objective?",
    category: "goal",
    options: [
      { value: "simple", label: "Sell Courses", description: "A clean, efficient way to host and sell video content." },
      { value: "membership", label: "Build Community", description: "Focusing on recurring revenue and member engagement." },
      { value: "business", label: "All-in-One Growth", description: "Full marketing suite: funnels, email, and course hosting." }
    ]
  },
  {
    id: "volume",
    text: "Expected volume of students/members?",
    options: [
      { value: "startup", label: "0 - 100", description: "Just starting to build an audience." },
      { value: "active", label: "100 - 1,000", description: "Established audience ready to convert." },
      { value: "enterprise", label: "1,000+", description: "Scaling fast and need robust infrastructure." }
    ]
  }
];

export const platformRegistry: Platform[] = [
  {
    id: "teachable",
    name: "Teachable",
    budget: "low",
    skill: "beginner",
    goal: "simple",
    features: ["course", "basic marketing"],
    affiliateUrl: "https://teachable.sjv.io/c/12345/comparlify",
  },
  {
    id: "kajabi",
    name: "Kajabi",
    budget: "high",
    skill: "advanced",
    goal: "business",
    features: ["email marketing", "funnel builder", "affiliate system", "crm"],
    affiliateUrl: "https://kajabi.com/comparlify",
  },
  {
    id: "podia",
    name: "Podia",
    budget: "low",
    skill: "beginner",
    goal: "membership",
    features: ["email marketing", "community", "digital downloads"],
    affiliateUrl: "https://podia.com/comparlify",
  },
  {
    id: "thinkific",
    name: "Thinkific",
    budget: "medium",
    skill: "intermediate",
    goal: "simple",
    features: ["course", "app store", "community"],
    affiliateUrl: "https://thinkific.com/comparlify",
  },
  {
    id: "systeme",
    name: "Systeme.io",
    budget: "low",
    skill: "intermediate",
    goal: "business",
    features: ["funnel builder", "email marketing", "affiliate system"],
    affiliateUrl: "https://systeme.io/comparlify",
  },
  {
    id: "kartra",
    name: "Kartra",
    budget: "high",
    skill: "advanced",
    goal: "business",
    features: [
      "funnel builder",
      "email marketing",
      "affiliate system",
      "automation",
    ],
    affiliateUrl: "https://kartra.com/comparlify",
  },
];

export interface RecommendationResult {
  winnerId: string;
  winnerName: string;
  alternativeId: string;
  alternativeName: string;
  score: number;
  reasons: string[];
  matchPercentage: number;
}

export function calculatePlatformRecommendation(answers: Answers): RecommendationResult {
  const scores = platformRegistry.map(platform => {
    let score = 0;
    const reasons: string[] = [];

    // Budget weighting (30% impact)
    if (platform.budget === answers.budget) {
      score += 30;
      reasons.push(`Budget alignment: Optimized for your ${answers.budget} range.`);
    } else if (answers.budget === "medium" || (answers.budget === "high" && platform.budget === "medium")) {
      score += 15;
    }

    // Skill weighting (25% impact)
    if (platform.skill === answers.skill) {
      score += 25;
      reasons.push(`Technical fit: Matches your '${answers.skill}' workflow preference.`);
    }

    // Goal weighting (35% impact)
    if (platform.goal === answers.goal) {
      score += 35;
      reasons.push(`Objective sync: Engineered primarily for ${answers.goal} business models.`);
    }

    // Volume Adjustment
    if (answers.volume === "enterprise" && platform.budget === "high") {
      score += 10;
      reasons.push("Scale support: Capable of handling high-volume enterprise traffic.");
    }

    return { 
      ...platform, 
      finalScore: score, 
      matchReasons: reasons.slice(0, 3) 
    };
  });

  const sorted = [...scores].sort((a, b) => b.finalScore - a.finalScore);
  const winner = sorted[0];
  const runnerUp = sorted[1];

  return {
    winnerId: winner.id,
    winnerName: winner.name,
    alternativeId: runnerUp.id,
    alternativeName: runnerUp.name,
    score: winner.finalScore,
    reasons: winner.matchReasons,
    matchPercentage: Math.min(winner.finalScore, 100)
  };
}
