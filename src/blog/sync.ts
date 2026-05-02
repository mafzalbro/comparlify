import prisma from "@/lib/prisma";
import { allPosts } from "./posts";

export async function syncBlogData() {
  console.log("🔄 Starting blog data sync...");

  for (const data of allPosts) {
    console.log(`📝 Syncing blog post: ${data.title}`);

    // 1. Find the author
    const author = await prisma.user.findUnique({
      where: { email: data.authorEmail },
    });

    if (!author) {
      console.warn(`⚠️ Author not found for email: ${data.authorEmail}. Skipping post: ${data.title}`);
      continue;
    }

    // 2. Find or create category
    let category = await prisma.postCategory.findFirst({
      where: { name: data.categoryName },
    });

    if (!category) {
      category = await prisma.postCategory.create({
        data: {
          name: data.categoryName,
          slug: data.categoryName.toLowerCase().replace(/\s+/g, "-"),
        },
      });
    }

    // 3. Find platform IDs for linking
    const platforms = data.platformNames
      ? await prisma.platform.findMany({
          where: { name: { in: data.platformNames } },
          select: { id: true }
        })
      : [];

    // 4. Upsert Post
    const post = await prisma.post.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        description: data.description,
        content: data.content,
        image: data.image,
        dataAiHint: data.dataAiHint,
        published: data.published ?? false,
        categoryId: category.id,
        authorId: author.id,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords ? data.keywords.join(", ") : null,
        authorRole: data.authorRole,
        authorBio: data.authorBio,
        authorCredentials: data.authorCredentials,
        keyTakeaways: data.keyTakeaways as any,
        checklist: data.checklist as any,
        platforms: {
          set: platforms.map(p => ({ id: p.id }))
        }
      },
      create: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        image: data.image,
        dataAiHint: data.dataAiHint,
        published: data.published ?? false,
        categoryId: category.id,
        authorId: author.id,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        authorRole: data.authorRole,
        authorBio: data.authorBio,
        authorCredentials: data.authorCredentials,
        keyTakeaways: data.keyTakeaways as any,
        checklist: data.checklist as any,
        platforms: {
          connect: platforms.map(p => ({ id: p.id }))
        }
      },
    });

    // 5. Sync Facts
    await prisma.postFact.deleteMany({
      where: { postId: post.id },
    });
    if (data.facts && data.facts.length > 0) {
      await prisma.postFact.createMany({
        data: data.facts.map((fact) => ({
          ...fact,
          postId: post.id,
        })),
      });
    }

    // 6. Sync FAQs
    await prisma.postFaq.deleteMany({
      where: { postId: post.id },
    });
    if (data.faqs && data.faqs.length > 0) {
      await prisma.postFaq.createMany({
        data: data.faqs.map((faq) => ({
          ...faq,
          postId: post.id,
        })),
      });
    }
  }

  console.log("✅ Blog data sync complete.");
}
