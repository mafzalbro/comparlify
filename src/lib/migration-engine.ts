import { PlatformData } from "@/data/compare/types";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface MigrationVector {
  category: "Subscribers & Contacts" | "Content & Archives" | "Payment Gateway & Subscriptions" | "Custom Domain & SEO";
  complexity: RiskLevel;
  description: string;
  mitigation: string;
}

export interface MigrationAnalysis {
  sourcePlatformName: string;
  targetPlatformName: string;
  estimatedHours: number;
  contractorCostRange: string;
  subscriberChurnRisk: RiskLevel;
  overallRisk: RiskLevel;
  vectors: MigrationVector[];
  whatMigrates: string[];
  whatDoesNotMigrate: string[];
  keySteps: { stepNumber: number; title: string; description: string }[];
}

/**
 * Independent Migration Engine calculating multi-dimensional switching effort, cost, subscriber churn risk, and overall migration risk.
 */
export function calculateMigrationAnalysis(
  sourcePlatform: Partial<PlatformData> & { name: string },
  targetPlatform: Partial<PlatformData> & { name: string }
): MigrationAnalysis {
  const sourceName = sourcePlatform.name;
  const targetName = targetPlatform.name;

  // Determine complexity factors
  const isNewsletterToNewsletter =
    (sourceName.match(/Ghost|Beehiiv|Substack|Kit|Mailerlite/i) &&
     targetName.match(/Ghost|Beehiiv|Substack|Kit|Mailerlite/i));

  const isLmsToLms =
    (sourceName.match(/Teachable|Kajabi|Thinkific|Podia|Skool/i) &&
     targetName.match(/Teachable|Kajabi|Thinkific|Podia|Skool/i));

  let estimatedHours = 8;
  let contractorCostRange = "$300 – $600";
  let subscriberChurnRisk: RiskLevel = "MEDIUM";
  let overallRisk: RiskLevel = "MEDIUM";

  if (isNewsletterToNewsletter) {
    estimatedHours = 4;
    contractorCostRange = "$200 – $400";
    subscriberChurnRisk = "LOW";
    overallRisk = "LOW";
  } else if (isLmsToLms) {
    estimatedHours = 12;
    contractorCostRange = "$600 – $1,200";
    subscriberChurnRisk = "MEDIUM";
    overallRisk = "MEDIUM";
  } else {
    estimatedHours = 20;
    contractorCostRange = "$1,000 – $2,500";
    subscriberChurnRisk = "HIGH";
    overallRisk = "HIGH";
  }

  const vectors: MigrationVector[] = [
    {
      category: "Subscribers & Contacts",
      complexity: "LOW",
      description: "Export active and unsubscribed contact CSV records from source dashboard.",
      mitigation: "Ensure email custom fields and tag segments are mapped accurately before bulk import."
    },
    {
      category: "Content & Archives",
      complexity: isNewsletterToNewsletter ? "LOW" : "MEDIUM",
      description: "Transfer publication post archives, HTML/Markdown layouts, and embedded images.",
      mitigation: "Use native JSON/HTML post importers or automated scraper scripts."
    },
    {
      category: "Payment Gateway & Subscriptions",
      complexity: subscriberChurnRisk,
      description: "Transfer Stripe/Merchant accounts or prompt paid members to re-subscribe.",
      mitigation: "If using Stripe Connect, request a Stripe team-to-stripe team subscription token transfer."
    },
    {
      category: "Custom Domain & SEO",
      complexity: "LOW",
      description: "Re-point DNS CNAME / A records and verify 301 permalink redirects.",
      mitigation: "Keep legacy permalink URL structures identical to preserve search engine rank equity."
    }
  ];

  const whatMigrates = [
    "Subscriber email lists & unsubscribed segments",
    "Post text archive & published post history",
    "Stripe customer records (via Stripe Connect migration)",
    "Custom domain name & search index indexing"
  ];

  const whatDoesNotMigrate = [
    "Proprietary theme CSS templates & bespoke page designs",
    "Third-party active integration tokens & webhooks",
    "Active raw video upload files (must re-upload or re-embed)",
    "Historical email analytics open/click logs"
  ];

  const keySteps = [
    { stepNumber: 1, title: "Export Data Archives", description: "Download full subscriber CSVs and content JSON/ZIP export files from source." },
    { stepNumber: 2, title: "Configure Target Platform", description: "Set up brand identity, custom domain SSL, and payment gateway connections on target." },
    { stepNumber: 3, title: "Execute Import & Verify Mappings", description: "Import subscriber lists into target and verify segment tag accuracy." },
    { stepNumber: 4, title: "DNS Cutover & Redirects", description: "Update CNAME/A records and verify 301 redirect mappings for legacy post URLs." }
  ];

  return {
    sourcePlatformName: sourceName,
    targetPlatformName: targetName,
    estimatedHours,
    contractorCostRange,
    subscriberChurnRisk,
    overallRisk,
    vectors,
    whatMigrates,
    whatDoesNotMigrate,
    keySteps
  };
}
