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
  props: { params: Promise<{ model: string; id: string }> },
) {
  // 1. Block browser/unauthorized access with 404
  if (!isAuthorized(request)) {
    return redirectToNotFound(request);
  }

  const params = await props.params;
  const { model, id } = params;

  // 2. Hide invalid models with 404
  if (!VALID_MODELS.includes(model)) {
    return redirectToNotFound(request);
  }

  try {
    const item = await (prisma as any)[model].findUnique({
      where: { id },
      include:
        model === "post"
          ? { category: true, author: { select: { name: true, image: true } } }
          : model === "comparison"
            ? {
                category: true,
                platformA: true,
                platformB: true,
                facts: true,
                faqs: true,
              }
            : undefined,
    });

    // If item doesn't exist, return a JSON 404 (since this is a valid API request)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ model: string; id: string }> },
) {
  // 1. Block browser/unauthorized access with 404
  if (!isAuthorized(request)) {
    return redirectToNotFound(request);
  }

  const params = await props.params;
  const { model, id } = params;

  // 2. Hide invalid models with 404
  if (!VALID_MODELS.includes(model)) {
    return redirectToNotFound(request);
  }

  // NOTE: We removed auth() check here. The API Key is the only gatekeeper now.
  
  try {
    const body = await request.json();

    // Remove fixed fields that shouldn't be updated manually
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;

    const item = await (prisma as any)[model].update({
      where: { id },
      data: body,
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ model: string; id: string }> },
) {
  // 1. Block browser/unauthorized access with 404
  if (!isAuthorized(request)) {
    return redirectToNotFound(request);
  }

  const params = await props.params;
  const { model, id } = params;

  // 2. Hide invalid models with 404
  if (!VALID_MODELS.includes(model)) {
    return redirectToNotFound(request);
  }

  // NOTE: We removed auth() check here. The API Key is the only gatekeeper now.

  try {
    await (prisma as any)[model].delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}