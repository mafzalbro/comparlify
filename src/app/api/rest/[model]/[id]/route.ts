import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
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

export async function GET(
  request: Request,
  props: { params: Promise<{ model: string; id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  const params = await props.params;
  const { model, id } = params;

  if (!VALID_MODELS.includes(model)) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
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
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  const params = await props.params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { model, id } = params;
  if (!VALID_MODELS.includes(model)) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Remove fixed fields that shouldn't be updated manually or might cause issues
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
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  const params = await props.params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { model, id } = params;
  if (!VALID_MODELS.includes(model)) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
  }

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
