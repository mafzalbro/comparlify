import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { getContent } from "@/lib/content";
import { BlogPostBody } from "./_components/blog-post-body";

export const revalidate = 3600;
export const dynamicParams = true;

export const generateStaticParams = cache(async () => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return posts.map((post: { slug: string }) => ({ slug: post.slug }));
  } catch (err) {
    console.warn(
      "[generateStaticParams] blog/[slug] DB unreachable during build:",
      err,
    );
    return [];
  }
});

const getPostData = cache(async (slug: string) => {
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
    include: {
      author: true,
      category: true,
      platforms: true,
      facts: true,
      faqs: true,
      sources: true,
      comments: {
        where: { status: "APPROVED" },
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    return {
      post: null,
      relatedPosts: [],
      nextPost: null,
      prevPost: null,
      trendingComparisons: [],
    };
  }

  const content = await getContent();
  const isCompareEnabled = content["module.compare.enabled"] !== "false";

  const [relatedPosts, nextPost, prevPost, trendingComparisons] =
    await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          id: { not: post.id },
          authorId: post.authorId,
        },
        take: 3,
        select: {
          slug: true,
          title: true,
          image: true,
          dataAiHint: true,
          description: true,
        },
      }),
      post.nextId
        ? prisma.post.findFirst({
            where: { id: post.nextId, published: true },
            select: { slug: true, title: true },
          })
        : Promise.resolve(null),
      post.previousId
        ? prisma.post.findFirst({
            where: { id: post.previousId, published: true },
            select: { slug: true, title: true },
          })
        : Promise.resolve(null),
      isCompareEnabled
        ? prisma.comparison.findMany({
            where: { published: true },
            take: 2,
            orderBy: { createdAt: "desc" },
            include: { platformA: true, platformB: true },
          })
        : Promise.resolve([]),
    ]);

  return { post, relatedPosts, nextPost, prevPost, trendingComparisons };
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const { post } = await getPostData(slug);
  if (!post) return {};

  return generateSeoMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.description,
    image: post.image.replace("400/250", "800/400"),
    keywords: post.keywords || undefined,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const content = await getContent();
  const { post, relatedPosts, nextPost, prevPost, trendingComparisons } =
    await getPostData(slug);

  if (!post) notFound();

  return (
    <BlogPostBody
      post={post}
      relatedPosts={relatedPosts}
      nextPost={nextPost}
      prevPost={prevPost}
      trendingComparisons={trendingComparisons}
      session={null}
      content={content}
      mode="public"
    />
  );
}
