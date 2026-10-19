// All Prisma schema models
const allModels = [
  "Account", "Advertisement", "AffiliateClick", "Bookmark", "Comment",
  "Comparison", "ComparisonCategory", "ContactMessage", "CreatorReview",
  "CreatorReviewRevision", "EmailCampaign", "EmailRecipient", "Fact", "Faq",
  "Feature", "FeatureCategory", "ForumCategory", "ForumPost", "ForumTopic",
  "Image", "LegalDocument", "MatchProfile", "NewsArticle", "Notification",
  "Platform", "PlatformChangeLog", "PlatformFeature", "Post", "PostCategory",
  "PostFact", "PostFaq", "PostSource", "PostVote", "PricingTier", "Project",
  "ReviewModerationEvent", "Session", "SiteContent", "StackPlatform",
  "Subscription", "Tool", "TopicVote", "User", "UserStack", "VerificationToken"
];

// Explicitly mocked models (from prisma.ts mockClient.xxx = {})
const mockedModels = [
  "Account", "Advertisement", "Bookmark", "Comment", "Comparison",
  "ComparisonCategory", "Fact", "Faq", "Feature", "FeatureCategory",
  "ForumCategory", "ForumPost", "ForumTopic", "NewsArticle", "Notification",
  "Platform", "PlatformFeature", "Post", "PostCategory", "PricingTier",
  "Session", "SiteContent", "User", "VerificationToken"
];

const mockedSet = new Set(mockedModels);
const notMocked = allModels.filter(m => !mockedSet.has(m));

console.log("=== TOTAL MODELS:", allModels.length);
console.log("=== EXPLICITLY MOCKED:", mockedModels.length);
console.log("=== NOT MOCKED:", notMocked.length);
console.log("\nMissing models:");
notMocked.forEach(m => console.log(" -", m));
