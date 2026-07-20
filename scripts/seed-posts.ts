import prisma from "../src/lib/prisma";

async function seedPosts() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const bob = await prisma.user.findFirst({
    where: { email: "maf415415@gmail.com" },
  });

  if (!admin || !bob) {
    console.error("Users not found. Seed users first.");
    return;
  }

  const posts = [
    {
      topicId: "seed-topic-platform-intelligence",
      authorId: bob.id,
      content:
        "I shifted from Teachable to Kajabi last year. The automation and email integration is definitely worth it once you pass $5k/mo, but before that, keep the overhead low.",
    },
    {
      topicId: "seed-topic-platform-intelligence",
      authorId: admin.id,
      content:
        "Solid point. The 'all-in-one' trap is real if you're not actually using the advanced marketing features yet.",
    },
    {
      topicId: "seed-topic-revenue-optimization",
      authorId: admin.id,
      content:
        "We tested Apple Pay on checkout recently and saw a 12% lift in mobile conversions. Definitely worth looking into.",
    },
    {
      topicId: "seed-topic-ai-automation",
      authorId: bob.id,
      content:
        "This is brilliant. How are you handling the OpenAI token costs for high volume student cohorts?",
    },
  ];

  for (const post of posts) {
    await prisma.forumPost.create({
      data: {
        ...post,
        status: "APPROVED",
      },
    });
    console.log(`✓ Seeded reply in topic: ${post.topicId}`);
  }
}

seedPosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
