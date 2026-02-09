import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
  { params }: { params: { model: string } },
) {
  const model = params.model;

  if (!VALID_MODELS.includes(model)) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
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

    const items = await (prisma as any)[model].findMany({
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

    const total = await (prisma as any)[model].count({ where });

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
  { params }: { params: { model: string } },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const model = params.model;
  if (!VALID_MODELS.includes(model)) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Add authorId if needed
    if (
      ["post", "newsArticle", "forumTopic", "forumPost", "comment"].includes(
        model,
      ) &&
      !body.authorId
    ) {
      body.authorId = session.user.id;
    }

    const item = await (prisma as any)[model].create({
      data: body,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
