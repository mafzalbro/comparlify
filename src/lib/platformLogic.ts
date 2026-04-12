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

export interface ScoredResult {
  platform: Platform;
  score: number;
  matchPercentage: number;
  reason: string;
  categoryScores: {
    budget: number;
    skill: number;
    goal: number;
    features: number;
  };
}

export interface RecommendationResult {
  winnerId: string;
  winnerName: string;
  alternativeId: string;
  alternativeName: string;
  score: number;
  reasons: string[];
  matchPercentage: number;
}

export function calculateTopRecommendations(answers: Answers): ScoredResult[] {
  const scores = platformRegistry.map(platform => {
    let score = 0;
    const reasons: string[] = [];

    // All these fields are expected to be strings in our current wizard
    const budget = Array.isArray(answers.budget) ? answers.budget[0] : answers.budget;
    const skill = Array.isArray(answers.skill) ? answers.skill[0] : answers.skill;
    const goal = Array.isArray(answers.goal) ? answers.goal[0] : answers.goal;
    const features = Array.isArray(answers.features) ? answers.features : [];

    const catScores = { budget: 0, skill: 0, goal: 0, features: 0 };

    if (platform.budget === budget) {
      catScores.budget = 30;
      score += 30;
      reasons.push("Perfect budget alignment");
    }
    
    if (platform.skill === skill) {
      catScores.skill = 25;
      score += 25;
      reasons.push(`${platform.name} matches your tech skill level`);
    }

    if (platform.goal === goal) {
      catScores.goal = 35;
      score += 35;
      reasons.push(`Primary goal match: ${goal}`);
    }

    // Features matching
    const platformFeatures = platform.features.map(f => f.toLowerCase());
    const matchedFeatures = features.filter(f => platformFeatures.includes(f.toLowerCase()));
    if (matchedFeatures.length > 0) {
      catScores.features = Math.min(matchedFeatures.length * 5, 10);
      score += catScores.features;
      reasons.push(`Matches features: ${matchedFeatures.join(", ")}`);
    }

    return {
      platform,
      score,
      matchPercentage: Math.min(score, 100),
      reason: reasons[0] || "General recommendation based on your profile.",
      categoryScores: catScores
    };
  });

  return [...scores].sort((a, b) => b.score - a.score).slice(0, 3);
}

// Keep the old one for backward compatibility if used elsewhere
export function calculatePlatformRecommendation(answers: Answers): RecommendationResult {
  const results = calculateTopRecommendations(answers);
  const winner = results[0];
  const runnerUp = results[1] || results[0];

  return {
    winnerId: winner.platform.id,
    winnerName: winner.platform.name,
    alternativeId: runnerUp.platform.id,
    alternativeName: runnerUp.platform.name,
    score: winner.score,
    reasons: [winner.reason],
    matchPercentage: winner.matchPercentage
  };
}
