import prisma from "../src/lib/prisma";

async function seedDiscussions() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    console.error("No admin user found. Run standard seed first.");
    return;
  }

  // Define some really high-signal topics
  const topics = [
    {
      title: "Is Kajabi worth the premium price in 2024?",
      content:
        "I have been looking at Kajabi for my new high-ticket course. The pricing starts at $149/mo which is significantly higher than Teachable or Thinkific. Does the all-in-one nature really save enough on email marketing and landing page tools to justify it? I would love to hear from creators who scaled with it.",
      categorySlug: "platform-intelligence",
    },
    {
      title: "Optimal checkout flow for $497 courses?",
      content:
        "We are seeing a high drop-off rate at the payment step. Are you guys using one-page checkouts or multi-step? Also, does adding PayPal as an option actually increase conversion or just cannibalize Stripe payments?",
      categorySlug: "revenue-optimization",
    },
    {
      title: "How I automated my student onboarding with AI",
      content:
        "I recently set up a surgical automation using Zapier and OpenAI to analyze student intake forms and create a personalized learning path in our community. The engagement in week 1 skyrocketed. Has anyone else tried something similar?",
      categorySlug: "ai-automation",
    },
    {
      title: "The myth of organic traffic for course creators",
      content:
        "Everyone talks about SEO and YouTube, but I found that surgical $5/day Meta ad testing gave me way more reliable data than months of content creation. Is the organic path still viable for new founders without a massive headstart?",
      categorySlug: "growth-traffic",
    },
    {
      title: "Teachable vs. Thinkific for community features?",
      content:
        "I want to move away from Facebook Groups. Which of these two platforms has a better built-in community experience for students currently? I have heard Thinkific's newer community module is better but Teachable's is more integrated.",
      categorySlug: "platform-intelligence",
    },
    {
      title: "Waitlist strategies that actually convert",
      content:
        "We are launching a new module in 4 weeks. What are your best waitlist high-signal triggers? We were thinking of a $1 waitlist fee to verify intent but I am worried about friction.",
      categorySlug: "revenue-optimization",
    },
  ];

  for (const t of topics) {
    const category = await prisma.forumCategory.findUnique({
      where: { slug: t.categorySlug },
    });

    if (category) {
      await prisma.forumTopic.upsert({
        where: { id: `seed-topic-${t.categorySlug}` }, // Simple ID for seeding
        update: {},
        create: {
          id: `seed-topic-${t.categorySlug}`,
          title: t.title,
          content: t.content,
          categoryId: category.id,
          authorId: admin.id,
          status: "APPROVED",
        },
      });
      console.log(`✓ Seeded topic: ${t.title}`);
    } else {
      console.warn(`! Category not found for slug: ${t.categorySlug}`);
    }
  }
}

seedDiscussions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
