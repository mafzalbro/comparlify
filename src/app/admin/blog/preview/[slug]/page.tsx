import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getContent } from "@/lib/content";
import { BlogPostBody } from "@/app/(main)/blog/[slug]/_components/blog-post-body";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

// Admin preview must stay dynamic.
export const dynamic = "force-dynamic";

const getPreviewData = cache(async (slug: string) => {
  const post = await prisma.post.findFirst({
    where: { slug },
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
            where: { id: post.nextId },
            select: { slug: true, title: true },
          })
        : Promise.resolve(null),
      post.previousId
        ? prisma.post.findFirst({
            where: { id: post.previousId },
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
  const { post } = await getPreviewData(slug);
  return {
    title: post ? `Preview: ${post.title}` : "Preview",
    robots: { index: false, follow: false },
  };
}

export default async function PreviewBlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin/blog/preview/${slug}`);
  }

  const content = await getContent();
  const { post, relatedPosts, nextPost, prevPost, trendingComparisons } =
    await getPreviewData(slug);

  if (!post) notFound();

  return (
    <div>
      <Alert
        variant="default"
        className="sticky top-0 z-50 rounded-none border-b-2 border-l-0 border-r-0 border-t-0 border-yellow-500 bg-yellow-50 text-yellow-900"
      >
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <div>
              <AlertTitle className="font-bold text-sm">
                {content["blog.post.preview.title"] || "Preview Mode"}
              </AlertTitle>
              <AlertDescription className="text-xs">
                {content["blog.post.preview.subtitle"] ||
                  `You are viewing "${post.title}" — ${
                    post.published ? "published" : "unpublished draft"
                  }.`}
              </AlertDescription>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-yellow-300 hover:bg-yellow-100 h-8"
          >
            <Link href={`/admin/blog/edit/${post.id}`}>
              {content["blog.post.preview.exitButton"] || "Edit Post"}
            </Link>
          </Button>
        </div>
      </Alert>

      <BlogPostBody
        post={post}
        relatedPosts={relatedPosts}
        nextPost={nextPost}
        prevPost={prevPost}
        trendingComparisons={trendingComparisons}
        session={session}
        content={content}
        mode="preview"
      />
    </div>
  );
}
