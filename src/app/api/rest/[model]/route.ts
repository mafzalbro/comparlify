import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthorized } from "@/lib/api-auth";

const VALID_MODELS = [
  "post",
  "comparison",
  "postCategory",
  "comparisonCategory",
  "platform",
  "feature",
  "featureCategory",
  "newsArticle",
  "forumTopic",
  "forumPost",
  "forumCategory",
  "comment",
  "fact",
  "faq",
  "tool",
  "advertisement",
];

// Helper to redirect to the 404 page
const redirectToNotFound = (request: Request) => {
  return NextResponse.redirect(new URL("/404", request.url));
};

export async function GET(
  request: Request,
  props: { params: Promise<{ model: string }> },
) {
  if (!isAuthorized(request)) {
    return redirectToNotFound(request);
  }

  const params = await props.params;
  const model = params.model;

  // Hide invalid models by redirecting to 404 instead of returning 400
  if (!VALID_MODELS.includes(model)) {
    return redirectToNotFound(request);
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Generic filtering
    const where: any = {};
    searchParams.forEach((value, key) => {
      if (!["limit", "page", "include"].includes(key)) {
        // Handle boolean strings
        if (value === "true") where[key] = true;
        else if (value === "false") where[key] = false;
        else where[key] = value;
      }
    });

    const modelClient = (prisma as any)[model];
    if (!modelClient) {
      return redirectToNotFound(request);
    }

    const items = await modelClient.findMany({
      where,
      take: limit,
      skip: skip,
      orderBy: { createdAt: "desc" },
      include:
        model === "post"
          ? { category: true, author: { select: { name: true, image: true } } }
          : model === "comparison"
            ? { category: true, platformA: true, platformB: true }
            : undefined,
    });

    const total = await modelClient.count({ where });

    return NextResponse.json({
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ model: string }> },
) {
  // If no valid API key, redirect the browser to the 404 page
  if (!isAuthorized(request)) {
    return redirectToNotFound(request);
  }

  const params = await props.params;
  const model = params.model;

  // Hide invalid models by redirecting to 404
  if (!VALID_MODELS.includes(model)) {
    return redirectToNotFound(request);
  }

  try {
    const body = await request.json();

    const modelClient = (prisma as any)[model];
    if (!modelClient) {
      return redirectToNotFound(request);
    }

    const item = await modelClient.create({
      data: body,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}