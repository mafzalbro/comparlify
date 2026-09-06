import prisma from "@/lib/prisma";
import { allPosts } from "./posts";

export async function syncBlogData() {
  console.log("🔄 Starting blog data sync...");

  for (const data of allPosts) {
    const existingPost = await prisma.post.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existingPost) {
      console.log(`⏩ Blog post already seeded, skipping: ${data.title}`);
      continue;
    }

    console.log(`📝 Syncing blog post: ${data.title}`);

    // 1. Find the author
    const author = await prisma.user.findUnique({
      where: { email: data.authorEmail },
    });

    if (!author) {
      console.warn(
        `⚠️ Author not found for email: ${data.authorEmail}. Skipping post: ${data.title}`,
      );
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
          select: { id: true },
        })
      : [];

    // 4. Create Post safely
    let post: any;
    const isMongo = process.env.DATABASE_URL?.startsWith("mongodb://") || process.env.DATABASE_URL?.startsWith("mongodb+srv://") || process.env.DATABASE_PROVIDER === "mongodb";

    const postData: any = {
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
    };

    if (isMongo) {
      const doc = {
        _id: `c${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`,
        ...postData,
        createdAt: { $date: new Date().toISOString() },
        updatedAt: { $date: new Date().toISOString() },
      };
      await (prisma as any).$runCommandRaw({
        insert: "Post",
        documents: [doc],
      });
      post = { id: doc._id, ...doc };
      if (platforms.length > 0) {
        for (const p of platforms) {
          await (prisma as any).$runCommandRaw({
            update: "Post",
            updates: [
              {
                q: { _id: post.id },
                u: { $addToSet: { platformIds: p.id } }
              }
            ]
          });
        }
      }
    } else {
      post = await prisma.post.create({
        data: {
          ...postData,
          platforms: {
            connect: platforms.map((p: any) => ({ id: p.id })),
          },
        },
      });
    }

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

    // 7. Sync Sources
    await prisma.postSource.deleteMany({
      where: { postId: post.id },
    });
    if (data.sources && data.sources.length > 0) {
      await prisma.postSource.createMany({
        data: data.sources.map((source) => ({
          ...source,
          postId: post.id,
        })),
      });
    }
  }

  console.log("✅ Blog data sync complete.");
}
